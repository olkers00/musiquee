export const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ?? "";

export const SPOTIFY_SCOPES = ["user-top-read", "user-read-recently-played", "user-read-private"].join(" ");

export const SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
export const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
export const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

/** The redirect URI this app will register with on Spotify in production —
 *  shown in setup logs so it's always clear what to paste into the
 *  dashboard, even if NEXT_PUBLIC_SPOTIFY_REDIRECT_URI isn't set locally. */
export const SPOTIFY_PROD_REDIRECT_URI = "https://www.musiquee.pl/callback";

/**
 * Resolves the redirect_uri sent to Spotify. Priority:
 *  1. NEXT_PUBLIC_SPOTIFY_REDIRECT_URI, if set (always wins — use this to
 *     pin an exact value, e.g. in production).
 *  2. The current origin + "/callback", with "localhost" normalized to
 *     "127.0.0.1" — Spotify's dashboard no longer accepts the literal
 *     hostname "localhost" for redirect URIs (loopback IP only), so a dev
 *     server opened at http://localhost:3000 would otherwise send a
 *     redirect_uri Spotify rejects with "INVALID_CLIENT: Invalid redirect
 *     URI" even though the app itself is reachable there.
 */
export function getRedirectUri(): string {
  const configured = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
  if (configured) return configured;
  if (typeof window === "undefined") return "";

  const { protocol, hostname, port } = window.location;
  const host = hostname === "localhost" ? "127.0.0.1" : hostname;
  return `${protocol}//${host}${port ? `:${port}` : ""}/callback`;
}

export function hasSpotifyClientId(): boolean {
  return SPOTIFY_CLIENT_ID.length > 0;
}
