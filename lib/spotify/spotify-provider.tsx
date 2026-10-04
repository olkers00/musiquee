"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Artist, Dataset, TimeRange, Track } from "@/lib/types/music";
import { getDemoDataset } from "@/lib/mock/demo-data";
import { hasSpotifyClientId } from "./config";
import { isConnected, logout, redirectToSpotifyAuthorize } from "./auth";
import { getAverageDanceability, getRecentlyPlayed, getTopArtists, getTopTracks } from "./api";
import { buildDataset } from "./dataset";
import { SpotifyApiError } from "./client";

export type SpotifyMode = "demo" | "spotify";
export type SpotifyStatus = "connecting" | "connected" | "error";

export interface SpotifyContextValue {
  mode: SpotifyMode;
  status: SpotifyStatus;
  dataset: Dataset;
  errorMessage: string | null;
  hasClientId: boolean;
  connect: () => void;
  disconnect: () => void;
  useDemoMode: () => void;
  notifyAuthenticated: () => void;
}

export const SpotifyContext = createContext<SpotifyContextValue | null>(null);

const RANGES: TimeRange[] = ["short_term", "medium_term", "long_term"];

async function fetchRealDataset(): Promise<Dataset> {
  const topTracksEntries = await Promise.all(RANGES.map((range) => getTopTracks(range).then((t) => [range, t] as const)));
  const topArtistsEntries = await Promise.all(RANGES.map((range) => getTopArtists(range).then((a) => [range, a] as const)));

  const topTracksByRange = Object.fromEntries(topTracksEntries) as Record<TimeRange, Track[]>;
  const topArtistsByRange = Object.fromEntries(topArtistsEntries) as Record<TimeRange, Artist[]>;

  const [recentlyPlayed, avgDanceability] = await Promise.all([
    getRecentlyPlayed(),
    getAverageDanceability(topTracksByRange.medium_term.map((t) => t.id)),
  ]);

  return buildDataset({ topTracksByRange, topArtistsByRange, recentlyPlayed, avgDanceability });
}

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SpotifyMode>("demo");
  const [status, setStatus] = useState<SpotifyStatus>("connecting");
  const [dataset, setDataset] = useState<Dataset>(() => getDemoDataset());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authNonce, setAuthNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isConnected()) {
        setMode("demo");
        setDataset(getDemoDataset());
        setErrorMessage(null);
        setStatus("connected");
        return;
      }

      setStatus("connecting");
      try {
        const real = await fetchRealDataset();
        if (cancelled) return;
        setDataset(real);
        setMode("spotify");
        setErrorMessage(null);
        setStatus("connected");
      } catch (err) {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error("[Musiquee/Spotify] Failed to load real dataset:", err);
        logout();
        setMode("demo");
        setDataset(getDemoDataset());
        setErrorMessage(
          err instanceof SpotifyApiError
            ? "Nie udało się pobrać danych ze Spotify — spróbuj połączyć się ponownie."
            : `Wystąpił błąd połączenia ze Spotify${err instanceof Error ? `: ${err.message}` : ""}.`
        );
        setStatus("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [authNonce]);

  const connect = useCallback(() => {
    void redirectToSpotifyAuthorize();
  }, []);

  const disconnect = useCallback(() => {
    logout();
    setMode("demo");
    setDataset(getDemoDataset());
    setErrorMessage(null);
    setStatus("connected");
  }, []);

  const useDemoMode = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const notifyAuthenticated = useCallback(() => {
    setAuthNonce((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      status,
      dataset,
      errorMessage,
      hasClientId: hasSpotifyClientId(),
      connect,
      disconnect,
      useDemoMode,
      notifyAuthenticated,
    }),
    [mode, status, dataset, errorMessage, connect, disconnect, useDemoMode, notifyAuthenticated]
  );

  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
}
