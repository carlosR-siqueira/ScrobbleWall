import { NextRequest, NextResponse } from 'next/server';
import {
  SPOTIFY_ACCOUNTS_BASE_URL,
  SPOTIFY_STATE_COOKIE,
  SPOTIFY_VERIFIER_COOKIE,
  createCodeChallenge,
  createCodeVerifier,
  createState,
  getCookieBaseOptions,
  getSpotifyConfig,
} from '@/lib/spotify';

export async function GET(request: NextRequest) {
  try {
    const { clientId, redirectUri, scopes } = getSpotifyConfig();
    const state = createState();
    const verifier = createCodeVerifier();
    const challenge = createCodeChallenge(verifier);

    const authUrl = new URL(`${SPOTIFY_ACCOUNTS_BASE_URL}/authorize`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('code_challenge', challenge);

    const response = NextResponse.redirect(authUrl.toString());
    response.cookies.set(
      SPOTIFY_STATE_COOKIE,
      state,
      getCookieBaseOptions(10 * 60),
    );
    response.cookies.set(
      SPOTIFY_VERIFIER_COOKIE,
      verifier,
      getCookieBaseOptions(10 * 60),
    );

    return response;
  } catch {
    const fallbackUrl = new URL('/spotify-capsule?error=config', request.nextUrl.origin);
    return NextResponse.redirect(fallbackUrl);
  }
}
