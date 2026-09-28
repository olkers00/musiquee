"use client";

import { useState } from "react";
import { Loader2, Music2, Sparkles, Unlink } from "lucide-react";
import { useMusicKit } from "@/hooks/useMusicKit";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function ConnectAppleMusicButton({ compact = false }: { compact?: boolean }) {
  const { mode, status, connect, disconnect, useDemoMode, hasDeveloperToken, errorMessage } = useMusicKit();
  const [showInfo, setShowInfo] = useState(false);

  const isConnecting = status === "connecting";
  const isConnected = mode === "apple-music" && status === "connected";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Button variant="secondary" size={compact ? "sm" : "md"} onClick={disconnect} className="w-full">
            <Unlink className="h-3.5 w-3.5" />
            Rozłącz Apple Music
          </Button>
        ) : (
          <Button
            variant="primary"
            size={compact ? "sm" : "md"}
            onClick={() => {
              if (!hasDeveloperToken) {
                setShowInfo(true);
                return;
              }
              void connect();
            }}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Music2 className="h-3.5 w-3.5" />
            )}
            {isConnecting ? "Łączenie…" : "Połącz z Apple Music"}
          </Button>
        )}

        {mode === "demo" && (
          <span className="inline-flex items-center gap-1 rounded-full border border-accent/25 bg-accent-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
            <Sparkles className="h-3 w-3" />
            Demo
          </span>
        )}
      </div>

      {mode !== "demo" && (
        <button
          onClick={useDemoMode}
          className="text-left text-xs text-ink-faint hover:text-ink-soft transition-colors"
        >
          Przełącz na tryb demo
        </button>
      )}

      <AnimatePresence>
        {(showInfo || errorMessage) && !hasDeveloperToken && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border border-hairline bg-surface-2 p-3 text-xs leading-relaxed text-ink-soft"
          >
            Brak klucza deweloperskiego Apple Music. Dodaj{" "}
            <code className="rounded bg-surface-3 px-1 py-0.5 text-[11px] text-ink">
              NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN
            </code>{" "}
            w pliku <code className="rounded bg-surface-3 px-1 py-0.5 text-[11px] text-ink">.env.local</code>, aby
            połączyć prawdziwe konto — albo zostań w trybie demo, w pełni funkcjonalnym bez konfiguracji.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
