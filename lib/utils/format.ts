export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatPopularity(popularity: number): string {
  return `${Math.round(popularity)}`;
}

export function formatFollowers(followers: number): string {
  if (followers >= 1_000_000) return `${(followers / 1_000_000).toFixed(1)} mln`;
  if (followers >= 1_000) return `${(followers / 1_000).toFixed(1)} tys.`;
  return String(followers);
}

export function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric" }).format(date);
}

export function formatRelativeDay(date: Date): string {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);

  if (diffDays === 0) return "Dzisiaj";
  if (diffDays === 1) return "Wczoraj";
  if (diffDays < 7) return new Intl.DateTimeFormat("pl-PL", { weekday: "long" }).format(date);
  return new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long" }).format(date);
}
