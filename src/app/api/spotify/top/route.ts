import { NextRequest } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;

const spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_CLIENT_SECRET,
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'track'; // 'artist' ou 'track'
  const limit = 10;
  const time_range = 'short_term'; // 1 mês

  const accessToken = req.cookies.get('spotify_access_token')?.value;
  const refreshToken = req.cookies.get('spotify_refresh_token')?.value;

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'not_authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    spotifyApi.setAccessToken(accessToken);

    if (type === 'artist') {
      const response = await spotifyApi.getMyTopArtists({ limit, time_range });
      const artists = response.body.items.map((artist: any) => ({
        name: artist.name,
        image: artist.images[0]?.url || '',
        popularity: artist.popularity,
        type: 'artist',
      }));
      return new Response(JSON.stringify({ items: artists }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      const response = await spotifyApi.getMyTopTracks({ limit, time_range });
      const tracks = response.body.items.map((track: any) => ({
        name: track.name,
        artist: track.artists[0]?.name || '',
        image: track.album.images[0]?.url || '',
        popularity: track.popularity,
        type: 'track',
      }));
      return new Response(JSON.stringify({ items: tracks }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error: any) {
    if (error.statusCode === 401 && refreshToken) {
      // Token expirado, tentar renovar
      try {
        spotifyApi.setRefreshToken(refreshToken);
        const data = await spotifyApi.refreshAccessToken();
        spotifyApi.setAccessToken(data.body.access_token);
        // Retry
        if (type === 'artist') {
          const response = await spotifyApi.getMyTopArtists({ limit, time_range });
          const artists = response.body.items.map((artist: any) => ({
            name: artist.name,
            image: artist.images[0]?.url || '',
            popularity: artist.popularity,
            type: 'artist',
          }));
          return new Response(JSON.stringify({ items: artists }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          const response = await spotifyApi.getMyTopTracks({ limit, time_range });
          const tracks = response.body.items.map((track: any) => ({
            name: track.name,
            artist: track.artists[0]?.name || '',
            image: track.album.images[0]?.url || '',
            popularity: track.popularity,
            type: 'track',
          }));
          return new Response(JSON.stringify({ items: tracks }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } catch (refreshError) {
        return new Response(JSON.stringify({ error: 'token_refresh_failed' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    return new Response(JSON.stringify({ error: 'Erro ao buscar dados do Spotify' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 