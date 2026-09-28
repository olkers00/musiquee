"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import type { Track } from "@/lib/types/music";
import { usePlayer } from "@/hooks/usePlayer";
import MusicArtwork from "@/components/ui/music-artwork";
import { Card } from "@/components/ui/card";
import { formatPopularity } from "@/lib/utils/format";

export function NumberOneCard({ track }: { track: Track }) {
  const { currentTrack, isPlaying, play, toggle } = usePlayer();
  const isActive = currentTrack?.id === track.id;

  return (
    <Card className="relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
      <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto sm:mx-0"
        >
          <MusicArtwork
            artist={track.artist}
            music={track.title}
            albumArt={track.artwork}
            isSong
            isPlaying={isActive && isPlaying}
            onToggle={() => (isActive ? toggle() : play(track))}
            size={188}
          />
        </motion.div>

        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
            <Crown className="h-3 w-3" />
            Utwór numer 1
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{track.title}</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {track.artist} · {track.album}
          </p>
          <p className="mt-4 text-xs text-ink-faint">
            Popularność {formatPopularity(track.popularity)}/100 · Najedź na okładkę, aby zobaczyć winyl
          </p>
        </div>
      </div>
    </Card>
  );
}
