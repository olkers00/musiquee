"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-0.5 rounded-full border border-hairline bg-surface p-1",
        className
      )}
      role="tablist"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative z-10 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 whitespace-nowrap",
              active ? "text-white" : "text-ink-soft hover:text-ink"
            )}
          >
            {active && (
              <motion.span
                layoutId={`segmented-${options.map((o) => o.value).join("-")}`}
                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-b from-[#ff5f6d] to-[#fc3c6a] shadow-[0_4px_16px_-4px_rgba(252,60,106,0.7)]"
                transition={{ type: "spring", stiffness: 500, damping: 36 }}
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
