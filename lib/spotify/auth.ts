import { createPkcePair, createState } from "./pkce";
import { SPOTIFY_AUTHORIZE_URL, SPOTIFY_CLIENT_ID, SPOTIFY_SCOPES, SPOTIFY_TOKEN_URL, getRedirectUri } from "./config";
import { clearStoredTokens, getStoredTokens, readAndClearPkce, setStoredTokens, stashPkce, type StoredTokens } from "./token-storage";

export class SpotifyAuthError extends Error {}

/** Kicks off the Authorization Code + PKCE flow — no client secret needed,
 *  which is the only option that works from a statically exported SPA. */
export async function redirectToSpotifyAuthorize(): Promise<void> {
  const { verifier, challenge } = await createPkcePair();
  const state = createState();
  stashPkce(verifier, state);

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: getRedirectUri(),
    scope: SPOTIFY_SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
  });

  window.location.href = `${SPOTIFY_AUTHORIZE_URL}?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

function storeTokenResponse(res: TokenResponse, fallbackRefreshToken: string | null): StoredTokens {
  const tokens: StoredTokens = {
    accessToken: res.access_token,
    refreshToken: res.refresh_token ?? fallbackRefreshToken,
    expiresAt: Date.now() + res.expires_in * 1000,
  };
  setStoredTokens(tokens);
  return tokens;
}

export async function exchangeCodeForToken(code: string, state: string): Promise<StoredTokens> {
  const { verifier, state: storedState } = readAndClearPkce();
  if (!verifier || !storedState || storedState !== state) {
    throw new SpotifyAuthError("Nieprawidłowy stan autoryzacji — spróbuj połączyć się ponownie.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri(),
    client_id: SPOTIFY_CLIENT_ID,
    code_verifier: verifier,
  });

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new SpotifyAuthError(`Nie udało się wymienić kodu autoryzacji na token (${res.status}).`);
  }

  const data: TokenResponse = await res.json();
  return storeTokenResponse(data, null);
}

export async function refreshAccessToken(refreshToken: string): Promise<StoredTokens> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: SPOTIFY_CLIENT_ID,
  });

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    clearStoredTokens();
    throw new SpotifyAuthError(`Sesja Spotify wygasła (${res.status}) — połącz się ponownie.`);
  }

  const data: TokenResponse = await res.json();
  return storeTokenResponse(data, refreshToken);
}

const EXPIRY_SAFETY_MARGIN_MS = 60_000;

/** Returns a usable access token, refreshing it first if it is close to
 *  expiry. Returns null when there is nothing stored (caller falls back to
 *  demo mode) rather than throwing. */
export async function getValidAccessToken(): Promise<string | null> {
  const tokens = getStoredTokens();
  if (!tokens) return null;

  if (tokens.expiresAt - EXPIRY_SAFETY_MARGIN_MS > Date.now()) {
    return tokens.accessToken;
  }

  if (!tokens.refreshToken) {
    clearStoredTokens();
    return null;
  }

  const refreshed = await refreshAccessToken(tokens.refreshToken);
  return refreshed.accessToken;
}

export function logout(): void {
  clearStoredTokens();
}

export function isConnected(): boolean {
  return getStoredTokens() !== null;
}
