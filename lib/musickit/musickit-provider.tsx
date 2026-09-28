"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ConnectionMode, MusicDataset } from "@/lib/types/music";
import { buildDemoDataset } from "@/lib/demo/demo-data";
import {
  authorize,
  buildDatasetFromAppleMusic,
  configureMusicKit,
  getMusicKitInstance,
  unauthorize,
} from "./musickit-service";
import type { MusicKitInstance } from "./types";

type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

interface MusicKitContextValue {
  mode: ConnectionMode;
  status: ConnectionStatus;
  dataset: MusicDataset;
  errorMessage: string | null;
  hasDeveloperToken: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  useDemoMode: () => void;
}

const MusicKitContext = createContext<MusicKitContextValue | null>(null);
const STORAGE_KEY = "musiquee:mode";

export function MusicKitProvider({ children }: { children: ReactNode }) {
  const developerToken = process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN ?? "";
  const hasDeveloperToken = developerToken.trim().length > 0;

  const demoDataset = useMemo(() => buildDemoDataset(), []);
  const [mode, setMode] = useState<ConnectionMode>("demo");
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [dataset, setDataset] = useState<MusicDataset>(demoDataset);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const instanceRef = useRef<MusicKitInstance | null>(null);

  const connectInternal = useCallback(async () => {
    if (!hasDeveloperToken) {
      setErrorMessage(
        "Brak klucza deweloperskiego Apple Music. Ustaw NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN, aby połączyć konto."
      );
      return;
    }

    setStatus("connecting");
    setErrorMessage(null);

    try {
      const instance = getMusicKitInstance() ?? (await configureMusicKit(developerToken));
      instanceRef.current = instance;

      if (!instance.isAuthorized) {
        await authorize(instance);
      }

      const liveDataset = await buildDatasetFromAppleMusic(instance);
      setDataset(liveDataset);
      setMode("apple-music");
      setStatus("connected");
      window.localStorage.setItem(STORAGE_KEY, "apple-music");
    } catch (error) {
      console.error("[musiquee] Apple Music connection failed", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? `Nie udało się połączyć z Apple Music: ${error.message}`
          : "Nie udało się połączyć z Apple Music."
      );
      setMode("demo");
      setDataset(demoDataset);
    }
  }, [developerToken, hasDeveloperToken, demoDataset]);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved !== "apple-music" || !hasDeveloperToken) return;
    // Deferred so the initial auto-reconnect never lands state updates
    // synchronously inside this effect's own commit.
    const timer = window.setTimeout(() => void connectInternal(), 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disconnect = useCallback(() => {
    const instance = instanceRef.current;
    if (instance) {
      void unauthorize(instance);
    }
    instanceRef.current = null;
    setMode("demo");
    setStatus("idle");
    setDataset(demoDataset);
    setErrorMessage(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, [demoDataset]);

  const useDemoModeFn = useCallback(() => {
    setMode("demo");
    setStatus("idle");
    setDataset(demoDataset);
    setErrorMessage(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, [demoDataset]);

  const value: MusicKitContextValue = {
    mode,
    status,
    dataset,
    errorMessage,
    hasDeveloperToken,
    connect: connectInternal,
    disconnect,
    useDemoMode: useDemoModeFn,
  };

  return <MusicKitContext.Provider value={value}>{children}</MusicKitContext.Provider>;
}

export function useMusicKit(): MusicKitContextValue {
  const ctx = useContext(MusicKitContext);
  if (!ctx) throw new Error("useMusicKit must be used within a MusicKitProvider");
  return ctx;
}
