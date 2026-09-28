import { spotifyFetch } from "./client";
import type { Artist, HistoryEntry, TimeRange, Track } from "@/lib/types/music";

const FALLBACK_ARTWORK = "https://placehold.co/300x300/141418/6b6b70?text=%E2%99%AB";

interface SpotifyImage {
  url: string;
}

interface SpotifyArtistRef {
  id: string;
  name: string;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtistRef[];
  album: SpotifyAlbum;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  preview_url: string | null;
  external_urls: { spotify: string };
}

interface SpotifyArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
  genres: string[];
  popularity: number;
  followers: { total: number };
  external_urls: { spotify: string };
}

interface SpotifyPagedResponse<T> {
  items: T[];
}

interface SpotifyRecentlyPlayedItem {
  track: SpotifyTrack;
  played_at: string;
}

interface SpotifyMe {
  id: string;
  display_name: string | null;
}

interface SpotifyAudioFeatures {
  id: string;
  danceability: number;
  energy: number;
  valence: number;
}

function pickArtwork(images: SpotifyImage[]): string {
  return images[0]?.url ?? FALLBACK_ARTWORK;
}

function parseReleaseYear(releaseDate: string): number {
  const year = Number(releaseDate.slice(0, 4));
  return Number.isFinite(year) && year > 0 ? year : new Date().getFullYear();
}

export function mapTrack(raw: SpotifyTrack): Track {
  return {
    id: raw.id,
    title: raw.name,
    artist: raw.artists.map((a) => a.name).join(", "),
    artistId: raw.artists[0]?.id ?? null,
    album: raw.album.name,
    albumId: raw.album.id,
    albumReleaseYear: parseReleaseYear(raw.album.release_date),
    artwork: pickArtwork(raw.album.images),
    durationMs: raw.duration_ms,
    explicit: raw.explicit,
    popularity: raw.popularity,
    previewUrl: raw.preview_url,
    externalUrl: raw.external_urls.spotify,
  };
}

export function mapArtist(raw: SpotifyArtist): Artist {
  return {
    id: raw.id,
    name: raw.name,
    artwork: pickArtwork(raw.images),
    genres: raw.genres,
    popularity: raw.popularity,
    followers: raw.followers.total,
    externalUrl: raw.external_urls.spotify,
  };
}

function mapHistoryEntry(raw: SpotifyRecentlyPlayedItem, index: number): HistoryEntry {
  const track = mapTrack(raw.track);
  return {
    id: `${track.id}-${raw.played_at}-${index}`,
    trackId: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album,
    artwork: track.artwork,
    durationMs: track.durationMs,
    previewUrl: track.previewUrl,
    playedAt: raw.played_at,
  };
}

export async function getMe(): Promise<SpotifyMe> {
  return spotifyFetch<SpotifyMe>("/me");
}

export async function getTopTracks(range: TimeRange, limit = 50): Promise<Track[]> {
  const res = await spotifyFetch<SpotifyPagedResponse<SpotifyTrack>>(
    `/me/top/tracks?time_range=${range}&limit=${limit}`
  );
  return res.items.map(mapTrack);
}

export async function getTopArtists(range: TimeRange, limit = 50): Promise<Artist[]> {
  const res = await spotifyFetch<SpotifyPagedResponse<SpotifyArtist>>(
    `/me/top/artists?time_range=${range}&limit=${limit}`
  );
  return res.items.map(mapArtist);
}

export async function getRecentlyPlayed(limit = 50): Promise<HistoryEntry[]> {
  const res = await spotifyFetch<SpotifyPagedResponse<SpotifyRecentlyPlayedItem>>(
    `/me/player/recently-played?limit=${limit}`
  );
  return res.items.map(mapHistoryEntry);
}

/** Spotify has restricted audio-features access for many apps created after
 *  Nov 2024 — this can legitimately 403. Callers should treat a thrown
 *  error here as "unavailable", not a hard failure. */
export async function getAverageDanceability(trackIds: string[]): Promise<number | null> {
  if (trackIds.length === 0) return null;
  try {
    const ids = trackIds.slice(0, 100).join(",");
    const res = await spotifyFetch<{ audio_features: (SpotifyAudioFeatures | null)[] }>(
      `/audio-features?ids=${ids}`
    );
    const values = res.audio_features.filter((f): f is SpotifyAudioFeatures => f !== null).map((f) => f.danceability);
    if (values.length === 0) return null;
    return (values.reduce((sum, v) => sum + v, 0) / values.length) * 100;
  } catch {
    return null;
  }
}
