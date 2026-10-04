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

function pickArtwork(images: SpotifyImage[] | undefined): string {
  return images?.[0]?.url ?? FALLBACK_ARTWORK;
}

function parseReleaseYear(releaseDate: string): number {
  const year = Number(releaseDate.slice(0, 4));
  return Number.isFinite(year) && year > 0 ? year : new Date().getFullYear();
}

export function mapTrack(raw: SpotifyTrack): Track {
  return {
    id: raw.id,
    title: raw.name,
    artist: raw.artists?.map((a) => a.name).join(", ") ?? "",
    artistId: raw.artists?.[0]?.id ?? null,
    album: raw.album?.name ?? "",
    albumId: raw.album?.id ?? "",
    albumReleaseYear: parseReleaseYear(raw.album?.release_date ?? ""),
    artwork: pickArtwork(raw.album?.images),
    durationMs: raw.duration_ms,
    explicit: raw.explicit,
    popularity: Number(raw.popularity) || 0,
    previewUrl: raw.preview_url,
    externalUrl: raw.external_urls?.spotify ?? "",
  };
}

export function mapArtist(raw: SpotifyArtist): Artist {
  return {
    id: raw.id,
    name: raw.name,
    artwork: pickArtwork(raw.images),
    genres: raw.genres ?? [],
    popularity: Number(raw.popularity) || 0,
    followers: raw.followers?.total ?? 0,
    externalUrl: raw.external_urls?.spotify ?? "",
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
    externalUrl: track.externalUrl,
    playedAt: raw.played_at,
  };
}

/** True only when Spotify actually sent a usable popularity integer — lets
 *  callers tell "really 0" apart from "field missing/omitted", which some
 *  /me/top/tracks responses do for tracks Spotify hasn't scored yet. */
function hasValidPopularity(raw: SpotifyTrack): boolean {
  return typeof raw.popularity === "number" && Number.isFinite(raw.popularity);
}

export async function getMe(): Promise<SpotifyMe> {
  return spotifyFetch<SpotifyMe>("/me");
}

/** Full (non-simplified) track objects always carry popularity — used to
 *  backfill tracks whose Top Tracks entry came back without the field. */
export async function getTracksByIds(trackIds: string[]): Promise<Track[]> {
  const uniqueIds = Array.from(new Set(trackIds.filter(Boolean)));
  if (uniqueIds.length === 0) return [];

  const batches: string[][] = [];
  for (let i = 0; i < uniqueIds.length; i += 50) {
    batches.push(uniqueIds.slice(i, i + 50));
  }

  try {
    const results = await Promise.all(
      batches.map((batch) => spotifyFetch<{ tracks: SpotifyTrack[] }>(`/tracks?ids=${batch.join(",")}`))
    );
    return results.flatMap((res) => res?.tracks?.filter(Boolean).map(mapTrack) ?? []);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[Musiquee/Spotify API] getTracksByIds failed:", err);
    return [];
  }
}

export async function getTopTracks(range: TimeRange, limit = 50): Promise<Track[]> {
  try {
    const res = await spotifyFetch<SpotifyPagedResponse<SpotifyTrack>>(
      `/me/top/tracks?time_range=${range}&limit=${limit}`
    );
    const items = res?.items ?? [];
    let tracks = items.map(mapTrack);

    const missingIds = items.filter((raw) => !hasValidPopularity(raw)).map((raw) => raw.id);
    if (missingIds.length > 0) {
      const refetched = await getTracksByIds(missingIds);
      const byId = new Map(refetched.map((t) => [t.id, t.popularity]));
      tracks = tracks.map((t) => (byId.has(t.id) ? { ...t, popularity: byId.get(t.id)! } : t));
    }

    return tracks;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[Musiquee/Spotify API] getTopTracks failed:", err);
    return [];
  }
}

export async function getTopArtists(range: TimeRange, limit = 50): Promise<Artist[]> {
  try {
    const res = await spotifyFetch<SpotifyPagedResponse<SpotifyArtist>>(
      `/me/top/artists?time_range=${range}&limit=${limit}`
    );
    return res?.items?.map(mapArtist) ?? [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[Musiquee/Spotify API] getTopArtists failed:", err);
    return [];
  }
}

/** Genres live on Artist objects, never on Track objects — this batches
 *  /artists lookups (max 50 ids per call) so callers can enrich tracks
 *  whose artists didn't show up in the Top Artists list. */
export async function getArtistsByIds(artistIds: string[]): Promise<Artist[]> {
  const uniqueIds = Array.from(new Set(artistIds.filter(Boolean)));
  if (uniqueIds.length === 0) return [];

  const batches: string[][] = [];
  for (let i = 0; i < uniqueIds.length; i += 50) {
    batches.push(uniqueIds.slice(i, i + 50));
  }

  try {
    const results = await Promise.all(
      batches.map((batch) => spotifyFetch<{ artists: SpotifyArtist[] }>(`/artists?ids=${batch.join(",")}`))
    );
    return results.flatMap((res) => res?.artists?.filter(Boolean).map(mapArtist) ?? []);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[Musiquee/Spotify API] getArtistsByIds failed:", err);
    return [];
  }
}

export async function getRecentlyPlayed(limit = 50): Promise<HistoryEntry[]> {
  try {
    const res = await spotifyFetch<SpotifyPagedResponse<SpotifyRecentlyPlayedItem>>(
      `/me/player/recently-played?limit=${limit}`
    );
    return res?.items?.map(mapHistoryEntry) ?? [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[Musiquee/Spotify API] getRecentlyPlayed failed:", err);
    return [];
  }
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
    const values = (res?.audio_features ?? []).filter((f): f is SpotifyAudioFeatures => f !== null).map((f) => f.danceability);
    if (values.length === 0) return null;
    return (values.reduce((sum, v) => sum + v, 0) / values.length) * 100;
  } catch {
    return null;
  }
}
