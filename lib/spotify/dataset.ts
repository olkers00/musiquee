import type {
  Album,
  Artist,
  Dataset,
  GenreBreakdownEntry,
  HistoryEntry,
  PopularityTrendPoint,
  TimeRange,
  Track,
} from "@/lib/types/music";

const RANGES: TimeRange[] = ["short_term", "medium_term", "long_term"];
const STATS_RANGE: TimeRange = "medium_term";

function deriveAlbums(tracks: Track[]): Album[] {
  const byAlbum = new Map<string, { album: Album; count: number }>();

  for (const track of tracks) {
    const key = track.albumId ?? `${track.artist}::${track.album}`;
    const existing = byAlbum.get(key);
    if (existing) {
      existing.count += 1;
      continue;
    }
    byAlbum.set(key, {
      count: 1,
      album: {
        id: key,
        title: track.album,
        artist: track.artist,
        artwork: track.artwork,
        releaseYear: track.albumReleaseYear,
      },
    });
  }

  return Array.from(byAlbum.values())
    .sort((a, b) => b.count - a.count)
    .map((entry) => entry.album);
}

function deriveGenreBreakdown(artists: Artist[]): GenreBreakdownEntry[] {
  const weights = new Map<string, number>();
  for (const artist of artists) {
    for (const genre of artist.genres) {
      weights.set(genre, (weights.get(genre) ?? 0) + 1);
    }
  }

  const total = Array.from(weights.values()).reduce((sum, w) => sum + w, 0);
  if (total === 0) return [];

  return Array.from(weights.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([genre, weight]) => ({
      genre,
      weight,
      percentage: Math.round((weight / total) * 100),
    }));
}

function derivePopularityTrend(tracks: Track[]): PopularityTrendPoint[] {
  const bucketSize = 5;
  const points: PopularityTrendPoint[] = [];
  for (let i = 0; i < tracks.length; i += bucketSize) {
    const bucket = tracks.slice(i, i + bucketSize);
    if (bucket.length === 0) continue;
    const avg = bucket.reduce((sum, t) => sum + t.popularity, 0) / bucket.length;
    points.push({
      label: `#${i + 1}–${i + bucket.length}`,
      popularity: Math.round(avg),
    });
  }
  return points;
}

export interface DatasetSources {
  topTracksByRange: Record<TimeRange, Track[]>;
  topArtistsByRange: Record<TimeRange, Artist[]>;
  recentlyPlayed: HistoryEntry[];
  avgDanceability: number | null;
}

export function buildDataset(sources: DatasetSources): Dataset {
  const topAlbums = {} as Record<TimeRange, Album[]>;
  for (const range of RANGES) {
    topAlbums[range] = deriveAlbums(sources.topTracksByRange[range]);
  }

  const statsTracks = sources.topTracksByRange[STATS_RANGE];
  const statsArtists = sources.topArtistsByRange[STATS_RANGE];
  const genreBreakdown = deriveGenreBreakdown(statsArtists);
  const uniqueArtists = new Set(statsTracks.map((t) => t.artistId ?? t.artist)).size;
  const avgPopularity =
    statsTracks.length > 0
      ? Math.round(statsTracks.reduce((sum, t) => sum + t.popularity, 0) / statsTracks.length)
      : 0;

  const numberOneTrack: Track = statsTracks[0] ?? {
    id: "none",
    title: "Brak danych",
    artist: "Posłuchaj więcej muzyki na Spotify",
    artistId: null,
    album: "",
    albumId: null,
    albumReleaseYear: new Date().getFullYear(),
    artwork: "https://placehold.co/300x300/141418/6b6b70?text=%E2%99%AB",
    durationMs: 0,
    explicit: false,
    popularity: 0,
    previewUrl: null,
    externalUrl: "",
  };

  return {
    topTracks: sources.topTracksByRange,
    topArtists: sources.topArtistsByRange,
    topAlbums,
    recentlyPlayed: sources.recentlyPlayed,
    stats: {
      numberOneTrack,
      avgPopularity,
      avgDanceability: sources.avgDanceability,
      topGenre: genreBreakdown[0]?.genre ?? "Brak danych",
      genreBreakdown,
      uniqueArtists,
      popularityTrend: derivePopularityTrend(statsTracks),
    },
  };
}
