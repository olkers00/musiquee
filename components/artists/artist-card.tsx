"use client";

import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import Image from "next/image";
import type { Artist, Track } from "@/lib/types/music";
import { usePlayer } from "@/hooks/usePlayer";
import { formatListeningTime, formatPlays } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function ArtistCard({ artist, topTrack, index = 0 }: { artist: Artist; topTrack?: Track; index?: number }) {
  const { currentTrack, isPlaying, play, toggle } = usePlayer();
  const isActive = topTrack ? currentTrack?.id === topTrack.id : false;

  const handleToggle = () => {
    if (!topTrack) return;
    if (isActive) toggle();
    else play(topTrack);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.035, 0.4) }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-full shadow-glass transition-transform duration-300 ease-out group-hover:scale-[1.03] aspect-square">
        <Image
          src={artist.artwork}
          alt={artist.name}
          width={280}
          height={280}
          unoptimized
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {topTrack && (
          <button
            onClick={handleToggle}
            className={cn(
              "absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100",
              isActive && isPlaying && "opacity-100"
            )}
            aria-label={`Odtwórz ${artist.name}`}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg">
              {isActive && isPlaying ? (
                <Pause className="h-4 w-4 fill-black text-black" />
              ) : (
                <Play className="ml-0.5 h-4 w-4 fill-black text-black" />
              )}
            </span>
          </button>
        )}
      </div>
      <div className="mt-3 text-center">
        <p className="truncate text-sm font-semibold text-ink">{artist.name}</p>
        <p className="mt-0.5 truncate text-xs text-ink-faint">
          {formatPlays(artist.plays)} · {formatListeningTime(artist.minutesListened)}
        </p>
      </div>
    </motion.div>
  );
}
