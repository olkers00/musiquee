import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "default" | "accent" | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const variantStyles: Record<Variant, string> = {
  default: "bg-surface-2 text-ink-soft border border-hairline",
  accent: "bg-accent-soft text-accent border border-accent/20",
  outline: "border border-hairline text-ink-faint",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
