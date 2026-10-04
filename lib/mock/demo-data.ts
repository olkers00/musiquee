import type { Artist, Dataset, HistoryEntry, TimeRange, Track } from "@/lib/types/music";
import { buildDataset } from "@/lib/spotify/dataset";
import { placeholderArtwork } from "./placeholder-artwork";

interface SeedTrack {
  title: string;
  artist: string;
  album: string;
  genres: string[];
  durationMs: number;
  explicit: boolean;
  popularity: number;
}

const SEED_TRACKS: SeedTrack[] = [
  { title: "Neon Skyline", artist: "Nova Ridge", album: "Afterglow", genres: ["synth-pop", "dream pop", "pop"], durationMs: 203_000, explicit: false, popularity: 82 },
  { title: "Midnight Cartel", artist: "Echo Parade", album: "Low Beams", genres: ["indie rock", "alt rock", "rock"], durationMs: 218_000, explicit: false, popularity: 74 },
  { title: "Velvet Static", artist: "Nova Ridge", album: "Afterglow", genres: ["synth-pop"], durationMs: 195_000, explicit: false, popularity: 79 },
  { title: "Concrete Bloom", artist: "Kasa Mono", album: "Tower Lights", genres: ["hip hop", "boom bap"], durationMs: 176_000, explicit: true, popularity: 71 },
  { title: "Paper Cranes", artist: "Lumen Bay", album: "Shoreline", genres: ["lo-fi", "chillhop"], durationMs: 162_000, explicit: false, popularity: 63 },
  { title: "Glass Horizon", artist: "Wren Halden", album: "Glass Horizon", genres: ["indie folk"], durationMs: 231_000, explicit: false, popularity: 58 },
  { title: "Amber Static", artist: "Echo Parade", album: "Low Beams", genres: ["indie rock"], durationMs: 204_000, explicit: false, popularity: 69 },
  { title: "Dial Tone", artist: "Kasa Mono", album: "Tower Lights", genres: ["hip hop"], durationMs: 189_000, explicit: true, popularity: 66 },
  { title: "Rosewater", artist: "Iris Calloway", album: "Warm Static", genres: ["r&b", "soul"], durationMs: 211_000, explicit: false, popularity: 77 },
  { title: "Coastline Drift", artist: "Lumen Bay", album: "Shoreline", genres: ["lo-fi"], durationMs: 154_000, explicit: false, popularity: 60 },
  { title: "Firelight", artist: "Marea Cruz", album: "Sol y Sombra", genres: ["latin pop", "reggaeton", "pop"], durationMs: 198_000, explicit: false, popularity: 85 },
  { title: "Vertigo Blue", artist: "Nova Ridge", album: "Afterglow", genres: ["synth-pop"], durationMs: 207_000, explicit: false, popularity: 73 },
  { title: "Iron Bloom", artist: "Greywatch", album: "Iron Bloom", genres: ["metal", "hard rock", "rock"], durationMs: 244_000, explicit: true, popularity: 55 },
  { title: "Sundial", artist: "Wren Halden", album: "Glass Horizon", genres: ["indie folk"], durationMs: 219_000, explicit: false, popularity: 52 },
  { title: "Nightbus", artist: "Kasa Mono", album: "Tower Lights", genres: ["hip hop"], durationMs: 183_000, explicit: true, popularity: 68 },
  { title: "Electric Tide", artist: "Sable Reyes", album: "Undertow", genres: ["house", "dance", "electronic"], durationMs: 226_000, explicit: false, popularity: 80 },
  { title: "Quiet Static", artist: "Iris Calloway", album: "Warm Static", genres: ["r&b"], durationMs: 201_000, explicit: false, popularity: 72 },
  { title: "Bloodline", artist: "Greywatch", album: "Iron Bloom", genres: ["metal"], durationMs: 251_000, explicit: true, popularity: 49 },
  { title: "Calle Luna", artist: "Marea Cruz", album: "Sol y Sombra", genres: ["latin pop"], durationMs: 192_000, explicit: false, popularity: 81 },
  { title: "Afterparty Static", artist: "Sable Reyes", album: "Undertow", genres: ["house"], durationMs: 233_000, explicit: false, popularity: 75 },
  { title: "Paperweight", artist: "Wren Halden", album: "Glass Horizon", genres: ["indie folk"], durationMs: 197_000, explicit: false, popularity: 47 },
  { title: "Slow Chrome", artist: "Lumen Bay", album: "Shoreline", genres: ["chillhop"], durationMs: 168_000, explicit: false, popularity: 57 },
  { title: "Halo Static", artist: "Iris Calloway", album: "Warm Static", genres: ["soul"], durationMs: 214_000, explicit: false, popularity: 70 },
  { title: "Riptide City", artist: "Sable Reyes", album: "Undertow", genres: ["dance"], durationMs: 221_000, explicit: false, popularity: 78 },
  { title: "Golden Hour Loop", artist: "Nova Ridge", album: "Afterglow", genres: ["dream pop"], durationMs: 199_000, explicit: false, popularity: 76 },
  { title: "Static Bloom", artist: "Echo Parade", album: "Low Beams", genres: ["alt rock"], durationMs: 227_000, explicit: false, popularity: 64 },
  { title: "Fuego Lento", artist: "Marea Cruz", album: "Sol y Sombra", genres: ["reggaeton"], durationMs: 187_000, explicit: false, popularity: 83 },
  { title: "Ash & Amber", artist: "Greywatch", album: "Iron Bloom", genres: ["hard rock"], durationMs: 238_000, explicit: true, popularity: 51 },
];

