"use client";

import { ThemeSwitcher } from "@/components/ui/apple-liquid-glass-switcher";
import { useTheme, type ThemeMode } from "@/lib/theme/theme-provider";

type SwitcherValue = "light" | "dark" | "dim";

const TO_SWITCHER: Record<ThemeMode, SwitcherValue> = {
  light: "light",
  dark: "dark",
  system: "dim",
};

const TO_MODE: Record<SwitcherValue, ThemeMode> = {
  light: "light",
  dark: "dark",
  dim: "system",
};

/** "dim" in the switcher maps to "system" here — it follows the OS appearance. */
export function AppThemeSwitcher({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();

  return (
    <div className={className}>
      <ThemeSwitcher value={TO_SWITCHER[mode]} onValueChange={(v) => setMode(TO_MODE[v])} />
    </div>
  );
}
