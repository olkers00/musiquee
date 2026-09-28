"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "musiquee:theme";
const SSR_DEFAULT_MODE: ThemeMode = "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", resolveTheme(mode));
}

function readStoredMode(): ThemeMode {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "light" || saved === "dark" || saved === "system" ? saved : SSR_DEFAULT_MODE;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always starts at the same value the server rendered (SSR has no access
  // to localStorage), so the first client render matches and hydrates
  // cleanly — the real stored mode is picked up right after mount instead.
  const [mode, setModeState] = useState<ThemeMode>(SSR_DEFAULT_MODE);

  useEffect(() => {
    // Deferred so this mount-time correction never lands a state update
    // synchronously inside the effect that reads it (and, more importantly,
    // strictly after the hydration commit, so it can never mismatch it).
    const timer = window.setTimeout(() => setModeState(readStoredMode()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      setModeState((current) => {
        if (current === "system") applyTheme("system");
        return current;
      });
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    setModeState(next);
  }, []);

  return <ThemeContext.Provider value={{ mode, setMode }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
