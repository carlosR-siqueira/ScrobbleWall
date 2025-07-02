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
  const period = searchParams.get('period') || '1month';
  const limit = searchParams.get('limit') || '9';

  // Mapear períodos personalizados para períodos do Spotify
  const spotifyPeriodMap: Record<string, string> = {
    '1month': 'short_term',    // 4 semanas
    '6months': 'medium_term',  // 6 meses
    'alltime': 'long_term'     // vários anos
  };
  
  const spotifyPeriod = spotifyPeriodMap[period] || 'medium_term';

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

    // Buscar top tracks do Spotify
    const response = await spotifyApi.getMyTopTracks({
      limit: 50, // Buscar mais tracks para ter mais álbuns
      time_range: spotifyPeriod as any,
    });

    // Agrupar por álbum e calcular popularidade média
    const albumMap = new Map();
    
    response.body.items.forEach((track: any) => {
      const albumId = track.album.id;
      if (!albumMap.has(albumId)) {
        albumMap.set(albumId, {
          name: track.album.name,
          artist: track.album.artists[0].name,
          image: track.album.images[0]?.url || '',
          popularity: track.album.popularity || 0,
          tracksCount: 1,
          service: 'spotify'
        });
      } else {
        // Se o álbum já existe, calcular popularidade média
        const existingAlbum = albumMap.get(albumId);
        const totalPopularity = existingAlbum.popularity * existingAlbum.tracksCount + (track.album.popularity || 0);
        existingAlbum.tracksCount += 1;
        existingAlbum.popularity = Math.round(totalPopularity / existingAlbum.tracksCount);
      }
    });

    // Converter para array e ordenar por popularidade
    const albums = Array.from(albumMap.values())
      .sort((a, b) => b.popularity - a.popularity)
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
          limit: 50,
          time_range: spotifyPeriod as any,
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
              tracksCount: 1,
              service: 'spotify'
            });
          } else {
            // Se o álbum já existe, calcular popularidade média
            const existingAlbum = albumMap.get(albumId);
            const totalPopularity = existingAlbum.popularity * existingAlbum.tracksCount + (track.album.popularity || 0);
            existingAlbum.tracksCount += 1;
            existingAlbum.popularity = Math.round(totalPopularity / existingAlbum.tracksCount);
          }
        });

        const albums = Array.from(albumMap.values())
          .sort((a, b) => b.popularity - a.popularity)
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