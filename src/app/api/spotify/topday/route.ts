import { NextRequest } from 'next/server';
import puppeteer from 'puppeteer';
import SpotifyWebApi from 'spotify-web-api-node';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;

const spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_CLIENT_SECRET,
});

function getImageAsBase64(imagePath: string): string {
  try {
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    const imageBuffer = fs.readFileSync(fullPath);
    const base64 = imageBuffer.toString('base64');
    const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Erro ao carregar imagem:', error);
    return '';
  }
}

async function getRecentlyPlayedTracks(req: NextRequest, limit: number) {
  const accessToken = req.cookies.get('spotify_access_token')?.value;
  const refreshToken = req.cookies.get('spotify_refresh_token')?.value;

  if (!accessToken) {
    console.log('❌ Nenhum access token encontrado');
    return [];
  }

  try {
    spotifyApi.setAccessToken(accessToken);
    const response = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 50 });
    
    console.log('🔵 Dados brutos do Spotify (Recently Played):', JSON.stringify(response.body.items, null, 2));
    
    // Agrupar por música e contar reproduções
    const trackMap = new Map();
    response.body.items.forEach((item: any) => {
      const trackId = item.track.id;
      if (!trackMap.has(trackId)) {
        trackMap.set(trackId, {
          id: trackId,
          name: item.track.name,
          artist: item.track.artists[0]?.name || '',
          image: item.track.album.images[0]?.url || '',
          popularity: item.track.popularity,
          playCount: 1,
          lastPlayed: item.played_at
        });
      } else {
        trackMap.get(trackId).playCount += 1;
      }
    });
    
    // Ordenar por número de reproduções e pegar os top
    const tracks = Array.from(trackMap.values())
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit)
      .map((track, index) => ({
        ...track,
        rank: index + 1
      }));
    
    console.log('🟢 Tracks processadas para imagem (Recently Played):', tracks);
    return tracks;
  } catch (error: any) {
    console.error('❌ Erro ao buscar recently played tracks:', error);
    
    if (error.statusCode === 401 && refreshToken) {
      try {
        console.log('🔄 Tentando renovar token...');
        spotifyApi.setRefreshToken(refreshToken);
        const data = await spotifyApi.refreshAccessToken();
        spotifyApi.setAccessToken(data.body.access_token);
        
        const response = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 50 });
        
        console.log('🔵 Dados brutos do Spotify (token renovado):', JSON.stringify(response.body.items, null, 2));
        
        // Agrupar por música e contar reproduções
        const trackMap = new Map();
        response.body.items.forEach((item: any) => {
          const trackId = item.track.id;
          if (!trackMap.has(trackId)) {
            trackMap.set(trackId, {
              id: trackId,
              name: item.track.name,
              artist: item.track.artists[0]?.name || '',
              image: item.track.album.images[0]?.url || '',
              popularity: item.track.popularity,
              playCount: 1,
              lastPlayed: item.played_at
            });
          } else {
            trackMap.get(trackId).playCount += 1;
          }
        });
        
        // Ordenar por número de reproduções e pegar os top
        const tracks = Array.from(trackMap.values())
          .sort((a, b) => b.playCount - a.playCount)
          .slice(0, limit)
          .map((track, index) => ({
            ...track,
            rank: index + 1
          }));
        
        console.log('🟢 Tracks processadas para imagem (token renovado):', tracks);
        return tracks;
      } catch (refreshError) {
        console.error('❌ Erro ao renovar token:', refreshError);
        return [];
      }
    }
    return [];
  }
}

