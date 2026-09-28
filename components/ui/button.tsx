"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-[#ff5f6d] to-[#fc3c6a] text-white shadow-[0_8px_24px_-8px_rgba(252,60,106,0.65)] hover:brightness-110 active:brightness-95",
  secondary: "bg-surface-2 text-ink hover:bg-surface-3 border border-hairline",
  ghost: "text-ink-soft hover:text-ink hover:bg-surface",
  outline: "border border-hairline text-ink hover:bg-surface",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-full gap-1.5",
  md: "h-10 px-4 text-sm rounded-full gap-2",
  lg: "h-12 px-6 text-sm rounded-full gap-2",
  icon: "h-9 w-9 rounded-full",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium tracking-tight transition-all duration-200 ease-out disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
