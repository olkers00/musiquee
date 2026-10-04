"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Playable } from "@/lib/types/music";

const PREVIEW_UNAVAILABLE_MESSAGE = "Próbka niedostępna w API Spotify — otwieranie w Spotify...";
const PREVIEW_UNAVAILABLE_DEMO_MESSAGE = "Próbka niedostępna w trybie demo — połącz się ze Spotify, aby odsłuchać podgląd.";
const TOAST_DURATION_MS = 4000;

interface PlayerContextValue {
  currentTrack: Playable | null;
  isPlaying: boolean;
  isBuffering: boolean;
  progressSec: number;
  durationSec: number;
  /** True once we've given up on the 30s preview for the current track
   *  (missing preview_url, or the audio element failed to load/play it). */
  previewUnavailable: boolean;
  toast: string | null;
  play: (track: Playable) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  stop: () => void;
  openCurrentInSpotify: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

/** Demo-mode tracks carry a generic "open.spotify.com" placeholder, not a
 *  real track permalink — only a genuine "/track/<id>" URL is worth
 *  auto-opening when a preview silently fails. */
function isRealSpotifyTrackUrl(url: string | undefined | null): boolean {
  return !!url && /open\.spotify\.com\/track\//.test(url);
}

function openInSpotify(track: Playable | null): void {
  if (track?.externalUrl) window.open(track.externalUrl, "_blank", "noopener,noreferrer");
}

function autoOpenInSpotify(track: Playable | null): void {
  if (isRealSpotifyTrackUrl(track?.externalUrl)) openInSpotify(track);
}

function previewFailureMessage(track: Playable | null): string {
  return isRealSpotifyTrackUrl(track?.externalUrl) ? PREVIEW_UNAVAILABLE_MESSAGE : PREVIEW_UNAVAILABLE_DEMO_MESSAGE;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentTrackRef = useRef<Playable | null>(null);
  const onPreviewFailureRef = useRef<() => void>(() => {});

  const [currentTrack, setCurrentTrack] = useState<Playable | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progressSec, setProgressSec] = useState(0);
  const [durationSec, setDurationSec] = useState(30);
  const [previewUnavailable, setPreviewUnavailable] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  const handlePreviewFailure = useCallback(() => {
    setIsPlaying(false);
    setIsBuffering(false);
    setPreviewUnavailable(true);
    showToast(previewFailureMessage(currentTrackRef.current));
    autoOpenInSpotify(currentTrackRef.current);
  }, [showToast]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    onPreviewFailureRef.current = handlePreviewFailure;
  }, [handlePreviewFailure]);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => setProgressSec(audio.currentTime);
    const onLoadedMetadata = () => {
      setDurationSec(Number.isFinite(audio.duration) ? Math.min(audio.duration, 30) : 30);
      setIsBuffering(false);
    };
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onEnded = () => {
      setIsPlaying(false);
      setProgressSec(0);
    };
    const onError = () => onPreviewFailureRef.current();

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const play = useCallback(
    (track: Playable) => {
      const audio = audioRef.current;

      audio?.pause();
      setCurrentTrack(track);
      currentTrackRef.current = track;
      setProgressSec(0);
      setDurationSec(30);

      if (!track.previewUrl || !audio) {
        setIsPlaying(false);
        setPreviewUnavailable(true);
        showToast(previewFailureMessage(track));
        autoOpenInSpotify(track);
        return;
      }

      setPreviewUnavailable(false);
      setIsPlaying(true);
      setIsBuffering(true);
      audio.src = track.previewUrl;
      audio.play().catch(() => onPreviewFailureRef.current());
    },
    [showToast]
  );

  const toggle = useCallback(() => {
    if (!currentTrack) return;

    if (previewUnavailable) {
      openInSpotify(currentTrack);
      return;
    }

    const audio = audioRef.current;
    if (isPlaying) {
      audio?.pause();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    void audio?.play().catch(() => onPreviewFailureRef.current());
  }, [currentTrack, isPlaying, previewUnavailable]);

  const seek = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!previewUnavailable && audio) {
        audio.currentTime = seconds;
      }
    },
    [previewUnavailable]
  );

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setCurrentTrack(null);
    currentTrackRef.current = null;
    setIsPlaying(false);
    setProgressSec(0);
    setPreviewUnavailable(false);
  }, []);

  const openCurrentInSpotify = useCallback(() => {
    openInSpotify(currentTrackRef.current);
  }, []);

  const value = useMemo(
    () => ({
      currentTrack,
      isPlaying,
      isBuffering,
      progressSec,
      durationSec,
      previewUnavailable,
      toast,
      play,
      toggle,
      seek,
      stop,
      openCurrentInSpotify,
    }),
    [currentTrack, isPlaying, isBuffering, progressSec, durationSec, previewUnavailable, toast, play, toggle, seek, stop, openCurrentInSpotify]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
