"use client";

import { useState } from "react";
import { Loader2, Sparkles, Unlink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpotify } from "@/hooks/useSpotify";
import { Button } from "@/components/ui/button";

function SpotifyGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Zm4.586 14.424a.624.624 0 0 1-.858.208c-2.35-1.436-5.305-1.76-8.786-.964a.624.624 0 1 1-.278-1.217c3.809-.87 7.076-.496 9.714 1.115.295.181.388.567.208.858Zm1.223-2.722a.781.781 0 0 1-1.073.257c-2.688-1.652-6.786-2.131-9.965-1.166a.781.781 0 1 1-.454-1.495c3.63-1.102 8.147-.568 11.235 1.331.368.226.484.708.257 1.073Zm.105-2.834C14.98 8.977 9.082 8.788 5.65 9.82a.937.937 0 1 1-.544-1.793c3.94-1.196 10.487-.965 14.63 1.494a.938.938 0 0 1-.822 1.685v-.06Z" />
    </svg>
  );
}

export function ConnectSpotifyButton({ compact = false }: { compact?: boolean }) {
  const { mode, status, connect, disconnect, useDemoMode, hasClientId, errorMessage } = useSpotify();
  const [showInfo, setShowInfo] = useState(false);

  const isConnecting = status === "connecting";
  const isConnected = mode === "spotify" && status === "connected";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Button variant="secondary" size={compact ? "sm" : "md"} onClick={disconnect} className="w-full">
            <Unlink className="h-3.5 w-3.5" />
            Rozłącz Spotify
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
