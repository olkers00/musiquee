const ACCESS_TOKEN_KEY = "musiquee:spotify:access_token";
const REFRESH_TOKEN_KEY = "musiquee:spotify:refresh_token";
const EXPIRES_AT_KEY = "musiquee:spotify:expires_at";

const VERIFIER_KEY = "musiquee:spotify:pkce_verifier";
const STATE_KEY = "musiquee:spotify:oauth_state";

export interface StoredTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
}

export function getStoredTokens(): StoredTokens | null {
  if (typeof window === "undefined") return null;
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
  if (!accessToken || !expiresAt) return null;
  return {
    accessToken,
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    expiresAt: Number(expiresAt),
  };
}

export function setStoredTokens(tokens: StoredTokens): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(EXPIRES_AT_KEY, String(tokens.expiresAt));
  if (tokens.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearStoredTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
}

export function stashPkce(verifier: string, state: string): void {
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);
}

export function readAndClearPkce(): { verifier: string | null; state: string | null } {
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  const state = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
  return { verifier, state };
}
