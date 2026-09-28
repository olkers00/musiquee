"use client";

import { motion } from "framer-motion";
import type { HistoryEntry } from "@/lib/types/music";
import { usePlayer } from "@/hooks/usePlayer";
import { TrackArtwork } from "@/components/ui/track-artwork";
import { cn } from "@/lib/utils/cn";

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export function HistoryRow({ entry, index = 0 }: { entry: HistoryEntry; index?: number }) {
  const { currentTrack, isPlaying, play, toggle } = usePlayer();
  const isActive = currentTrack?.id === entry.trackId;

  const handleToggle = () => {
    if (isActive) toggle();
    else
      play({
        id: entry.trackId,
        title: entry.title,
        artist: entry.artist,
        album: entry.album,
        artwork: entry.artwork,
        durationMs: entry.durationMs,
        previewUrl: entry.previewUrl,
      });
  };

  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.3) }}
      className={cn(
        "flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface",
        isActive && "bg-surface"
      )}
    >
      <TrackArtwork src={entry.artwork} alt={entry.title} size={44} isActive={isActive} isPlaying={isActive && isPlaying} />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", isActive ? "text-accent" : "text-ink")}>{entry.title}</p>
        <p className="truncate text-xs text-ink-soft">{entry.artist}</p>
      </div>
      <span className="shrink-0 text-xs text-ink-faint tabular-nums">{formatTime(entry.playedAt)}</span>
    </motion.button>
  );
}
