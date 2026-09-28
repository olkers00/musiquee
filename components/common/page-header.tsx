"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export function PageHeader({
  eyebrow,
  eyebrowClassName,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  eyebrowClassName?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-7 flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        {eyebrow && (
          <p className={cn("mb-1 text-xs font-semibold uppercase tracking-wider text-accent", eyebrowClassName)}>
            {eyebrow}
          </p>
        )}
        <h1 className="text-[26px] font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}
