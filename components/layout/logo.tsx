import { cn } from "@/lib/utils/cn";

export function LogoMark({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="mq-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff8a65" />
          <stop offset="45%" stopColor="#fc3c6a" />
          <stop offset="100%" stopColor="#c026d3" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#mq-grad)" />
      <rect width="40" height="40" rx="11" fill="black" fillOpacity="0.05" />
      <path
        d="M11 27V15.8c0-.7.46-1.3 1.14-1.47l6.4-1.65a1 1 0 0 1 1.24.97v9.2"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12.5" cy="27" r="3" fill="white" />
      <circle cx="27.5" cy="24.5" r="3" fill="white" />
      <path d="M11 18.4l9-2.2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {!iconOnly && (
        <span className="text-[17px] font-semibold tracking-tight text-ink">
          Musique<span className="text-gradient">e</span>
        </span>
      )}
    </div>
  );
}
