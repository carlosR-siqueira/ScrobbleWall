import { NextRequest, NextResponse } from 'next/server';
import {
  SPOTIFY_ACCOUNTS_BASE_URL,
  SPOTIFY_ACCESS_TOKEN_COOKIE,
  SPOTIFY_API_BASE_URL,
  SPOTIFY_EXPIRES_AT_COOKIE,
  SPOTIFY_REFRESH_TOKEN_COOKIE,
  SpotifyTokenResponse,
  getCookieBaseOptions,
  getSpotifyConfig,
  toFormBody,
} from '@/lib/spotify';

type RecentlyPlayedResponse = {
  items: Array<{
    track: {
      id?: string;
      name: string;
      duration_ms: number;
      artists: Array<{ id?: string; name: string }>;
    };
    played_at: string;
  }>;
};

const clearSpotifyCookies = (response: NextResponse) => {
  response.cookies.delete(SPOTIFY_ACCESS_TOKEN_COOKIE);
  response.cookies.delete(SPOTIFY_REFRESH_TOKEN_COOKIE);
  response.cookies.delete(SPOTIFY_EXPIRES_AT_COOKIE);
};

const refreshAccessToken = async (refreshToken: string) => {
  const { clientId } = getSpotifyConfig();
  const refreshResponse = await fetch(`${SPOTIFY_ACCOUNTS_BASE_URL}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toFormBody({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    cache: 'no-store',
  });

  if (!refreshResponse.ok) {
    return null;
  }

  return (await refreshResponse.json()) as SpotifyTokenResponse;
};

const fetchSpotify = async <T>(path: string, token: string) => {
  const response = await fetch(`${SPOTIFY_API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
};

type SpotifyArtistsResponse = {
  artists: Array<{
    id: string;
    images?: Array<{ url: string; width: number; height: number }>;
  }>;
};

export async function GET(request: NextRequest) {
  try {
    const limit = 10;

    let accessToken = request.cookies.get(SPOTIFY_ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = request.cookies.get(SPOTIFY_REFRESH_TOKEN_COOKIE)?.value;
    const expiresAt = Number(request.cookies.get(SPOTIFY_EXPIRES_AT_COOKIE)?.value || 0);

    const shouldRefresh = !accessToken || !expiresAt || Date.now() >= expiresAt - 60_000;
    let refreshed: SpotifyTokenResponse | null = null;

    if (shouldRefresh && refreshToken) {
      refreshed = await refreshAccessToken(refreshToken);
      if (refreshed?.access_token) {
        accessToken = refreshed.access_token;
      }
    }

    if (!accessToken) {
      const unauthorizedResponse = NextResponse.json(
        { error: 'spotify_not_connected' },
        { status: 401 },
      );
      clearSpotifyCookies(unauthorizedResponse);
      return unauthorizedResponse;
    }

    const [recentPlayedResponse, profile] = await Promise.all([
      fetchSpotify<RecentlyPlayedResponse>(
        '/me/player/recently-played?limit=50',
        accessToken,
      ),
      fetchSpotify<{ display_name?: string }>(
        '/me',
        accessToken,
      ),
    ]);

    if (!recentPlayedResponse) {
      const unauthorizedResponse = NextResponse.json(
        { error: 'spotify_auth_expired' },
        { status: 401 },
      );
      clearSpotifyCookies(unauthorizedResponse);
      return unauthorizedResponse;
    }

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const dayItems = recentPlayedResponse.items.filter(
      (item) => new Date(item.played_at).getTime() >= oneDayAgo,
    );

    const trackCounter = new Map<
      string,
      {
        name: string;
        artist: string;
        firstArtistId?: string;
        plays: number;
        durationMs: number;
        latestPlayedAt: number;
      }
    >();
    for (const item of dayItems) {
      const artistNames = item.track.artists.map((artist) => artist.name).join(', ');
      const trackKey = `${item.track.name}__${artistNames}`;
      const currentTrack = trackCounter.get(trackKey);
      const playedAt = new Date(item.played_at).getTime();
      trackCounter.set(trackKey, {
        name: item.track.name,
        artist: artistNames,
        firstArtistId: item.track.artists[0]?.id || currentTrack?.firstArtistId,
        plays: (currentTrack?.plays || 0) + 1,
        durationMs: item.track.duration_ms,
        latestPlayedAt: Math.max(currentTrack?.latestPlayedAt || 0, playedAt),
      });
    }

    const sortedTopTracks = [...trackCounter.values()]
      .sort((a, b) => {
        if (b.plays !== a.plays) {
          return b.plays - a.plays;
        }
        return b.latestPlayedAt - a.latestPlayedAt;
      })
      .slice(0, limit);

    const artistIds = [...new Set(
      sortedTopTracks
        .map((track) => track.firstArtistId)
        .filter((id): id is string => Boolean(id)),
    )];

    let artistImageById = new Map<string, string>();
    if (artistIds.length) {
      const artistData = await fetchSpotify<SpotifyArtistsResponse>(
        `/artists?ids=${artistIds.join(',')}`,
        accessToken,
      );
      artistImageById = new Map(
        (artistData?.artists || []).map((artist) => [
          artist.id,
          artist.images?.[artist.images.length - 1]?.url || artist.images?.[0]?.url || '/fallback1.png',
        ]),
      );
    }

    const tracks = sortedTopTracks.map((track, index) => {
      const artistImageUrl = track.firstArtistId
        ? artistImageById.get(track.firstArtistId) || '/fallback1.png'
        : '/fallback1.png';

      return {
        rank: index + 1,
        name: track.name,
        artist: track.artist,
        durationMs: track.durationMs,
        plays: track.plays,
        artistImage: artistImageUrl.startsWith('http')
          ? `/api/image-proxy?url=${encodeURIComponent(artistImageUrl)}`
          : artistImageUrl,
      };
    });

    const response = NextResponse.json({
      profileName: profile?.display_name || null,
      timeRange: 'last_24h',
      tracks,
      minutesSource: 'recently_played_24h_50',
      generatedAt: new Date().toISOString(),
    });

    if (refreshed?.access_token) {
      response.cookies.set(
        SPOTIFY_ACCESS_TOKEN_COOKIE,
        refreshed.access_token,
        getCookieBaseOptions(refreshed.expires_in),
      );
      if (refreshed.refresh_token) {
        response.cookies.set(
          SPOTIFY_REFRESH_TOKEN_COOKIE,
          refreshed.refresh_token,
          getCookieBaseOptions(60 * 60 * 24 * 30),
        );
      }
      response.cookies.set(
        SPOTIFY_EXPIRES_AT_COOKIE,
        String(Date.now() + refreshed.expires_in * 1000),
        getCookieBaseOptions(60 * 60 * 24 * 30),
      );
    }

    return response;
  } catch {
    return NextResponse.json({ error: 'spotify_summary_error' }, { status: 500 });
  }
}
