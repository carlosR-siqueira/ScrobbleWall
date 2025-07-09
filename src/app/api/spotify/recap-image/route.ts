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

// Função para carregar imagem como base64
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

async function getSpotifyTop(req: NextRequest, type: 'artist' | 'track') {
  const limit = 10;
  const time_range = 'short_term';
  const accessToken = req.cookies.get('spotify_access_token')?.value;
  const refreshToken = req.cookies.get('spotify_refresh_token')?.value;

  if (!accessToken) {
    return [];
  }

  try {
    spotifyApi.setAccessToken(accessToken);
    if (type === 'artist') {
      const response = await spotifyApi.getMyTopArtists({ limit, time_range });
      return response.body.items.map((artist: any) => ({
        name: artist.name,
        image: artist.images[0]?.url || '',
        popularity: artist.popularity,
        type: 'artist',
      }));
    } else {
      const response = await spotifyApi.getMyTopTracks({ limit, time_range });
      return response.body.items.map((track: any) => ({
        name: track.name,
        artist: track.artists[0]?.name || '',
        image: track.album.images[0]?.url || '',
        popularity: track.popularity,
        type: 'track',
      }));
    }
  } catch (error: any) {
    if (error.statusCode === 401 && refreshToken) {
      try {
        spotifyApi.setRefreshToken(refreshToken);
        const data = await spotifyApi.refreshAccessToken();
        spotifyApi.setAccessToken(data.body.access_token);
        // Retry
        if (type === 'artist') {
          const response = await spotifyApi.getMyTopArtists({ limit, time_range });
          return response.body.items.map((artist: any) => ({
            name: artist.name,
            image: artist.images[0]?.url || '',
            popularity: artist.popularity,
            type: 'artist',
          }));
        } else {
          const response = await spotifyApi.getMyTopTracks({ limit, time_range });
          return response.body.items.map((track: any) => ({
            name: track.name,
            artist: track.artists[0]?.name || '',
            image: track.album.images[0]?.url || '',
            popularity: track.popularity,
            type: 'track',
          }));
        }
      } catch {
        return [];
      }
    }
    return [];
  }
}

