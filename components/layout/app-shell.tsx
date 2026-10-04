"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { MiniPlayer } from "@/components/player/mini-player";
import { PreviewToast } from "@/components/player/preview-toast";
import { AppThemeSwitcher } from "@/components/common/app-theme-switcher";
import { usePlayer } from "@/hooks/usePlayer";
import { cn } from "@/lib/utils/cn";

export function AppShell({ children }: { children: ReactNode }) {
  const { currentTrack } = usePlayer();

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main className={cn("flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10", currentTrack && "pb-28")}>
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
      <AppThemeSwitcher className="fixed top-4 right-4 z-50 hidden lg:block" />
      <MiniPlayer />
      <PreviewToast />
    </div>
  );
}
