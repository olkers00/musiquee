"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useMusicKit } from "@/hooks/useMusicKit";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TrackRow } from "@/components/tracks/track-row";
import { TrackRowSkeleton } from "@/components/common/skeletons";
import type { TimeRange, Track } from "@/lib/types/music";

type SortMode = "plays" | "recent";

export default function TopTracksPage() {
  const { dataset, status } = useMusicKit();
  const isLoading = status === "connecting";

  const [range, setRange] = useState<TimeRange>("month");
  const [sortMode, setSortMode] = useState<SortMode>("plays");
  const [query, setQuery] = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const sourceTracks: Track[] = useMemo(() => {
    if (range === "month") return dataset.topTracksMonth;
    if (range === "all") return dataset.topTracksAllTime;

    const from = customFrom ? new Date(customFrom).getTime() : -Infinity;
    const to = customTo ? new Date(customTo).getTime() + 86400000 : Infinity;
    return dataset.topTracksAllTime.filter((t) => {
      const played = new Date(t.lastPlayedAt).getTime();
      return played >= from && played <= to;
    });
  }, [range, dataset, customFrom, customTo]);

  const filteredTracks = useMemo(() => {
    let list = [...sourceTracks];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));
    }
    list.sort((a, b) =>
      sortMode === "plays"
        ? b.plays - a.plays
        : new Date(b.lastPlayedAt).getTime() - new Date(a.lastPlayedAt).getTime()
    );
    return list.slice(0, 50);
  }, [sourceTracks, query, sortMode]);

  return (
    <div>
      <PageHeader
        eyebrow="Ranking"
        title="Top 50 utworów"
        subtitle="Najczęściej odtwarzane utwory, z możliwością filtrowania w czasie"
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <SegmentedControl
            options={[
              { value: "month", label: "Ten miesiąc" },
              { value: "all", label: "Cały czas" },
              { value: "custom", label: "Zakres własny" },
            ]}
            value={range}
            onChange={setRange}
          />
          <SegmentedControl
            options={[
              { value: "plays", label: "Najczęściej odtwarzane" },
              { value: "recent", label: "Ostatnio słuchane" },
            ]}
            value={sortMode}
            onChange={setSortMode}
          />
        </div>

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

      {range === "custom" && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-hairline bg-surface px-4 py-3">
          <label className="flex items-center gap-2 text-xs text-ink-soft">
            Od
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-lg border border-hairline bg-surface-2 px-2 py-1 text-xs text-ink outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-soft">
            Do
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-lg border border-hairline bg-surface-2 px-2 py-1 text-xs text-ink outline-none"
            />
          </label>
        </div>
      )}

      <Card>
        <CardContent className="p-3">
          <div className="hidden items-center gap-3.5 px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-ink-faint sm:flex">
            <span className="w-6 text-center">#</span>
            <span className="w-12" />
            <span className="flex-1">Tytuł</span>
            <span className="w-24 shrink-0 text-right sm:text-left">Odtworzenia</span>
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
