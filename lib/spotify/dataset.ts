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
        artist: track.albumArtist || track.artist,
        artwork: track.artwork,
        releaseYear: track.albumReleaseYear,
        externalUrl: track.albumExternalUrl || track.externalUrl,
      },
    });
  }

  return Array.from(byAlbum.values())
    .sort((a, b) => b.count - a.count)
    .map((entry) => entry.album);
}

function dedupeArtists(artists: Artist[]): Artist[] {
  const byId = new Map<string, Artist>();
  for (const artist of artists) {
    if (!byId.has(artist.id)) byId.set(artist.id, artist);
  }
  return Array.from(byId.values());
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

/** Release years are always present on every track — the one breakdown
 *  that can never come back empty, so it doubles as the "Gatunki" card's
 *  fallback when Spotify hands back no usable artist genres at all. */
function deriveReleaseYearBreakdown(tracks: Track[]): GenreBreakdownEntry[] {
  const weights = new Map<number, number>();
  for (const track of tracks) {
    weights.set(track.albumReleaseYear, (weights.get(track.albumReleaseYear) ?? 0) + 1);
  }

  const total = tracks.length;
  if (total === 0) return [];

  return Array.from(weights.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([year, weight]) => ({
      genre: String(year),
      weight,
      percentage: Math.round((weight / total) * 100),
    }));
}

function deriveMostCommonReleaseYear(tracks: Track[]): number | null {
  const [top] = deriveReleaseYearBreakdown(tracks);
  return top ? Number(top.genre) : null;
}

function deriveAvgTrackDurationMs(tracks: Track[]): number {
  if (tracks.length === 0) return 0;
  return Math.round(tracks.reduce((sum, t) => sum + (Number(t.durationMs) || 0), 0) / tracks.length);
}

function derivePopularityTrend(tracks: Track[]): PopularityTrendPoint[] {
  const bucketSize = 5;
  const points: PopularityTrendPoint[] = [];
  for (let i = 0; i < tracks.length; i += bucketSize) {
    const bucket = tracks.slice(i, i + bucketSize);
    if (bucket.length === 0) continue;
    const avg = bucket.reduce((sum, t) => sum + (Number(t.popularity) || 0), 0) / bucket.length;
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
  /** Artists behind the stats-range top tracks that didn't already appear
   *  in topArtistsByRange — folded into the genre breakdown only, so tracks
   *  by artists outside the Top Artists list still count toward genres. */
  extraGenreArtists?: Artist[];
}

export function buildDataset(sources: DatasetSources): Dataset {
  const topAlbums = {} as Record<TimeRange, Album[]>;
  for (const range of RANGES) {
    topAlbums[range] = deriveAlbums(sources.topTracksByRange[range]);
  }

  const statsTracks = sources.topTracksByRange[STATS_RANGE];
  const statsArtists = sources.topArtistsByRange[STATS_RANGE];
  const combinedArtists = dedupeArtists([...statsArtists, ...(sources.extraGenreArtists ?? [])]);
  const genreBreakdown = deriveGenreBreakdown(combinedArtists);
  const uniqueArtists = new Set(statsTracks.map((t) => t.artistId ?? t.artist)).size;
  const avgPopularity =
    statsTracks.length > 0
      ? Math.round(statsTracks.reduce((sum, t) => sum + (Number(t.popularity) || 0), 0) / statsTracks.length)
      : 0;
  const avgArtistPopularity =
    combinedArtists.length > 0
      ? Math.round(combinedArtists.reduce((sum, a) => sum + (Number(a.popularity) || 0), 0) / combinedArtists.length)
      : 0;

  const numberOneTrack: Track = statsTracks[0] ?? {
    id: "none",
    title: "Brak danych",
    artist: "Posłuchaj więcej muzyki na Spotify",
    artistId: null,
    album: "",
    albumId: null,
    albumArtist: "",
    albumExternalUrl: "",
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
      avgArtistPopularity,
      topGenre: genreBreakdown[0]?.genre ?? "Brak danych",
      genreBreakdown,
      releaseYearBreakdown: deriveReleaseYearBreakdown(statsTracks),
      mostCommonReleaseYear: deriveMostCommonReleaseYear(statsTracks),
      avgTrackDurationMs: deriveAvgTrackDurationMs(statsTracks),
      uniqueArtists,
      popularityTrend: derivePopularityTrend(statsTracks),
    },
  };
}
