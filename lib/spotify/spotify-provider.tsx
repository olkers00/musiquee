"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Artist, Dataset, TimeRange, Track } from "@/lib/types/music";
import { getDemoDataset } from "@/lib/mock/demo-data";
import { hasSpotifyClientId } from "./config";
import { isConnected, logout, redirectToSpotifyAuthorize } from "./auth";
import { getArtistsByIds, getAverageDanceability, getRecentlyPlayed, getTopArtists, getTopTracks } from "./api";
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
  switchAccount: () => void;
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

  // Genres (and, as a last resort, popularity) live on Artist objects —
  // fetch every artist behind a top track that didn't already surface via
  // the Top Artists endpoint, even if that endpoint came back fully empty.
  const knownArtistIds = new Set(Object.values(topArtistsByRange).flatMap((artists) => artists.map((a) => a.id)));
  const missingArtistIds = Object.values(topTracksByRange)
    .flat()
    .map((t) => t.artistId)
    .filter((id): id is string => !!id && !knownArtistIds.has(id));

  const [recentlyPlayed, avgDanceability, extraGenreArtists] = await Promise.all([
    getRecentlyPlayed(),
    getAverageDanceability(topTracksByRange.medium_term.map((t) => t.id)),
    getArtistsByIds(missingArtistIds),
  ]);

  // Last-resort popularity backfill: Spotify very occasionally omits
  // popularity from both the Top Tracks response and the /tracks refetch
  // (getTopTracks already tries that). When a track still reads 0, use its
  // primary artist's popularity instead of showing a dead "0/100".
  const artistPopularityById = new Map<string, number>();
  for (const artist of [...Object.values(topArtistsByRange).flat(), ...extraGenreArtists]) {
    if (!artistPopularityById.has(artist.id)) artistPopularityById.set(artist.id, artist.popularity);
  }

  const patchedTopTracksByRange = Object.fromEntries(
    Object.entries(topTracksByRange).map(([range, tracks]) => [
      range,
      tracks.map((t) => {
        if (t.popularity > 0 || !t.artistId) return t;
        const artistPopularity = artistPopularityById.get(t.artistId);
        return artistPopularity ? { ...t, popularity: artistPopularity } : t;
      }),
    ])
  ) as Record<TimeRange, Track[]>;

  return buildDataset({
    topTracksByRange: patchedTopTracksByRange,
    topArtistsByRange,
    recentlyPlayed,
    avgDanceability,
    extraGenreArtists,
  });
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

  const switchAccount = useCallback(() => {
    logout();
    void redirectToSpotifyAuthorize(true);
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
      switchAccount,
      useDemoMode,
      notifyAuthenticated,
    }),
    [mode, status, dataset, errorMessage, connect, disconnect, switchAccount, useDemoMode, notifyAuthenticated]
  );

  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
}
