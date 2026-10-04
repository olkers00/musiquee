import {
  SPOTIFY_AUTHORIZE_URL,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_PROD_REDIRECT_URI,
  SPOTIFY_SCOPES,
  SPOTIFY_TOKEN_URL,
  getRedirectUri,
} from "./config";
import { createPkcePair, createState } from "./pkce";
import { clearStoredTokens, getStoredTokens, readAndClearPkce, setStoredTokens, stashPkce, type StoredTokens } from "./token-storage";

export class SpotifyAuthError extends Error {}

/** Logs the exact redirect_uri Spotify will check against the dashboard
 *  config, right before every authorize attempt. "INVALID_CLIENT: Invalid
 *  redirect URI" / "redirect_uri: Not matching configuration" always means
 *  this value isn't registered — byte-for-byte — under the app's Redirect
 *  URIs at https://developer.spotify.com/dashboard, so surfacing it here
 *  turns a cryptic Spotify-hosted error page into an actionable fix. */
function logRedirectUriSetup(redirectUri: string): void {
  // eslint-disable-next-line no-console
  console.info(
    `%c[Musiquee/Spotify OAuth]%c Add these EXACT Redirect URIs in the dashboard\n` +
      `(https://developer.spotify.com/dashboard → your app → Edit Settings → Redirect URIs):\n` +
      `  • this request:  ${redirectUri}\n` +
      `  • production:    ${SPOTIFY_PROD_REDIRECT_URI}\n` +
      `A mismatch (scheme, host, port, or trailing slash) is what causes\n` +
      `"INVALID_CLIENT: Invalid redirect URI".`,
    "font-weight:bold;color:#1db954",
    "color:inherit"
  );
}

/** Kicks off the Authorization Code + PKCE flow — no client secret needed,
 *  which is the only option that works from a statically exported SPA. */
export async function redirectToSpotifyAuthorize(showDialog = false): Promise<void> {
  const redirectUri = getRedirectUri();
  logRedirectUriSetup(redirectUri);

  const { verifier, challenge } = await createPkcePair();
  const state = createState();
  stashPkce(verifier, state);

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
    ...(showDialog ? { show_dialog: "true" } : {}),
  });

  window.location.href = `${SPOTIFY_AUTHORIZE_URL}?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

interface TokenErrorResponse {
  error?: string;
  error_description?: string;
}

/** Spotify's token endpoint returns a JSON body describing exactly what
 *  went wrong (e.g. "invalid_grant" / "Invalid redirect URI") — logging it
 *  turns a generic "połączenie nie powiodło się" into an actionable cause,
 *  since this app has no server to check (static export, nothing reaches
 *  Vercel/server logs). */
async function logTokenEndpointError(context: string, res: Response): Promise<string> {
  let body: TokenErrorResponse | null = null;
  try {
    body = (await res.clone().json()) as TokenErrorResponse;
  } catch {
    // body wasn't JSON — fall through with status only
  }
  // eslint-disable-next-line no-console
  console.error(
    `[Musiquee/Spotify OAuth] ${context} failed — ${res.status} ${res.statusText}`,
    body ?? "(no JSON body)"
  );
  return body?.error_description || body?.error || res.statusText;
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
    const reason = await logTokenEndpointError("Token exchange", res);
    throw new SpotifyAuthError(`Nie udało się wymienić kodu autoryzacji na token (${res.status}): ${reason}`);
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
    const reason = await logTokenEndpointError("Token refresh", res);
    clearStoredTokens();
    throw new SpotifyAuthError(`Sesja Spotify wygasła (${res.status}: ${reason}) — połącz się ponownie.`);
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
