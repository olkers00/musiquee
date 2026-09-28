"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { GenreBreakdownEntry } from "@/lib/types/music";
import { useMounted } from "@/hooks/useMounted";
import { ChartSkeleton } from "@/components/common/skeletons";

const COLORS = ["#fc3c6a", "#ff8a65", "#c026d3", "#43cbff", "#67f0c3", "#f6d242", "#8ec5fc"];

export function GenreBreakdown({ data }: { data: GenreBreakdownEntry[] }) {
  const mounted = useMounted();
  const top = data.slice(0, 6);

  return (
    <div className="flex items-center gap-6">
      <div className="h-36 w-36 shrink-0">
        {!mounted ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={top}
                dataKey="weight"
                nameKey="genre"
                innerRadius={44}
                outerRadius={64}
                paddingAngle={3}
                stroke="none"
                animationDuration={800}
              >
                {top.map((entry, idx) => (
                  <Cell key={entry.genre} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <ul className="flex-1 space-y-2.5 min-w-0">
        {top.map((entry, idx) => (
          <li key={entry.genre} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span className="truncate text-ink-soft flex-1">{entry.genre}</span>
            <span className="font-medium text-ink tabular-nums">{entry.percentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
