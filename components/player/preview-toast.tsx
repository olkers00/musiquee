"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SpotifyGlyph } from "@/components/common/spotify-glyph";
import { usePlayer } from "@/hooks/usePlayer";

export function PreviewToast() {
  const { toast } = usePlayer();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-spotify/25 bg-canvas/95 px-4 py-2.5 text-xs font-medium text-ink shadow-pop glass-strong lg:bottom-6"
          role="status"
        >
          <SpotifyGlyph className="h-3.5 w-3.5 shrink-0 text-spotify" />
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
