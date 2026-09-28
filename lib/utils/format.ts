export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatListeningTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours <= 0) return `${mins} min`;
  if (hours < 24) return `${hours} godz. ${mins} min`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return `${days} dni ${remHours} godz.`;
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("pl-PL", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPlays(value: number): string {
  const rounded = Math.round(value);
  return `${new Intl.NumberFormat("pl-PL").format(rounded)} ${pluralOdtworzen(rounded)}`;
}

function pluralOdtworzen(n: number): string {
  if (n === 1) return "odtworzenie";
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) {
    return "odtworzenia";
  }
  return "odtworzeń";
}

export function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric" }).format(date);
}

export function formatRelativeDay(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Dziś";
  if (diffDays === 1) return "Wczoraj";
  if (diffDays < 7) return `${diffDays} dni temu`;
  return new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short" }).format(date);
}
