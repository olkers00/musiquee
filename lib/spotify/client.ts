import { SPOTIFY_API_BASE } from "./config";
import { getValidAccessToken, refreshAccessToken } from "./auth";
import { getStoredTokens } from "./token-storage";

export class SpotifyApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

/** Authenticated fetch against the Spotify Web API. Retries once after a
 *  forced token refresh on 401 (covers a token that expired between our
 *  own expiry check and the request landing). */
export async function spotifyFetch<T>(path: string, retry = true): Promise<T> {
  const accessToken = await getValidAccessToken();
  if (!accessToken) throw new SpotifyApiError("Brak aktywnej sesji Spotify.", 401);

  const res = await fetch(`${SPOTIFY_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401 && retry) {
    const tokens = getStoredTokens();
    if (tokens?.refreshToken) {
      await refreshAccessToken(tokens.refreshToken);
      return spotifyFetch<T>(path, false);
    }
  }

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.clone().json();
      detail = body?.error?.message ?? "";
    } catch {
      // body wasn't JSON
    }
    // eslint-disable-next-line no-console
    console.error(`[Musiquee/Spotify API] ${res.status} for ${path}`, detail || "(no JSON body)");
    throw new SpotifyApiError(`Spotify API error ${res.status} for ${path}${detail ? `: ${detail}` : ""}`, res.status);
  }

  return res.json() as Promise<T>;
}
