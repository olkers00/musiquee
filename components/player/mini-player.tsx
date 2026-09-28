"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Radio, X } from "lucide-react";
import { usePlayer } from "@/hooks/usePlayer";
import { TrackArtwork } from "@/components/ui/track-artwork";
import { cn } from "@/lib/utils/cn";

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MiniPlayer() {
  const { currentTrack, isPlaying, isBuffering, progressSec, durationSec, isSynthesized, toggle, seek, stop } =
    usePlayer();
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoverPct, setHoverPct] = useState<number | null>(null);

  const pct = durationSec > 0 ? Math.min(100, (progressSec / durationSec) * 100) : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    seek(ratio * durationSec);
  };

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 border-t border-hairline glass-strong"
        >
          <div
            ref={trackRef}
            onMouseMove={(e) => {
              if (!trackRef.current) return;
              const rect = trackRef.current.getBoundingClientRect();
              setHoverPct(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)) * 100);
            }}
            onMouseLeave={() => setHoverPct(null)}
            onClick={handleSeek}
            className="group relative h-1.5 w-full cursor-pointer bg-surface-2"
          >
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#ff5f6d] to-[#fc3c6a]"
              style={{ width: `${pct}%` }}
            />
            {hoverPct !== null && (
              <div
                className="absolute inset-y-0 w-px bg-white/40"
                style={{ left: `${hoverPct}%` }}
              />
            )}
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6">
            <TrackArtwork
              src={currentTrack.artwork}
              alt={currentTrack.title}
              size={44}
              isActive
              isPlaying={isPlaying}
              onToggle={toggle}
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{currentTrack.title}</p>
              <p className="truncate text-xs text-ink-soft">{currentTrack.artist}</p>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-medium text-ink-faint tabular-nums">
              <span>{formatClock(progressSec)}</span>
              <span>/</span>
              <span>{formatClock(durationSec)}</span>
            </div>

            {isSynthesized && (
              <span className="hidden md:inline-flex items-center gap-1 rounded-full border border-accent/25 bg-accent-soft px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-accent">
                <Radio className="h-2.5 w-2.5" />
                Podgląd demo
              </span>
            )}

            <button
              onClick={toggle}
              disabled={isBuffering}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform active:scale-95",
                isBuffering && "opacity-60"
              )}
              aria-label={isPlaying ? "Pauza" : "Odtwórz"}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-black" /> : <Play className="h-4 w-4 fill-black ml-0.5" />}
            </button>

            <button
              onClick={stop}
              className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-faint hover:text-ink hover:bg-surface-2 transition-colors"
              aria-label="Zamknij odtwarzacz"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
