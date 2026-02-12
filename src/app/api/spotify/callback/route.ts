import { NextRequest, NextResponse } from 'next/server';
import {
  SPOTIFY_ACCOUNTS_BASE_URL,
  SPOTIFY_ACCESS_TOKEN_COOKIE,
  SPOTIFY_EXPIRES_AT_COOKIE,
  SPOTIFY_REFRESH_TOKEN_COOKIE,
  SPOTIFY_STATE_COOKIE,
  SPOTIFY_VERIFIER_COOKIE,
  SpotifyTokenResponse,
  getCookieBaseOptions,
  getSpotifyConfig,
  toFormBody,
} from '@/lib/spotify';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error || !code || !state) {
    return NextResponse.redirect(`${origin}/spotify-capsule?error=auth`);
  }

  const cookieState = request.cookies.get(SPOTIFY_STATE_COOKIE)?.value;
  const verifier = request.cookies.get(SPOTIFY_VERIFIER_COOKIE)?.value;

  if (!cookieState || cookieState !== state || !verifier) {
    return NextResponse.redirect(`${origin}/spotify-capsule?error=state`);
  }

  try {
    const { clientId, redirectUri } = getSpotifyConfig();

    const tokenResponse = await fetch(`${SPOTIFY_ACCOUNTS_BASE_URL}/api/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: toFormBody({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      }),
      cache: 'no-store',
    });

    if (!tokenResponse.ok) {
      return NextResponse.redirect(`${origin}/spotify-capsule?error=token`);
    }

    const tokenData = (await tokenResponse.json()) as SpotifyTokenResponse;
    const expiresAt = Date.now() + tokenData.expires_in * 1000;

    const response = NextResponse.redirect(`${origin}/spotify-capsule?connected=1`);
    response.cookies.delete(SPOTIFY_STATE_COOKIE);
    response.cookies.delete(SPOTIFY_VERIFIER_COOKIE);
    response.cookies.set(
      SPOTIFY_ACCESS_TOKEN_COOKIE,
      tokenData.access_token,
      getCookieBaseOptions(tokenData.expires_in),
    );
    if (tokenData.refresh_token) {
      response.cookies.set(
        SPOTIFY_REFRESH_TOKEN_COOKIE,
        tokenData.refresh_token,
        getCookieBaseOptions(60 * 60 * 24 * 30),
      );
    }
    response.cookies.set(
      SPOTIFY_EXPIRES_AT_COOKIE,
      String(expiresAt),
      getCookieBaseOptions(60 * 60 * 24 * 30),
    );

    return response;
  } catch {
    return NextResponse.redirect(`${origin}/spotify-capsule?error=server`);
  }
}