function buildRecapHTML({ artists, tracks }: { artists: any[]; tracks: any[] }) {
  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const totalMinutes = Math.floor(Math.random() * 1000) + 500; // Simulado por enquanto
  
  // Carregar logo como base64
  const logoBase64 = getImageAsBase64('logo-yellow.png');
  
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Poppins', Arial, sans-serif;
          width: 1080px;
          height: 1920px;
          background: #191c1a;
          margin: 0;
          padding: 0;
        }
        .recap-card {
          background: #191c1a;
          border-radius: 48px;
          padding: 64px 48px 120px 48px;
          width: 100%;
          height: 100%;
          box-shadow: 0 8px 48px #000a;
          border: none;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          position: relative;
        }
        .recap-title {
          font-size: 72px;
          font-weight: 900;
          color: #fff;
          text-align: center;
          margin-bottom: 0px;
          text-shadow: 2px 2px 8px #0006;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .recap-month {
          font-size: 48px;
          font-weight: 800;
          color: #1DB954;
          text-align: center;
          margin-bottom: 48px;
          margin-top: 12px;
          text-shadow: 1px 1px 4px #0006;
          letter-spacing: 1px;
          text-transform: capitalize;
        }
        .section-label {
          font-size: 40px;
          font-weight: 900;
          color: #ffe066;
          margin: 0 0 32px 0;
          text-shadow: 1px 1px 4px #0006;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .split-section {
          display: flex;
          flex-direction: row;
          gap: 40px;
          margin-bottom: 48px;
        }
        .main-item {
          flex: 1.2;
          background: linear-gradient(135deg, #1DB954 60%, #191414 100%);
          border-radius: 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 36px 10px;
          box-shadow: 0 2px 12px #0004;
        }
        .main-item img {
          width: 220px;
          height: 220px;
          border-radius: 24px;
          object-fit: cover;
          border: 6px solid #fff;
          margin-bottom: 24px;
        }
        .main-item-title {
          font-size: 44px;
          font-weight: 900;
          color: #fff;
          margin-bottom: 12px;
          text-align: center;
          text-shadow: 2px 2px 8px #0006;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .main-item-sub {
          font-size: 28px;
          color: #ffe066;
          font-weight: 700;
          margin-bottom: 12px;
          text-align: center;
          text-shadow: 1px 1px 4px #0006;
        }
        .main-item-rank {
          font-size: 28px;
          color: #fff;
          background: #1DB954;
          border-radius: 12px;
          padding: 6px 28px;
          font-weight: 900;
          margin-top: 12px;
          display: inline-block;
        }
        .side-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
          justify-content: center;
        }
        .side-list-item {
          display: flex;
          align-items: center;
          background: #232623;
          border-radius: 20px;
          padding: 16px 24px;
          gap: 18px;
          box-shadow: 0 2px 8px #0002;
        }
        .side-list-item img {
          width: 80px;
          height: 80px;
          border-radius: 16px;
          object-fit: cover;
          border: 3px solid #fff;
        }
        .side-list-info {
          display: flex;
          flex-direction: column;
        }
        .side-list-title {
          font-size: 26px;
          font-weight: 900;
          color: #fff;
          text-shadow: 1px 1px 4px #0006;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .side-list-sub {
          font-size: 18px;
          color: #ffe066;
          font-weight: 700;
        }
        .side-list-rank {
          font-size: 20px;
          color: #fff;
          background: #191414;
          border-radius: 10px;
          padding: 2px 16px;
          font-weight: 900;
          margin-left: 12px;
        }
        .listening-time {
          margin: 32px 0 32px 0;
          background: linear-gradient(90deg, #1DB954 0%, #191414 100%);
          color: #fff;
          font-size: 38px;
          font-weight: 900;
          border-radius: 16px;
          padding: 18px 0;
          text-align: center;
          box-shadow: 0 2px 8px #0003;
          letter-spacing: 1px;
        }
        .recap-footer {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          background: #111;
          border-bottom-left-radius: 32px;
          border-bottom-right-radius: 32px;
          width: 100%;
          min-height: 80px;
          padding: 12px 48px;
          box-sizing: border-box;
        }
        .recap-footer img {
          height: 56px;
          width: auto;
          border-radius: 12px;
          object-fit: contain;
          display: block;
        }
        .recap-footer-url {
          font-size: 28px;
          font-weight: 600;
          color: #ffe066;
          letter-spacing: 1px;
          text-shadow: 1px 1px 4px #0006;
          font-family: 'Poppins', Arial, sans-serif;
        }
      </style>
    </head>
    <body>
      <div class="recap-card">
        <div class="recap-title">Spotify Recap</div>
        <div class="recap-month">${mesAtual}</div>
        <div class="section-label">Top artistas</div>
        <div class="split-section">
          <div class="main-item">
            <img src="${artists[0]?.image || ''}" alt="${artists[0]?.name || ''}" />
            <div class="main-item-title">${artists[0]?.name || '-'}</div>
            <div class="main-item-sub">Artista mais ouvido</div>
            <div class="main-item-rank">#1</div>
          </div>
          <div class="side-list">
            ${artists.slice(1, 5).map((a, i) => `
              <div class="side-list-item">
                <img src="${a.image}" alt="${a.name}" />
                <div class="side-list-info">
                  <div class="side-list-title">${a.name}</div>
                  <div class="side-list-sub">Artista</div>
                </div>
                <div class="side-list-rank">#${i + 2}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="section-label">Músicas mais ouvidas</div>
        <div class="split-section">
          <div class="main-item">
            <img src="${tracks[0]?.image || ''}" alt="${tracks[0]?.name || ''}" />
            <div class="main-item-title">${tracks[0]?.name || '-'}</div>
            <div class="main-item-sub">${tracks[0]?.artist || '-'}<br/>Música mais ouvida</div>
            <div class="main-item-rank">#1</div>
          </div>
          <div class="side-list">
            ${tracks.slice(1, 5).map((t, i) => `
              <div class="side-list-item">
                <img src="${t.image}" alt="${t.name}" />
                <div class="side-list-info">
                  <div class="side-list-title">${t.name}</div>
                  <div class="side-list-sub">${t.artist}</div>
                </div>
                <div class="side-list-rank">#${i + 2}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="listening-time">${totalMinutes} minutos ouvindo</div>
        <div class="recap-footer">
          <img src="${logoBase64}" alt="Logo"/>
          <span class="recap-footer-url">scrobblewall.art/recap</span>
        </div>
      </div>
    </body>
  </html>
  `;
}

export async function GET(req: NextRequest) {
  try {
    // Buscar top artistas e top músicas diretamente
    const [artists, tracks] = await Promise.all([
      getSpotifyTop(req, 'artist'),
      getSpotifyTop(req, 'track'),
    ]);

    // Montar HTML recap
    const html = buildRecapHTML({ artists, tracks });
    
    console.log('Gerando imagem recap com', artists.length, 'artistas e', tracks.length, 'músicas');

    // Gerar imagem com Puppeteer
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Aguardar um pouco para garantir que a imagem seja carregada
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
    console.error('Erro ao gerar imagem recap:', err);
    return new Response(JSON.stringify({ error: 'Erro ao gerar imagem recap' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 
