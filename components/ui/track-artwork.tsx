"use client";

import Image from "next/image";
import { ExternalLink, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TrackArtworkProps {
  src: string;
  alt: string;
  size?: number;
  rounded?: string;
  blurred?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function TrackArtwork({
  src,
  alt,
  size = 48,
  rounded = "rounded-lg",
  blurred = false,
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
        className={cn("h-full w-full scale-110 object-cover", blurred && "blur-md saturate-75")}
      />
      {blurred ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
          <Lock className="h-1/3 w-1/3 text-white/80 transition-opacity duration-200 group-hover:opacity-0" />
          {onToggle && (
            <ExternalLink className="absolute h-1/3 w-1/3 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          )}
        </span>
      ) : (
        onToggle && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <ExternalLink className="h-1/3 w-1/3 text-white" />
          </span>
        )
      )}
    </div>
  );
}
