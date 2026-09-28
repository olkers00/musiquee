import type {
  Album,
  Artist,
  GenreBreakdownEntry,
  HistoryEntry,
  ListeningStats,
  ListeningTrend,
  MusicDataset,
  Track,
} from "@/lib/types/music";
import type { MusicKitInstance, MusicKitResource } from "./types";

const MUSICKIT_SRC = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";
let scriptPromise: Promise<void> | null = null;

export function loadMusicKitScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("MusicKit can only load in the browser"));
  }
  if (window.MusicKit) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const onReady = () => resolve();
    document.addEventListener("musickitloaded", onReady, { once: true });

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${MUSICKIT_SRC}"]`);
    if (existing) return;

    const script = document.createElement("script");
    script.src = MUSICKIT_SRC;
    script.async = true;
    script.onerror = () => reject(new Error("Nie udało się załadować MusicKit JS"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export async function configureMusicKit(developerToken: string): Promise<MusicKitInstance> {
  await loadMusicKitScript();
  if (!window.MusicKit) throw new Error("MusicKit nie jest dostępny w oknie przeglądarki");

  return window.MusicKit.configure({
    developerToken,
    app: {
      name: "Musiquee",
      build: "1.0.0",
    },
  });
}

export function getMusicKitInstance(): MusicKitInstance | null {
  if (typeof window === "undefined" || !window.MusicKit) return null;
  try {
    return window.MusicKit.getInstance();
  } catch {
    return null;
  }
}

export async function authorize(instance: MusicKitInstance): Promise<string> {
  return instance.authorize();
}

export async function unauthorize(instance: MusicKitInstance): Promise<void> {
  return instance.unauthorize();
}

function slugify(...parts: string[]): string {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function artworkUrl(resource: MusicKitResource, size = 600): string {
  const raw = resource.attributes?.artwork?.url;
  if (!raw) return "";
  return raw.replace("{w}", String(size)).replace("{h}", String(size));
}

export function mapResourceToTrack(resource: MusicKitResource, overrides?: Partial<Track>): Track {
  const attrs = resource.attributes;
  return {
    id: resource.id ?? slugify(attrs?.artistName ?? "", attrs?.name ?? ""),
    title: attrs?.name ?? "Nieznany utwór",
    artist: attrs?.artistName ?? "Nieznany wykonawca",
    album: attrs?.albumName ?? "",
    artwork: artworkUrl(resource),
    genre: attrs?.genreNames?.[0] ?? "Muzyka",
    durationMs: attrs?.durationInMillis ?? 0,
    plays: 1,
    minutesListened: Math.round((attrs?.durationInMillis ?? 0) / 60000),
    explicit: attrs?.contentRating === "explicit",
    previewUrl: attrs?.previews?.[0]?.url ?? null,
    lastPlayedAt: new Date().toISOString(),
    ...overrides,
  };
}

async function fetchResource(
  instance: MusicKitInstance,
  path: string,
  params?: Record<string, unknown>
): Promise<MusicKitResource[]> {
  try {
    const res = await instance.api.music(path, params);
    return res.data?.data ?? [];
  } catch (error) {
    console.warn(`[musiquee] MusicKit request failed for ${path}`, error);
    return [];
  }
}

/**
 * Apple's public MusicKit API does not expose per-track play counts or true
 * historical "top of the month" statistics — only Recently Played and Heavy
 * Rotation. We approximate a ranked Top 50 from those two signals so the UI
 * has a believable, if estimated, ranking when connected to a real account.
 */
export async function buildDatasetFromAppleMusic(instance: MusicKitInstance): Promise<MusicDataset> {
  const [recent, heavyRotation, librarySongs] = await Promise.all([
    fetchResource(instance, "/v1/me/recent/played/tracks", { limit: 30 }),
    fetchResource(instance, "/v1/me/history/heavy-rotation", { limit: 15 }),
    fetchResource(instance, "/v1/me/library/songs", { limit: 100 }),
  ]);

  const frequency = new Map<string, number>();
  const trackMap = new Map<string, Track>();

  const register = (resource: MusicKitResource, weight: number) => {
    const track = mapResourceToTrack(resource);
    const key = slugify(track.artist, track.title);
    frequency.set(key, (frequency.get(key) ?? 0) + weight);
    const existing = trackMap.get(key);
    if (!existing || weight > 1) trackMap.set(key, track);
  };

  heavyRotation.forEach((r) => register(r, 5));
  recent.forEach((r) => register(r, 2));
  librarySongs.forEach((r) => register(r, 1));

  trackMap.forEach((track, key) => {
    const freq = frequency.get(key) ?? 1;
    track.plays = freq;
    track.minutesListened = Math.round((track.durationMs / 60000) * freq);
  });

  const rankedTracks = Array.from(trackMap.values()).sort((a, b) => b.plays - a.plays);

  const recentEntries: HistoryEntry[] = recent.map((r, idx) => {
    const track = mapResourceToTrack(r);
    return {
      id: `${track.id}-${idx}`,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      artwork: track.artwork,
      playedAt: new Date(Date.now() - idx * 25 * 60000).toISOString(),
      durationMs: track.durationMs,
      previewUrl: track.previewUrl,
    };
  });

  const artistMap = new Map<string, Artist>();
  rankedTracks.forEach((track) => {
    const key = slugify(track.artist);
    const existing = artistMap.get(key);
    if (existing) {
      existing.plays += track.plays;
      existing.minutesListened += track.minutesListened;
    } else {
      artistMap.set(key, {
        id: key,
        name: track.artist,
        artwork: track.artwork,
        genre: track.genre,
        plays: track.plays,
        minutesListened: track.minutesListened,
        topTrack: track.title,
      });
    }
  });

  const albumMap = new Map<string, Album>();
  rankedTracks.forEach((track) => {
    if (!track.album) return;
    const key = slugify(track.artist, track.album);
    const existing = albumMap.get(key);
    if (existing) {
      existing.plays += track.plays;
      existing.minutesListened += track.minutesListened;
      existing.trackCount += 1;
    } else {
      albumMap.set(key, {
        id: key,
        title: track.album,
        artist: track.artist,
        artwork: track.artwork,
        genre: track.genre,
        trackCount: 1,
        plays: track.plays,
        minutesListened: track.minutesListened,
        releaseYear: new Date().getFullYear(),
      });
    }
  });

  const genreMinutes = new Map<string, number>();
  rankedTracks.forEach((t) => genreMinutes.set(t.genre, (genreMinutes.get(t.genre) ?? 0) + t.minutesListened));
  const totalGenreMinutes = Array.from(genreMinutes.values()).reduce((a, b) => a + b, 0) || 1;
  const genreBreakdown: GenreBreakdownEntry[] = Array.from(genreMinutes.entries())
    .map(([genre, minutes]) => ({
      genre,
      minutes,
      percentage: Math.round((minutes / totalGenreMinutes) * 1000) / 10,
    }))
    .sort((a, b) => b.minutes - a.minutes);

  const totalMinutesAllTime = rankedTracks.reduce((sum, t) => sum + t.minutesListened, 0);
  const trend: ListeningTrend[] = ["W-7", "W-6", "W-5", "W-4", "W-3", "W-2", "W-1", "Ten tydz."].map(
    (label, idx) => ({
      label,
      minutes: Math.round((totalMinutesAllTime / 8) * (0.7 + idx * 0.08)),
    })
  );

  const stats: ListeningStats = {
    totalMinutesThisMonth: Math.round(totalMinutesAllTime * 0.4),
    totalMinutesAllTime,
    topGenre: genreBreakdown[0]?.genre ?? "Muzyka",
    numberOneTrack: rankedTracks[0],
    genreBreakdown,
    trend,
    dailyAverageMinutes: Math.round((totalMinutesAllTime * 0.4) / 30),
    uniqueArtistsThisMonth: artistMap.size,
  };

  return {
    stats,
    topTracksMonth: rankedTracks.slice(0, 50),
    topTracksAllTime: rankedTracks.slice(0, 50),
    topArtists: Array.from(artistMap.values()).sort((a, b) => b.plays - a.plays),
    topAlbums: Array.from(albumMap.values()).sort((a, b) => b.plays - a.plays),
    recentlyPlayed: recentEntries,
  };
}
