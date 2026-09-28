"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useMusicKit } from "@/hooks/useMusicKit";
import { PageHeader } from "@/components/common/page-header";
import { ArtistCard } from "@/components/artists/artist-card";
import { GridCardSkeleton } from "@/components/common/skeletons";
import type { Track } from "@/lib/types/music";

export default function TopArtistsPage() {
  const { dataset, status } = useMusicKit();
  const { topTracksAllTime, topArtists } = dataset;
  const isLoading = status === "connecting";
  const [query, setQuery] = useState("");

  const topTrackByArtist = useMemo(() => {
    const map = new Map<string, Track>();
    topTracksAllTime.forEach((track) => {
      if (!map.has(track.artist)) map.set(track.artist, track);
    });
    return map;
  }, [topTracksAllTime]);

  const artists = useMemo(() => {
    if (!query.trim()) return topArtists;
    const q = query.toLowerCase();
    return topArtists.filter((a) => a.name.toLowerCase().includes(q));
  }, [topArtists, query]);

  return (
    <div>
      <PageHeader
        eyebrow="Ranking"
        title="Top artyści"
        subtitle="Wykonawcy, których słuchasz najczęściej"
        action={
          <div className="relative w-full sm:w-60">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj artysty"
              className="w-full rounded-full border border-hairline bg-surface py-2 pl-9 pr-3.5 text-xs text-ink placeholder:text-ink-faint outline-none focus:border-accent/40 transition-colors"
            />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => <GridCardSkeleton key={i} />)
          : artists.map((artist, i) => (
              <ArtistCard key={artist.id} artist={artist} topTrack={topTrackByArtist.get(artist.name)} index={i} />
            ))}
      </div>

      {!isLoading && artists.length === 0 && (
        <p className="py-16 text-center text-sm text-ink-faint">Nie znaleziono artystów.</p>
      )}
    </div>
  );
}
