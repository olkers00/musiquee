"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "musiquee:theme";
const DEFAULT_MODE: ThemeMode = "dark";
const listeners = new Set<() => void>();

function readStoredMode(): ThemeMode {
  return (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? DEFAULT_MODE;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function writeStoredMode(mode: ThemeMode): void {
  localStorage.setItem(STORAGE_KEY, mode);
  listeners.forEach((listener) => listener());
}

function resolve(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode;
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", resolve(mode));
}

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(subscribe, readStoredMode, () => DEFAULT_MODE);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    if (mode !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyTheme("system");
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    writeStoredMode(next);
  }, []);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
