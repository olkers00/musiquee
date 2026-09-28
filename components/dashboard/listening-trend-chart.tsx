"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { PopularityTrendPoint } from "@/lib/types/music";
import { useMounted } from "@/hooks/useMounted";
import { ChartSkeleton } from "@/components/common/skeletons";

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs shadow-pop">
      <p className="font-semibold text-ink">{payload[0].value}/100 popularności</p>
    </div>
  );
}

export function ListeningTrendChart({ data }: { data: PopularityTrendPoint[] }) {
  const mounted = useMounted();

  return (
    <div className="h-56 w-full">
      {!mounted ? (
        <ChartSkeleton />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fc3c6a" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#fc3c6a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--ink-faint)", fontSize: 11 }}
              dy={8}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--hairline)" }} />
            <Area
              type="monotone"
              dataKey="popularity"
              stroke="#fc3c6a"
              strokeWidth={2.5}
              fill="url(#trendFill)"
              animationDuration={900}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
