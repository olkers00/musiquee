"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useSpotify } from "@/hooks/useSpotify";
import { PageHeader } from "@/components/common/page-header";
import { AlbumCard } from "@/components/albums/album-card";
import { GridCardSkeleton } from "@/components/common/skeletons";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TIME_RANGE_LABELS, type Track, type TimeRange } from "@/lib/types/music";

const RANGE_OPTIONS = (Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((value) => ({
  value,
  label: TIME_RANGE_LABELS[value],
}));

export default function TopAlbumsPage() {
  const { dataset, status } = useSpotify();
  const isLoading = status === "connecting";
  const [range, setRange] = useState<TimeRange>("medium_term");
  const [query, setQuery] = useState("");

  const topTracks = dataset.topTracks[range];
  const topAlbums = dataset.topAlbums[range];

  const sampleTrackByAlbum = useMemo(() => {
    const map = new Map<string, Track>();
    topTracks.forEach((track) => {
      const key = `${track.artist}::${track.album}`;
      if (!map.has(key)) map.set(key, track);
    });
    return map;
  }, [topTracks]);

  const albums = useMemo(() => {
    if (!query.trim()) return topAlbums;
    const q = query.toLowerCase();
    return topAlbums.filter(
      (a) => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)
    );
  }, [topAlbums, query]);

  return (
    <div>
      <PageHeader
        eyebrow="Ranking"
        title="Top albumy"
        subtitle="Albumy najczęściej reprezentowane w Twoim Top 50 utworów"
        action={
          <div className="relative w-full sm:w-60">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj albumu"
              className="w-full rounded-full border border-hairline bg-surface py-2 pl-9 pr-3.5 text-xs text-ink placeholder:text-ink-faint outline-none focus:border-accent/40 transition-colors"
            />
          </div>
        }
      />

      <div className="mb-5">
        <SegmentedControl options={RANGE_OPTIONS} value={range} onChange={setRange} />
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => <GridCardSkeleton key={i} />)
          : albums.map((album, i) => (
              <AlbumCard
                key={album.id}
                album={album}
                sampleTrack={sampleTrackByAlbum.get(`${album.artist}::${album.title}`)}
                index={i}
              />
            ))}
      </div>

      {!isLoading && albums.length === 0 && (
        <p className="py-16 text-center text-sm text-ink-faint">Nie znaleziono albumów.</p>
      )}
    </div>
  );
}
