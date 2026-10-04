"use client";

import { motion } from "framer-motion";
import type { Track } from "@/lib/types/music";
import { usePlayer } from "@/hooks/usePlayer";
import { TrackArtwork } from "@/components/ui/track-artwork";
import { Badge } from "@/components/ui/badge";
import { OpenInSpotify } from "@/components/common/open-in-spotify";
import { formatDuration, formatPopularity } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface TrackRowProps {
  track: Track;
  rank?: number;
  index?: number;
  showAlbum?: boolean;
  dense?: boolean;
}

export function TrackRow({ track, rank, index = 0, showAlbum = true, dense = false }: TrackRowProps) {
  const { currentTrack, isPlaying, play, toggle } = usePlayer();
  const isActive = currentTrack?.id === track.id;

  const handleToggle = () => {
    if (isActive) toggle();
    else play(track);
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggle();
        }
      }}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.025, 0.4) }}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-3.5 rounded-xl px-3 text-left transition-colors duration-150 hover:bg-surface",
        dense ? "py-2" : "py-2.5",
        isActive && "bg-surface"
      )}
    >
      {rank !== undefined && (
        <span
          className={cn(
            "w-6 shrink-0 text-center text-sm tabular-nums font-medium",
            isActive ? "text-accent" : "text-ink-faint"
          )}
        >
          {rank}
        </span>
      )}

      <TrackArtwork
        src={track.artwork}
        alt={track.title}
        size={dense ? 40 : 48}
        isActive={isActive}
        isPlaying={isActive && isPlaying}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className={cn("truncate text-sm font-medium", isActive ? "text-accent" : "text-ink")}>{track.title}</p>
          {track.explicit && (
            <Badge variant="outline" className="shrink-0">
              E
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-ink-soft">
          {track.artist}
          {showAlbum && track.album && <span className="text-ink-faint"> — {track.album}</span>}
        </p>
      </div>

      <span className="hidden shrink-0 text-xs text-ink-faint tabular-nums sm:block">
        {formatPopularity(track.popularity)}
      </span>

      <span className="hidden shrink-0 w-12 text-right text-xs text-ink-faint tabular-nums md:block">
        {formatDuration(track.durationMs)}
      </span>

      <OpenInSpotify
        url={track.externalUrl}
        className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
      />
    </motion.div>
  );
}
