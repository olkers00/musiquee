export const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ?? "";

export const SPOTIFY_SCOPES = ["user-top-read", "user-read-recently-played", "user-library-read"].join(" ");

export const SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
export const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
export const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export function getRedirectUri(): string {
  const configured = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
  if (configured) return configured;
  if (typeof window !== "undefined") return `${window.location.origin}/callback`;
  return "";
}

export function hasSpotifyClientId(): boolean {
  return SPOTIFY_CLIENT_ID.length > 0;
}
