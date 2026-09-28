"use client";

import { useMemo } from "react";
import { useMusicKit } from "@/hooks/useMusicKit";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { HistoryRow } from "@/components/history/history-row";
import { TrackRowSkeleton } from "@/components/common/skeletons";
import { formatRelativeDay } from "@/lib/utils/format";
import type { HistoryEntry } from "@/lib/types/music";

export default function HistoryPage() {
  const { dataset, status } = useMusicKit();
  const { recentlyPlayed } = dataset;
  const isLoading = status === "connecting";

  const groups = useMemo(() => {
    const map = new Map<string, HistoryEntry[]>();
    recentlyPlayed.forEach((entry) => {
      const label = formatRelativeDay(new Date(entry.playedAt));
      const list = map.get(label) ?? [];
      list.push(entry);
      map.set(label, list);
    });
    return Array.from(map.entries());
  }, [recentlyPlayed]);

  return (
    <div>
      <PageHeader eyebrow="Aktywność" title="Historia odtwarzania" subtitle="Ostatnio odtworzone utwory" />

      {isLoading ? (
        <Card>
          <CardContent className="space-y-0.5 p-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <TrackRowSkeleton key={i} />
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map(([label, entries]) => (
            <div key={label}>
              <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-ink-faint">{label}</h2>
              <Card>
                <CardContent className="space-y-0.5 p-3">
                  {entries.map((entry, i) => (
                    <HistoryRow key={entry.id} entry={entry} index={i} />
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
