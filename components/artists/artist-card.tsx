"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import type { Artist } from "@/lib/types/music";
import { openSpotifyLink } from "@/lib/utils/spotify-link";

export function ArtistCard({ artist, rank, index = 0 }: { artist: Artist; rank?: number; index?: number }) {
  const handleOpen = () => openSpotifyLink(artist.externalUrl);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.035, 0.4) }}
      className="group"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleOpen()}
        className="relative overflow-hidden rounded-full shadow-glass transition-transform duration-300 ease-out group-hover:scale-[1.03] aspect-square cursor-pointer"
      >
        <Image
          src={artist.artwork}
          alt={artist.name}
          width={280}
          height={280}
          unoptimized
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg">
            <ExternalLink className="h-4 w-4 text-black" />
          </span>
        </div>
        {rank !== undefined && (
          <span className="absolute left-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-black/55 px-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
            {rank}
          </span>
        )}
      </div>
      <div className="mt-3 text-center">
        <p className="truncate text-sm font-semibold text-ink">{artist.name}</p>
        {artist.genres.length > 0 && (
          <p className="mt-0.5 truncate text-xs text-ink-faint">{artist.genres.slice(0, 2).join(", ")}</p>
        )}
      </div>
    </motion.div>
  );
}
