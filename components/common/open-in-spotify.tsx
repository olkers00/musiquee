"use client";

import { SpotifyGlyph } from "@/components/common/spotify-glyph";
import { cn } from "@/lib/utils/cn";

export function OpenInSpotify({ url, className }: { url: string; className?: string }) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      aria-label="Otwórz w Spotify"
      title="Otwórz w Spotify"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full text-spotify transition-colors hover:text-spotify-2 hover:bg-spotify-soft",
        className
      )}
    >
      <SpotifyGlyph className="h-4 w-4" />
    </a>
  );
}
