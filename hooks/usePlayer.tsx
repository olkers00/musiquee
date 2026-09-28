"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Playable } from "@/lib/types/music";

const SYNTHESIZED_DURATION_SEC = 30;

interface PlayerContextValue {
  currentTrack: Playable | null;
  isPlaying: boolean;
  isBuffering: boolean;
  progressSec: number;
  durationSec: number;
  isSynthesized: boolean;
  play: (track: Playable) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  stop: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Playable | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progressSec, setProgressSec] = useState(0);
  const [durationSec, setDurationSec] = useState(SYNTHESIZED_DURATION_SEC);
  const [isSynthesized, setIsSynthesized] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => setProgressSec(audio.currentTime);
    const onLoadedMetadata = () => {
      setDurationSec(Number.isFinite(audio.duration) ? Math.min(audio.duration, 30) : SYNTHESIZED_DURATION_SEC);
      setIsBuffering(false);
    };
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onEnded = () => {
      setIsPlaying(false);
      setProgressSec(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startSynthesizedTimer = useCallback(
    (fromSec: number) => {
      clearTimer();
      timerRef.current = setInterval(() => {
        setProgressSec((prev) => {
          const next = prev + 0.25;
          if (next >= SYNTHESIZED_DURATION_SEC) {
            clearTimer();
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 250);
      setProgressSec(fromSec);
    },
    [clearTimer]
  );

  const play = useCallback(
    (track: Playable) => {
      const audio = audioRef.current;
      const synthesized = !track.previewUrl;

      clearTimer();
      audio?.pause();

      setCurrentTrack(track);
      setIsSynthesized(synthesized);
      setProgressSec(0);
      setDurationSec(SYNTHESIZED_DURATION_SEC);
      setIsPlaying(true);

      if (synthesized || !audio) {
        startSynthesizedTimer(0);
        return;
      }

      setIsBuffering(true);
      audio.src = track.previewUrl!;
      void audio.play().catch(() => setIsPlaying(false));
    },
    [clearTimer, startSynthesizedTimer]
  );

  const toggle = useCallback(() => {
    if (!currentTrack) return;
    const audio = audioRef.current;

    if (isPlaying) {
      if (isSynthesized) clearTimer();
      else audio?.pause();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    if (isSynthesized) startSynthesizedTimer(progressSec);
    else void audio?.play().catch(() => setIsPlaying(false));
  }, [currentTrack, isPlaying, isSynthesized, progressSec, clearTimer, startSynthesizedTimer]);

  const seek = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (isSynthesized) {
        setProgressSec(seconds);
        if (isPlaying) startSynthesizedTimer(seconds);
      } else if (audio) {
        audio.currentTime = seconds;
      }
    },
    [isSynthesized, isPlaying, startSynthesizedTimer]
  );

  const stop = useCallback(() => {
    clearTimer();
    audioRef.current?.pause();
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgressSec(0);
  }, [clearTimer]);

  const value = useMemo(
    () => ({ currentTrack, isPlaying, isBuffering, progressSec, durationSec, isSynthesized, play, toggle, seek, stop }),
    [currentTrack, isPlaying, isBuffering, progressSec, durationSec, isSynthesized, play, toggle, seek, stop]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
