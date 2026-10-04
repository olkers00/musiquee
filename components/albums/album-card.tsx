"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import type { Album, Track } from "@/lib/types/music";
import { usePlayer } from "@/hooks/usePlayer";
import { OpenInSpotify } from "@/components/common/open-in-spotify";
import { cn } from "@/lib/utils/cn";

export function AlbumCard({ album, sampleTrack, index = 0 }: { album: Album; sampleTrack?: Track; index?: number }) {
  const { currentTrack, isPlaying, play, toggle } = usePlayer();
  const isActive = sampleTrack ? currentTrack?.id === sampleTrack.id : false;

  const handleToggle = () => {
    if (!sampleTrack) return;
    if (isActive) toggle();
    else play(sampleTrack);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.035, 0.4) }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-xl shadow-glass transition-transform duration-300 ease-out group-hover:scale-[1.03] aspect-square">
        <Image
          src={album.artwork}
          alt={album.title}
          width={280}
          height={280}
          unoptimized
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {sampleTrack && (
          <button
            onClick={handleToggle}
            className={cn(
              "absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition-all duration-300 translate-y-1 group-hover:translate-y-0 group-hover:opacity-100",
              isActive && isPlaying && "opacity-100 translate-y-0"
            )}
            aria-label={`Odtwórz ${album.title}`}
          >
            {isActive && isPlaying ? (
              <Pause className="h-3.5 w-3.5 fill-black text-black" />
            ) : (
              <Play className="ml-0.5 h-3.5 w-3.5 fill-black text-black" />
            )}
          </button>
        )}
        <OpenInSpotify
          url={album.externalUrl}
          className="absolute left-2.5 top-2.5 h-7 w-7 bg-black/55 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
        />
      </div>
      <div className="mt-3">
        <p className="truncate text-sm font-semibold text-ink">{album.title}</p>
        <p className="mt-0.5 truncate text-xs text-ink-faint">
          {album.artist} · {album.releaseYear}
        </p>
      </div>
    </motion.div>
  );
}
