"use client";

import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpotify } from "@/hooks/useSpotify";
import { Button } from "@/components/ui/button";
import { SpotifyGlyph } from "@/components/common/spotify-glyph";

export function ConnectSpotifyButton({ compact = false }: { compact?: boolean }) {
  const { mode, status, connect, switchAccount, hasClientId, errorMessage } = useSpotify();
  const [showInfo, setShowInfo] = useState(false);

  const isConnecting = status === "connecting";
  const isConnected = mode === "spotify" && status === "connected";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Button variant="secondary" size={compact ? "sm" : "md"} onClick={switchAccount} className="w-full">
            <LogOut className="h-3.5 w-3.5" />
            Wyloguj / Zmień konto
          </Button>
        ) : (
          <Button
            variant="spotify"
            size={compact ? "sm" : "md"}
            onClick={() => {
              if (!hasClientId) {
                setShowInfo(true);
                return;
              }
              connect();
            }}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <SpotifyGlyph />}
            {isConnecting ? "Łączenie…" : "Połącz ze Spotify"}
          </Button>
        )}

        {isConnected && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-spotify/25 bg-spotify-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-spotify">
            <span className="h-1.5 w-1.5 rounded-full bg-spotify shadow-[0_0_6px_theme(colors.spotify)]" />
            Połączono
          </span>
        )}
      </div>

      <AnimatePresence>
        {(showInfo || errorMessage) && !hasClientId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border border-hairline bg-surface-2 p-3 text-xs leading-relaxed text-ink-soft"
          >
            Brak identyfikatora aplikacji Spotify. Dodaj{" "}
            <code className="rounded bg-surface-3 px-1 py-0.5 text-[11px] text-ink">
              NEXT_PUBLIC_SPOTIFY_CLIENT_ID
            </code>{" "}
            w pliku <code className="rounded bg-surface-3 px-1 py-0.5 text-[11px] text-ink">.env.local</code>, aby
            połączyć prawdziwe konto — albo zostań w trybie demo, w pełni funkcjonalnym bez konfiguracji.
          </motion.div>
        )}
        {errorMessage && hasClientId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border border-hairline bg-surface-2 p-3 text-xs leading-relaxed text-ink-soft"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
