"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Album } from "@/lib/types/music";
import { openSpotifyLink } from "@/lib/utils/spotify-link";

export function AlbumCard({ album, index = 0 }: { album: Album; index?: number }) {
  const handleOpen = () => openSpotifyLink(album.externalUrl);

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
        className="relative overflow-hidden rounded-xl shadow-glass transition-transform duration-300 ease-out group-hover:scale-[1.03] aspect-square cursor-pointer"
      >
        <Image
          src={album.artwork}
          alt={album.title}
          width={280}
          height={280}
          unoptimized
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
