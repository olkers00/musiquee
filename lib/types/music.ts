/**
 * Spotify's own top-items windows — used verbatim as the range selector
 * everywhere (dashboard default, top tracks, top artists, top albums).
 */
export type TimeRange = "short_term" | "medium_term" | "long_term";

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  short_term: "Ostatnie 4 tygodnie",
  medium_term: "Ostatnie 6 miesięcy",
  long_term: "Cały czas",
};

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string | null;
  album: string;
  albumId: string | null;
  albumReleaseYear: number;
  artwork: string;
  durationMs: number;
  explicit: boolean;
  popularity: number;
  previewUrl: string | null;
  externalUrl: string;
}

export interface Artist {
  id: string;
  name: string;
  artwork: string;
  genres: string[];
  popularity: number;
  followers: number;
  externalUrl: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  releaseYear: number;
  externalUrl: string;
}

export interface HistoryEntry {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  durationMs: number;
  previewUrl: string | null;
  externalUrl: string;
  playedAt: string;
}

export interface GenreBreakdownEntry {
  genre: string;
  weight: number;
  percentage: number;
}

export interface PopularityTrendPoint {
  label: string;
  popularity: number;
}

export interface DashboardStats {
  numberOneTrack: Track;
  avgPopularity: number;
  avgDanceability: number | null;
  avgArtistPopularity: number;
  topGenre: string;
  genreBreakdown: GenreBreakdownEntry[];
  /** Always populated from Top 50 release years — the ready fallback for the
   *  "Gatunki" card when Spotify returns no usable artist genres at all. */
  releaseYearBreakdown: GenreBreakdownEntry[];
  mostCommonReleaseYear: number | null;
  avgTrackDurationMs: number;
  uniqueArtists: number;
  popularityTrend: PopularityTrendPoint[];
}

export interface Dataset {
  topTracks: Record<TimeRange, Track[]>;
  topArtists: Record<TimeRange, Artist[]>;
  topAlbums: Record<TimeRange, Album[]>;
  recentlyPlayed: HistoryEntry[];
  stats: DashboardStats;
}

/** Minimal shape the player needs — satisfied by Track and HistoryEntry alike. */
export interface Playable {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  durationMs: number;
  previewUrl: string | null;
  externalUrl: string;
}
