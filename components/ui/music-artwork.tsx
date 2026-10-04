"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MusicArtworkProps {
  artist: string;
  music: string;
  albumArt: string;
  isSong: boolean;
  isLoading?: boolean;
  blurred?: boolean;
  onToggle?: () => void;
  size?: number;
  className?: string;
}

/**
 * Signature hero artwork: hovering reveals a vinyl record sliding out from
 * behind the sleeve, spinning while hovered. Rotation speed differs for
 * songs (0.75 rev/s) vs. albums (0.55 rev/s), matching physical turntable feel.
 */
export default function MusicArtwork({
  artist,
  music,
  albumArt,
  isSong,
  isLoading = false,
  blurred = false,
  onToggle,
  size = 256,
  className,
}: MusicArtworkProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const spinDuration = isSong ? 1 / 0.75 : 1 / 0.55;

  useEffect(() => {
    if (!isHovered) return;
    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        const tooltipWidth = 260;
        const tooltipHeight = 52;
        const offset = 18;
        let x = e.clientX + offset;
        let y = e.clientY - tooltipHeight - 10;
        if (x + tooltipWidth > window.innerWidth) x = e.clientX - tooltipWidth - offset;
        if (y < 0) y = e.clientY + offset;
        if (y + tooltipHeight > window.innerHeight) y = e.clientY - tooltipHeight - offset;
        setMousePosition({ x, y });
      });
    };
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isHovered]);

  if (isLoading) {
    return (
      <div className="relative">
        <div className="skeleton rounded-2xl bg-surface-2" style={{ width: size, height: size }} />
      </div>
    );
  }

  const vinylSize = size * 1.05;

  return (
    <div className={cn("relative", className)}>
      {isHovered && !blurred && (
        <div
          className="fixed z-50 pointer-events-none hidden sm:block"
          style={{ left: mousePosition.x, top: mousePosition.y }}
        >
          <div className="glass-strong rounded-lg px-3.5 py-2 text-xs font-medium text-ink shadow-pop whitespace-nowrap animate-fade-up">
            <span className="font-bold text-gradient">{artist}</span>
            <span className="text-ink-faint"> &nbsp;•&nbsp; </span>
            {music}
          </div>
        </div>
      )}

      <div className="relative group">
        {/* Vinyl record sliding out on hover */}
        <div
          aria-hidden
          className={cn(
            "absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out",
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 pointer-events-none"
          )}
          style={{
            left: -vinylSize * 0.42,
            width: vinylSize,
            height: vinylSize,
            transform: `translateY(-50%) translateX(${isHovered ? 0 : vinylSize * 0.4}px)`,
          }}
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              animation: isHovered ? `vinyl-spin ${spinDuration}s linear infinite` : "none",
            }}
          >
            <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-2xl">
              <circle cx="100" cy="100" r="98" fill="#0b0b0d" />
              <circle cx="100" cy="100" r="98" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              {[88, 76, 64, 52, 40].map((r) => (
                <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth="1" />
              ))}
              <circle cx="100" cy="100" r="30" fill="url(#labelGradient)" />
              <circle cx="100" cy="100" r="4.5" fill="#0b0b0d" />
              <defs>
                <linearGradient id="labelGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ff5f6d" />
                  <stop offset="100%" stopColor="#fc3c6a" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Album artwork */}
        <div
          role={onToggle ? "button" : undefined}
          tabIndex={onToggle ? 0 : undefined}
          className="relative overflow-hidden rounded-2xl shadow-pop transition-transform duration-300 ease-out hover:scale-[1.02] cursor-pointer"
          style={{ width: size, height: size }}
          onMouseEnter={(e) => {
            setMousePosition({ x: e.clientX + 18, y: e.clientY - 62 });
            setIsHovered(true);
          }}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onToggle}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle?.()}
        >
          <Image
            src={albumArt}
            alt={`Okładka ${music}`}
            width={size}
            height={size}
            unoptimized
            className={cn(
              "h-full w-full object-cover transition-all duration-500 ease-out",
              !blurred && "group-hover:scale-105",
              blurred ? "scale-110 blur-xl saturate-75" : !imageLoaded ? "opacity-0" : "opacity-100"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          {!imageLoaded && <div className="absolute inset-0 skeleton bg-surface-2" />}

          {blurred ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md">
                <Lock className="h-4 w-4 text-white/85 transition-opacity duration-200 group-hover:opacity-0" />
                {onToggle && (
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <ExternalLink className="h-4 w-4 text-white" />
                  </span>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div
                className={cn(
                  "absolute bottom-3 left-3 right-3 flex items-center justify-between transition-all duration-300",
                  isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{music}</p>
                  <p className="truncate text-xs text-white/70">{artist}</p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-md">
                  <ExternalLink className="h-4 w-4 text-white" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
