"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Disc3, History, LayoutGrid, ListMusic, Menu, Mic2, X } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils/cn";
import { ConnectAppleMusicButton } from "@/components/common/connect-apple-music-button";
import { AppThemeSwitcher } from "@/components/common/app-theme-switcher";

const NAV_ITEMS = [
  { href: "/", label: "Pulpit", icon: LayoutGrid },
  { href: "/top-tracks", label: "Top 50 utworów", icon: ListMusic },
  { href: "/top-artists", label: "Top artyści", icon: Mic2 },
  { href: "/top-albums", label: "Top albumy", icon: Disc3 },
  { href: "/history", label: "Historia", icon: History },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="flex lg:hidden items-center justify-between border-b border-hairline bg-canvas/80 px-4 py-3.5 backdrop-blur-xl sticky top-0 z-40">
        <Logo />
        <div className="flex items-center gap-2">
          <AppThemeSwitcher />
          <button
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-ink"
            aria-label="Otwórz menu"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="fixed right-0 top-0 z-50 h-full w-[80%] max-w-xs glass-strong p-5 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <Logo />
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2"
                  aria-label="Zamknij menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                        active ? "bg-surface-2 text-ink" : "text-ink-soft hover:text-ink hover:bg-surface"
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto space-y-4">
                <div className="h-px bg-hairline" />
                <ConnectAppleMusicButton compact />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
