"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { SpotifyProvider } from "@/lib/spotify/spotify-provider";
import { PlayerProvider } from "@/hooks/usePlayer";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SpotifyProvider>
        <PlayerProvider>{children}</PlayerProvider>
      </SpotifyProvider>
    </ThemeProvider>
  );
}
