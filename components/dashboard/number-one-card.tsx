"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import type { Track } from "@/lib/types/music";
import { useSpotify } from "@/hooks/useSpotify";
import MusicArtwork from "@/components/ui/music-artwork";
import { Card } from "@/components/ui/card";
import { OpenInSpotify } from "@/components/common/open-in-spotify";
import { formatPopularity } from "@/lib/utils/format";
import { openSpotifyLink } from "@/lib/utils/spotify-link";
import { cn } from "@/lib/utils/cn";

export function NumberOneCard({ track }: { track: Track }) {
  const { mode } = useSpotify();
  const locked = mode !== "spotify";

  return (
    <Card className="relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-spotify/[0.06]" />
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
            blurred={locked}
            onToggle={() => openSpotifyLink(track.externalUrl)}
            size={188}
          />
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
              <Crown className="h-3 w-3" />
              Utwór numer 1
            </span>
            {!locked && (
              <OpenInSpotify
                url={track.externalUrl}
                className="h-7 w-7 border border-spotify/25 bg-spotify-soft"
              />
            )}
          </div>
          <h2
            className={cn(
              "mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl",
              locked && "blur-md select-none"
            )}
          >
            {track.title}
          </h2>
          <p className={cn("mt-1 text-sm text-ink-soft", locked && "blur-md select-none")}>
            {track.artist} · {track.album}
          </p>
          <p className="mt-4 text-xs text-ink-faint">
            {locked
              ? "Zaloguj się do Spotify, aby zobaczyć pełne dane"
              : `Popularność ${formatPopularity(track.popularity)}/100 · Otwórz w Spotify, aby posłuchać`}
          </p>
        </div>
      </div>
    </Card>
  );
}
