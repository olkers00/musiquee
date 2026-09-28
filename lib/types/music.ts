export type TimeRange = "month" | "all" | "custom";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  genre: string;
  durationMs: number;
  plays: number;
  minutesListened: number;
  explicit?: boolean;
  previewUrl?: string | null;
  lastPlayedAt: string;
  addedToLibraryAt?: string;
}

export interface Artist {
  id: string;
  name: string;
  artwork: string;
  genre: string;
  plays: number;
  minutesListened: number;
  topTrack: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  genre: string;
  trackCount: number;
  plays: number;
  minutesListened: number;
  releaseYear: number;
}

export interface HistoryEntry {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  playedAt: string;
  durationMs: number;
  previewUrl?: string | null;
}

export interface GenreBreakdownEntry {
  genre: string;
  minutes: number;
  percentage: number;
}

export interface ListeningTrend {
  label: string;
  minutes: number;
}

export interface ListeningStats {
  totalMinutesThisMonth: number;
  totalMinutesAllTime: number;
  topGenre: string;
  numberOneTrack: Track;
  genreBreakdown: GenreBreakdownEntry[];
  trend: ListeningTrend[];
  dailyAverageMinutes: number;
  uniqueArtistsThisMonth: number;
}

export interface MusicDataset {
  stats: ListeningStats;
  topTracksMonth: Track[];
  topTracksAllTime: Track[];
  topArtists: Artist[];
  topAlbums: Album[];
  recentlyPlayed: HistoryEntry[];
}

export type ConnectionMode = "demo" | "apple-music";

export interface PlayableTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  durationMs: number;
  previewUrl?: string | null;
}

