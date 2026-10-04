"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { SpotifyProvider } from "@/lib/spotify/spotify-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SpotifyProvider>{children}</SpotifyProvider>
    </ThemeProvider>
  );
}
