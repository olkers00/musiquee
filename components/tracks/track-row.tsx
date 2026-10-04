"use client";

import { motion } from "framer-motion";
import type { Track } from "@/lib/types/music";
import { useSpotify } from "@/hooks/useSpotify";
import { TrackArtwork } from "@/components/ui/track-artwork";
import { Badge } from "@/components/ui/badge";
import { formatDuration, formatPopularity } from "@/lib/utils/format";
import { openSpotifyLink } from "@/lib/utils/spotify-link";
import { cn } from "@/lib/utils/cn";

interface TrackRowProps {
  track: Track;
  rank?: number;
  index?: number;
  showAlbum?: boolean;
  dense?: boolean;
}

export function TrackRow({ track, rank, index = 0, showAlbum = true, dense = false }: TrackRowProps) {
  const { mode } = useSpotify();
  const locked = mode !== "spotify";

  const handleOpen = () => openSpotifyLink(track.externalUrl);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOpen();
        }
      }}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.025, 0.4) }}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-3.5 rounded-xl px-3 text-left transition-colors duration-150 hover:bg-surface",
        dense ? "py-2" : "py-2.5"
      )}
    >
      {rank !== undefined && (
        <span className="w-6 shrink-0 text-center text-sm tabular-nums font-medium text-ink-faint">{rank}</span>
      )}

      <TrackArtwork src={track.artwork} alt={track.title} size={dense ? 40 : 48} blurred={locked} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className={cn("truncate text-sm font-medium text-ink", locked && "blur-[5px] select-none")}>
            {track.title}
          </p>
          {track.explicit && !locked && (
            <Badge variant="outline" className="shrink-0">
              E
            </Badge>
          )}
        </div>
        <p className={cn("truncate text-xs text-ink-soft", locked && "blur-[5px] select-none")}>
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
    </motion.div>
  );
}
