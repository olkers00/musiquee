import { CATALOG } from "./catalog";
import { generateArtwork } from "./artwork";
import { createRng } from "./seed-random";
import type {
  Album,
  Artist,
  GenreBreakdownEntry,
  HistoryEntry,
  ListeningTrend,
  MusicDataset,
  Track,
} from "@/lib/types/music";

const DAY_MS = 24 * 60 * 60 * 1000;

function slugify(...parts: string[]): string {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildFlatTracks(): { track: Track; artistName: string; genre: string }[] {
  const rng = createRng("musiquee-catalog-v1");
  const now = Date.now();
  const flat: { track: Track; artistName: string; genre: string }[] = [];

  CATALOG.forEach((artist) => {
    artist.albums.forEach((album) => {
      album.tracks.forEach((t, idx) => {
        const id = slugify(artist.name, album.title, t.title);
        const basePlays = rng.float(2, 60);
        const daysAgo = rng.int(0, 29);
        const track: Track = {
          id,
          title: t.title,
          artist: artist.name,
          album: album.title,
          artwork: generateArtwork(slugify(artist.name, album.title)),
          genre: artist.genre,
          durationMs: t.durationMs,
          plays: Math.round(basePlays * (idx === 0 ? rng.float(1.4, 2.2) : 1)),
          minutesListened: 0,
          explicit: t.explicit,
          previewUrl: null,
          lastPlayedAt: new Date(now - daysAgo * DAY_MS - rng.int(0, DAY_MS)).toISOString(),
          addedToLibraryAt: new Date(
            now - (album.year ? (2026 - album.year) * 60 : 90) * DAY_MS - rng.int(0, 60) * DAY_MS
          ).toISOString(),
        };
        track.minutesListened = Math.round((track.plays * track.durationMs) / 60000);
        flat.push({ track, artistName: artist.name, genre: artist.genre });
      });
    });
  });

  return flat;
}

function buildArtists(flat: { track: Track; artistName: string; genre: string }[]): Artist[] {
  const byArtist = new Map<string, { plays: number; minutes: number; genre: string; top: Track }>();

  flat.forEach(({ track }) => {
    const existing = byArtist.get(track.artist);
    if (!existing) {
      byArtist.set(track.artist, {
        plays: track.plays,
        minutes: track.minutesListened,
        genre: track.genre,
        top: track,
      });
    } else {
      existing.plays += track.plays;
      existing.minutes += track.minutesListened;
      if (track.plays > existing.top.plays) existing.top = track;
    }
  });

  return Array.from(byArtist.entries())
    .map(([name, data]) => ({
      id: slugify(name),
      name,
      artwork: generateArtwork(slugify(name, "artist-portrait")),
      genre: data.genre,
      plays: data.plays,
      minutesListened: data.minutes,
      topTrack: data.top.title,
    }))
    .sort((a, b) => b.plays - a.plays);
}

function buildAlbums(flat: { track: Track; artistName: string; genre: string }[]): Album[] {
  const byAlbum = new Map<
    string,
    { plays: number; minutes: number; genre: string; artist: string; trackCount: number; artwork: string }
  >();

  flat.forEach(({ track }) => {
    const key = `${track.artist}::${track.album}`;
    const existing = byAlbum.get(key);
    if (!existing) {
      byAlbum.set(key, {
        plays: track.plays,
        minutes: track.minutesListened,
        genre: track.genre,
        artist: track.artist,
        trackCount: 1,
        artwork: track.artwork,
      });
    } else {
      existing.plays += track.plays;
      existing.minutes += track.minutesListened;
      existing.trackCount += 1;
    }
  });

  const yearByAlbum = new Map<string, number>();
  CATALOG.forEach((artist) =>
    artist.albums.forEach((album) => yearByAlbum.set(`${artist.name}::${album.title}`, album.year))
  );

  return Array.from(byAlbum.entries())
    .map(([key, data]) => {
      const [, title] = key.split("::");
      return {
        id: slugify(key),
        title,
        artist: data.artist,
        artwork: data.artwork,
        genre: data.genre,
        trackCount: data.trackCount,
        plays: data.plays,
        minutesListened: data.minutes,
        releaseYear: yearByAlbum.get(key) ?? 2024,
      };
    })
    .sort((a, b) => b.plays - a.plays);
}

function buildHistory(flat: { track: Track }[]): HistoryEntry[] {
  const rng = createRng("musiquee-history-v1");
  const now = Date.now();
  const entries: HistoryEntry[] = [];

  for (let i = 0; i < 40; i++) {
    const { track } = rng.pick(flat);
    const minutesAgo = rng.int(2, 60 * 24 * 10);
    entries.push({
      id: `${track.id}-${i}`,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      artwork: track.artwork,
      playedAt: new Date(now - minutesAgo * 60000).toISOString(),
      durationMs: track.durationMs,
      previewUrl: null,
    });
  }

  return entries.sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
}

function buildGenreBreakdown(flat: { track: Track }[]): GenreBreakdownEntry[] {
  const byGenre = new Map<string, number>();
  flat.forEach(({ track }) => {
    byGenre.set(track.genre, (byGenre.get(track.genre) ?? 0) + track.minutesListened);
  });
  const total = Array.from(byGenre.values()).reduce((a, b) => a + b, 0) || 1;
  return Array.from(byGenre.entries())
    .map(([genre, minutes]) => ({
      genre,
      minutes,
      percentage: Math.round((minutes / total) * 1000) / 10,
    }))
    .sort((a, b) => b.minutes - a.minutes);
}

function buildTrend(): ListeningTrend[] {
  const rng = createRng("musiquee-trend-v1");
  const weeks = ["W-7", "W-6", "W-5", "W-4", "W-3", "W-2", "W-1", "Ten tydz."];
  let base = rng.float(420, 620);
  return weeks.map((label) => {
    base = Math.max(140, base + rng.float(-140, 160));
    return { label, minutes: Math.round(base) };
  });
}

export function buildDemoDataset(): MusicDataset {
  const flat = buildFlatTracks();

  const topTracksAllTime = flat
    .map((f) => f.track)
    .sort((a, b) => b.plays - a.plays);

  const topTracksMonth = [...topTracksAllTime]
    .sort((a, b) => {
      const aRecent = Date.now() - new Date(a.lastPlayedAt).getTime() < 30 * DAY_MS ? 1 : 0;
      const bRecent = Date.now() - new Date(b.lastPlayedAt).getTime() < 30 * DAY_MS ? 1 : 0;
      if (aRecent !== bRecent) return bRecent - aRecent;
      return b.plays - a.plays;
    })
    .slice(0, 50);

  const topArtists = buildArtists(flat);
  const topAlbums = buildAlbums(flat);
  const recentlyPlayed = buildHistory(flat);
  const genreBreakdown = buildGenreBreakdown(flat);
  const trend = buildTrend();

  const totalMinutesAllTime = flat.reduce((sum, f) => sum + f.track.minutesListened, 0);
  const totalMinutesThisMonth = trend[trend.length - 1].minutes + trend[trend.length - 2].minutes;

  return {
    stats: {
      totalMinutesThisMonth,
      totalMinutesAllTime,
      topGenre: genreBreakdown[0]?.genre ?? "Pop",
      numberOneTrack: topTracksMonth[0],
      genreBreakdown,
      trend,
      dailyAverageMinutes: Math.round(totalMinutesThisMonth / 30),
      uniqueArtistsThisMonth: Math.min(topArtists.length, 18),
    },
    topTracksMonth,
    topTracksAllTime: topTracksAllTime.slice(0, 50),
    topArtists,
    topAlbums,
    recentlyPlayed,
  };
}
