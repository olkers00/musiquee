"use client";

import { useContext } from "react";
import { SpotifyContext, type SpotifyContextValue } from "@/lib/spotify/spotify-provider";

export function useSpotify(): SpotifyContextValue {
  const ctx = useContext(SpotifyContext);
  if (!ctx) throw new Error("useSpotify must be used within SpotifyProvider");
  return ctx;
}
