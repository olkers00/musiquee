"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TrackArtworkProps {
  src: string;
  alt: string;
  size?: number;
  rounded?: string;
  isActive?: boolean;
  isPlaying?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function TrackArtwork({
  src,
  alt,
  size = 48,
  rounded = "rounded-lg",
  isActive = false,
  isPlaying = false,
  onToggle,
  className,
}: TrackArtworkProps) {
  // Rendered as a <div> (never a <button>) because every caller already
  // places this inside its own clickable row/button — a nested <button>
  // would be invalid HTML and break hydration.
  return (
    <div
      role={onToggle ? "button" : undefined}
      tabIndex={onToggle ? -1 : undefined}
      onClick={onToggle}
      className={cn(
        "group relative shrink-0 overflow-hidden bg-surface-2 transition-transform duration-200 ease-out",
        onToggle && "cursor-pointer hover:scale-[1.03]",
        isActive && "ring-2 ring-accent/70",
        rounded,
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        unoptimized
        className="h-full w-full object-cover"
      />
      {onToggle && (
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
            isActive && isPlaying && "opacity-100 bg-black/35"
          )}
        >
          {isActive && isPlaying ? (
            <Pause className="h-1/3 w-1/3 fill-white text-white" />
          ) : (
            <Play className="h-1/3 w-1/3 fill-white text-white" />
          )}
        </span>
      )}
      {isActive && isPlaying && (
        <span className="absolute bottom-1 left-1 flex items-end gap-[2px] h-2.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-[2px] rounded-full bg-accent"
              style={{
                animation: `eq 0.9s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </span>
      )}
      <style jsx>{`
        @keyframes eq {
          0%, 100% { height: 3px; }
          50% { height: 10px; }
        }
      `}</style>
    </div>
  );
}
