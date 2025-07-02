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
  const period = searchParams.get('period') || 'medium_term';
  const limit = searchParams.get('limit') || '9';

  // Pegar token do cookie
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

    const response = await spotifyApi.getMyTopTracks({
      limit: parseInt(limit),
      time_range: period as any,
    });

    // Agrupar por álbum e contar plays
    const albumMap = new Map();
    
    response.body.items.forEach((track: any) => {
      const albumId = track.album.id;
      if (!albumMap.has(albumId)) {
        albumMap.set(albumId, {
          name: track.album.name,
          artist: track.album.artists[0].name,
          image: track.album.images[0]?.url || '',
          popularity: track.album.popularity || 0,
          playcount: 1,
          service: 'spotify'
        });
      } else {
        albumMap.get(albumId).playcount += 1;
      }
    });

    // Converter para array e ordenar por playcount
    const albums = Array.from(albumMap.values())
      .sort((a, b) => b.playcount - a.playcount)
      .slice(0, parseInt(limit));

    return new Response(JSON.stringify({ albums }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    if (error.statusCode === 401 && refreshToken) {
      // Token expirado, tentar renovar
      try {
        spotifyApi.setRefreshToken(refreshToken);
        const data = await spotifyApi.refreshAccessToken();
        spotifyApi.setAccessToken(data.body.access_token);
        
        // Retry da requisição
        const response = await spotifyApi.getMyTopTracks({
          limit: parseInt(limit),
          time_range: period as any,
        });
        
        // Processar resposta novamente...
        const albumMap = new Map();
        
        response.body.items.forEach((track: any) => {
          const albumId = track.album.id;
          if (!albumMap.has(albumId)) {
            albumMap.set(albumId, {
              name: track.album.name,
              artist: track.album.artists[0].name,
              image: track.album.images[0]?.url || '',
              popularity: track.album.popularity || 0,
              playcount: 1,
              service: 'spotify'
            });
          } else {
            albumMap.get(albumId).playcount += 1;
          }
        });

        const albums = Array.from(albumMap.values())
          .sort((a, b) => b.playcount - a.playcount)
          .slice(0, parseInt(limit));

        return new Response(JSON.stringify({ albums }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
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