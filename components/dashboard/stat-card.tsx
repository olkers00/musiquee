"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
  accent?: boolean | "spotify";
  delay?: number;
}

export function StatCard({ label, value, sublabel, icon: Icon, accent = false, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="relative overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-0.5">
        <div
          className={cn(
            "absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-30",
            accent === "spotify" ? "bg-spotify" : accent ? "bg-accent" : "bg-white"
          )}
        />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-ink-soft">{label}</p>
            <p className="mt-1.5 text-[26px] font-semibold tracking-tight text-ink">{value}</p>
            {sublabel && <p className="mt-1 text-xs text-ink-faint">{sublabel}</p>}
          </div>
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full",
              accent === "spotify"
                ? "bg-spotify-soft text-spotify"
                : accent
                  ? "bg-accent-soft text-accent"
                  : "bg-surface-2 text-ink-soft"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
