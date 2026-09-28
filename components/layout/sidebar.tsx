"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Disc3, History, LayoutGrid, ListMusic, Mic2 } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils/cn";
import { ConnectSpotifyButton } from "@/components/common/connect-spotify-button";

const NAV_ITEMS = [
  { href: "/", label: "Pulpit", icon: LayoutGrid },
  { href: "/top-tracks", label: "Top 50 utworów", icon: ListMusic },
  { href: "/top-artists", label: "Top artyści", icon: Mic2 },
  { href: "/top-albums", label: "Top albumy", icon: Disc3 },
  { href: "/history", label: "Historia", icon: History },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex h-screen w-64 shrink-0 flex-col border-r border-hairline bg-canvas/60 px-4 py-6">
      <Link href="/" className="px-2 mb-8">
        <Logo />
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                active ? "text-ink" : "text-ink-soft hover:text-ink hover:bg-surface"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-surface-2 border border-hairline"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <Icon className="relative z-10 h-[18px] w-[18px]" strokeWidth={2} />
              <span className="relative z-10">{item.label}</span>
              {active && (
                <span className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_theme(colors.accent)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="h-px bg-hairline" />
        <ConnectSpotifyButton compact />
        <p className="px-1 text-[11px] leading-relaxed text-ink-faint">
          Musiquee analizuje Twoje statystyki lokalnie w przeglądarce — dane nie opuszczają Twojego urządzenia.
        </p>
      </div>
    </aside>
  );
}
