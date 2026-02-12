import crypto from 'crypto';

export const SPOTIFY_ACCOUNTS_BASE_URL = 'https://accounts.spotify.com';
export const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

export const SPOTIFY_STATE_COOKIE = 'spotify_oauth_state';
export const SPOTIFY_VERIFIER_COOKIE = 'spotify_pkce_verifier';
export const SPOTIFY_ACCESS_TOKEN_COOKIE = 'spotify_access_token';
export const SPOTIFY_REFRESH_TOKEN_COOKIE = 'spotify_refresh_token';
export const SPOTIFY_EXPIRES_AT_COOKIE = 'spotify_expires_at';

const DEFAULT_SPOTIFY_SCOPES = 'user-top-read user-read-recently-played';

export const getSpotifyConfig = () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const scopes = process.env.SPOTIFY_SCOPES || DEFAULT_SPOTIFY_SCOPES;

  if (!clientId || !redirectUri) {
    throw new Error('SPOTIFY_CLIENT_ID and SPOTIFY_REDIRECT_URI are required');
  }

  return {
    clientId,
    redirectUri,
    scopes,
  };
};

export const getCookieBaseOptions = (maxAgeSeconds: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: maxAgeSeconds,
});

export const createCodeVerifier = () => {
  return base64UrlEncode(crypto.randomBytes(64));
};

export const createState = () => {
  return base64UrlEncode(crypto.randomBytes(16));
};

export const createCodeChallenge = (verifier: string) => {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64UrlEncode(hash);
};

const base64UrlEncode = (input: Buffer) => {
  return input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
};

export type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
};

export const toFormBody = (params: Record<string, string>) => {
  return new URLSearchParams(params).toString();
};