function buildTopTrackDayHTML(tracks: any[]) {
  const hoje = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const logoBase64 = getImageAsBase64('logo-yellow.png');
  const destaque = tracks[0];
  const outros = tracks.slice(1);
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', Arial, sans-serif; width: 1080px; height: 1920px; background: linear-gradient(180deg, #191c1a 60%, #1DB954 100%); margin: 0; padding: 0; }
        .top-track-card { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; position: relative; }
        .header { text-align: center; margin-top: 64px; margin-bottom: 32px; }
        .title { font-size: 64px; font-weight: 900; color: #fff; margin-bottom: 8px; text-shadow: 2px 2px 8px #0006; letter-spacing: 2px; text-transform: uppercase; }
        .date { font-size: 28px; font-weight: 600; color: #ffe066; opacity: 0.95; text-transform: capitalize; margin-bottom: 8px; }
        .destaque { background: rgba(25,28,26,0.95); border-radius: 40px; padding: 40px 48px 32px 48px; box-shadow: 0 8px 48px #000a; display: flex; flex-direction: column; align-items: center; width: 520px; margin-bottom: 48px; }
        .destaque-img { width: 260px; height: 260px; border-radius: 32px; object-fit: cover; margin-bottom: 32px; border: 6px solid #fff; box-shadow: 0 8px 32px #0006; }
        .destaque-nome { font-size: 38px; font-weight: 900; color: #fff; margin-bottom: 10px; text-align: center; text-shadow: 1px 1px 8px #0006; }
        .destaque-artista { font-size: 24px; font-weight: 700; color: #ffe066; margin-bottom: 10px; text-align: center; }
        .destaque-repro { font-size: 20px; font-weight: 600; color: #fff; opacity: 0.85; margin-bottom: 10px; text-align: center; }
        .destaque-rank { background: #1DB954; color: #fff; font-size: 22px; font-weight: 900; border-radius: 16px; padding: 6px 24px; margin-bottom: 8px; display: inline-block; letter-spacing: 1px; }
        .outros-lista { width: 600px; display: flex; flex-direction: column; gap: 24px; margin: 0 auto 48px auto; }
        .outro-item { display: flex; align-items: center; background: rgba(255,255,255,0.10); border-radius: 24px; padding: 18px 32px; box-shadow: 0 2px 12px #0002; }
        .outro-img { width: 90px; height: 90px; border-radius: 16px; object-fit: cover; margin-right: 28px; border: 4px solid #fff; }
        .outro-info { flex: 1; }
        .outro-nome { font-size: 26px; font-weight: 700; color: #fff; margin-bottom: 4px; text-shadow: 1px 1px 4px #0006; }
        .outro-artista { font-size: 18px; font-weight: 600; color: #ffe066; opacity: 0.95; }
        .outro-repro { font-size: 16px; font-weight: 600; color: #fff; opacity: 0.8; }
        .outro-rank { background: #1DB954; color: #fff; font-size: 20px; font-weight: 900; border-radius: 10px; padding: 4px 16px; margin-left: 18px; display: inline-block; }
        .footer { text-align: center; position: absolute; bottom: 48px; left: 0; right: 0; }
        .footer img { height: 56px; width: auto; border-radius: 12px; object-fit: contain; }
        .footer-url { font-size: 22px; font-weight: 700; color: #ffe066; margin-top: 12px; letter-spacing: 1px; }
      </style>
    </head>
    <body>
      <div class="top-track-card">
        <div class="header">
          <div class="title">Top Track Day</div>
          <div class="date">${hoje}</div>
        </div>
        <div class="destaque">
          <img src="${destaque.image}" alt="${destaque.name}" class="destaque-img" />
          <div class="destaque-nome">${destaque.name}</div>
          <div class="destaque-artista">${destaque.artist}</div>
          <div class="destaque-repro">${destaque.playCount} reprodução${destaque.playCount > 1 ? 'ões' : ''}</div>
          <div class="destaque-rank">#1</div>
        </div>
        <div class="outros-lista">
          ${outros.map(track => `
            <div class="outro-item">
              <img src="${track.image}" alt="${track.name}" class="outro-img" />
              <div class="outro-info">
                <div class="outro-nome">${track.name}</div>
                <div class="outro-artista">${track.artist}</div>
                <div class="outro-repro">${track.playCount} reprodução${track.playCount > 1 ? 'ões' : ''}</div>
              </div>
              <div class="outro-rank">#${track.rank}</div>
            </div>
          `).join('')}
        </div>
        <div class="footer">
          <img src="${logoBase64}" alt="Logo"/>
          <div class="footer-url">scrobblewall.art</div>
        </div>
      </div>
    </body>
  </html>
  `;
}

export async function GET(req: NextRequest) {
  try {
    // Sempre usar 5 músicas
    const limit = 5;
    const tracks = await getRecentlyPlayedTracks(req, limit);
    if (tracks.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhuma música encontrada ou usuário não autenticado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const html = buildTopTrackDayHTML(tracks);
    const browser = await puppeteer.launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    const buffer = await page.screenshot({ type: 'png' });
    await browser.close();
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('❌ Erro ao gerar Top Track Day:', err);
    return new Response(JSON.stringify({ error: 'Erro ao gerar Top Track Day' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 