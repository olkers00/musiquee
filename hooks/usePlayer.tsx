"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { PlayableTrack } from "@/lib/types/music";
import { SynthPreviewPlayer } from "@/lib/player/synth-preview";

const PREVIEW_CAP_SEC = 30;

interface PlayerContextValue {
  currentTrack: PlayableTrack | null;
  isPlaying: boolean;
  isBuffering: boolean;
  progressSec: number;
  durationSec: number;
  isSynthesized: boolean;
  play: (track: PlayableTrack) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  stop: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayableTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progressSec, setProgressSec] = useState(0);
  const [durationSec, setDurationSec] = useState(PREVIEW_CAP_SEC);
  const [isSynthesized, setIsSynthesized] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SynthPreviewPlayer | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;
    synthRef.current = new SynthPreviewPlayer();

    return () => {
      audio.pause();
      audio.src = "";
      synthRef.current?.stop();
    };
  }, []);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    synthRef.current?.stop();
    setIsPlaying(false);
    setProgressSec(0);
  }, []);

  const play = useCallback((track: PlayableTrack) => {
    const audio = audioRef.current;
    const synth = synthRef.current;
    if (!audio || !synth) return;

    audio.pause();
    synth.stop();

    const capSec = Math.min(PREVIEW_CAP_SEC, (track.durationMs || PREVIEW_CAP_SEC * 1000) / 1000);
    setCurrentTrack(track);
    setProgressSec(0);
    setDurationSec(capSec);

    if (track.previewUrl) {
      setIsSynthesized(false);
      setIsBuffering(true);
      audio.src = track.previewUrl;
      audio.currentTime = 0;
      audio
        .play()
        .then(() => {
          setIsBuffering(false);
          setIsPlaying(true);
        })
        .catch(() => {
          setIsBuffering(false);
          setIsPlaying(false);
        });
    } else {
      setIsSynthesized(true);
      setIsBuffering(false);
      setIsPlaying(true);
      synth.play(
        track.id,
        capSec,
        (seconds) => setProgressSec(seconds),
        () => {
          setIsPlaying(false);
          setProgressSec(0);
        }
      );
    }
  }, []);

  const toggle = useCallback(() => {
    if (!currentTrack) return;
    const audio = audioRef.current;
    const synth = synthRef.current;

    if (isPlaying) {
      if (isSynthesized) {
        const elapsed = synth?.pause() ?? progressSec;
        setProgressSec(elapsed);
      } else {
        audio?.pause();
      }
      setIsPlaying(false);
    } else {
      if (isSynthesized) {
        synth?.play(
          currentTrack.id,
          durationSec,
          (seconds) => setProgressSec(seconds),
          () => {
            setIsPlaying(false);
            setProgressSec(0);
          },
          progressSec
        );
        setIsPlaying(true);
      } else {
        audio?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrack, isPlaying, isSynthesized, progressSec, durationSec]);

  const seek = useCallback(
    (seconds: number) => {
      const clamped = Math.max(0, Math.min(seconds, durationSec));
      setProgressSec(clamped);
      if (!currentTrack) return;

      if (isSynthesized) {
        synthRef.current?.stop();
        if (isPlaying) {
          synthRef.current?.play(
            currentTrack.id,
            durationSec,
            (s) => setProgressSec(s),
            () => {
              setIsPlaying(false);
              setProgressSec(0);
            },
            clamped
          );
        }
      } else if (audioRef.current) {
        audioRef.current.currentTime = clamped;
      }
    },
    [currentTrack, durationSec, isPlaying, isSynthesized]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgressSec(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setProgressSec(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const value = useMemo<PlayerContextValue>(
    () => ({
      currentTrack,
      isPlaying,
      isBuffering,
      progressSec,
      durationSec,
      isSynthesized,
      play,
      toggle,
      seek,
      stop,
    }),
    [currentTrack, isPlaying, isBuffering, progressSec, durationSec, isSynthesized, play, toggle, seek, stop]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider");
  return ctx;
}
