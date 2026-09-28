"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { MusicKitProvider } from "@/lib/musickit/musickit-provider";
import { PlayerProvider } from "@/hooks/usePlayer";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <MusicKitProvider>
        <PlayerProvider>{children}</PlayerProvider>
      </MusicKitProvider>
    </ThemeProvider>
  );
}
