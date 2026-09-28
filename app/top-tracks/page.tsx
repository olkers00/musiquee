"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useSpotify } from "@/hooks/useSpotify";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TrackRow } from "@/components/tracks/track-row";
import { TrackRowSkeleton } from "@/components/common/skeletons";
import { TIME_RANGE_LABELS, type TimeRange } from "@/lib/types/music";

const RANGE_OPTIONS = (Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((value) => ({
  value,
  label: TIME_RANGE_LABELS[value],
}));

export default function TopTracksPage() {
  const { dataset, status } = useSpotify();
  const isLoading = status === "connecting";

  const [range, setRange] = useState<TimeRange>("medium_term");
  const [query, setQuery] = useState("");

  const filteredTracks = useMemo(() => {
    const tracks = dataset.topTracks[range];
    if (!query.trim()) return tracks;
    const q = query.toLowerCase();
    return tracks.filter((t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));
  }, [dataset, range, query]);

  return (
    <div>
      <PageHeader
        eyebrow="Ranking"
        title="Top 50 utworów"
        subtitle="Najczęściej odtwarzane utwory wg algorytmu Spotify"
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl options={RANGE_OPTIONS} value={range} onChange={setRange} />

        <div className="relative w-full sm:w-60">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj utworu lub artysty"
            className="w-full rounded-full border border-hairline bg-surface py-2 pl-9 pr-3.5 text-xs text-ink placeholder:text-ink-faint outline-none focus:border-accent/40 transition-colors"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-3">
          <div className="hidden items-center gap-3.5 px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-ink-faint sm:flex">
            <span className="w-6 text-center">#</span>
            <span className="w-12" />
            <span className="flex-1">Tytuł</span>
            <span className="w-24 shrink-0 text-right sm:text-left">Popularność</span>
            <span className="w-12 shrink-0 text-right">Czas</span>
          </div>
          <div className="space-y-0.5">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => <TrackRowSkeleton key={i} />)
            ) : filteredTracks.length === 0 ? (
              <p className="px-3 py-10 text-center text-sm text-ink-faint">
                Brak utworów spełniających kryteria.
              </p>
            ) : (
              filteredTracks.map((track, i) => (
                <TrackRow key={track.id} track={track} rank={i + 1} index={i} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