const ALBUM_YEARS: Record<string, number> = {
  Afterglow: 2023,
  "Low Beams": 2022,
  "Tower Lights": 2023,
  Shoreline: 2021,
  "Glass Horizon": 2022,
  "Warm Static": 2023,
  "Sol y Sombra": 2024,
  "Iron Bloom": 2021,
  Undertow: 2024,
};

const seedIndexByTitle = new Map(SEED_TRACKS.map((t, i) => [t.title, i]));

function trackId(seed: SeedTrack): string {
  return `demo-track-${seedIndexByTitle.get(seed.title)}`;
}

function toTrack(seed: SeedTrack): Track {
  const id = trackId(seed);
  return {
    id,
    title: seed.title,
    artist: seed.artist,
    artistId: `demo-artist-${seed.artist}`,
    album: seed.album,
    albumId: `demo-album-${seed.artist}-${seed.album}`,
    albumArtist: seed.artist,
    albumExternalUrl: "https://open.spotify.com",
    albumReleaseYear: ALBUM_YEARS[seed.album] ?? new Date().getFullYear(),
    artwork: placeholderArtwork(seed.album, seed.title),
    durationMs: seed.durationMs,
    explicit: seed.explicit,
    popularity: seed.popularity,
    previewUrl: null,
    externalUrl: "https://open.spotify.com",
  };
}

function rotate<T>(arr: T[], by: number): T[] {
  const n = arr.length;
  return arr.map((_, i) => arr[(i + by) % n]);
}

function artistsFromTracks(tracks: Track[]): Artist[] {
  const byArtist = new Map<string, Artist>();
  for (const track of tracks) {
    if (byArtist.has(track.artist)) continue;
    const seed = SEED_TRACKS.find((s) => s.artist === track.artist)!;
    const genres = Array.from(new Set(SEED_TRACKS.filter((s) => s.artist === track.artist).flatMap((s) => s.genres)));
    byArtist.set(track.artist, {
      id: track.artistId ?? track.artist,
      name: track.artist,
      artwork: placeholderArtwork(track.artist, track.artist),
      genres,
      popularity: seed.popularity,
      followers: 40_000 + genres.length * 91_233 + track.artist.length * 3_407,
      externalUrl: "https://open.spotify.com",
    });
  }
  return Array.from(byArtist.values());
}

function buildRecentlyPlayed(tracks: Track[]): HistoryEntry[] {
  const now = Date.now();
  const gapsMinutes = [4, 18, 39, 70, 95, 140, 210, 260, 300, 340, 420, 480, 560, 640, 720, 900, 1080, 1260, 1440, 1620, 2000, 2400, 2900, 3400];
  return gapsMinutes.map((gap, i) => {
    const track = tracks[i % tracks.length];
    return {
      id: `demo-history-${i}`,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      artwork: track.artwork,
      durationMs: track.durationMs,
      previewUrl: null,
      externalUrl: track.externalUrl,
      playedAt: new Date(now - gap * 60_000).toISOString(),
    };
  });
}

let cachedDemoDataset: Dataset | null = null;

export function getDemoDataset(): Dataset {
  if (cachedDemoDataset) return cachedDemoDataset;

  const baseTracks = SEED_TRACKS.map(toTrack);

  const topTracksByRange: Record<TimeRange, Track[]> = {
    short_term: rotate(baseTracks, 0),
    medium_term: rotate(baseTracks, 7),
    long_term: rotate(baseTracks, 15),
  };

  const topArtistsByRange: Record<TimeRange, Artist[]> = {
    short_term: artistsFromTracks(topTracksByRange.short_term),
    medium_term: artistsFromTracks(topTracksByRange.medium_term),
    long_term: artistsFromTracks(topTracksByRange.long_term),
  };

  cachedDemoDataset = buildDataset({
    topTracksByRange,
    topArtistsByRange,
    recentlyPlayed: buildRecentlyPlayed(baseTracks),
    avgDanceability: 64,
  });

  return cachedDemoDataset;
}
