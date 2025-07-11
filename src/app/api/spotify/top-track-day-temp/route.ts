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

async function getRecentlyPlayedTracks(req: NextRequest, limit: number) {
  const accessToken = req.cookies.get('spotify_access_token')?.value;
  const refreshToken = req.cookies.get('spotify_refresh_token')?.value;

  if (!accessToken) {
    return [];
  }

  try {
    spotifyApi.setAccessToken(accessToken);
    const response = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 50 });
    
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

    // Converter para array, ordenar por contagem de reproduções e pegar os top
    const tracks = Array.from(trackMap.values())
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);

    return tracks;
  } catch (error: any) {
    if (error.statusCode === 401 && refreshToken) {
      try {
        spotifyApi.setRefreshToken(refreshToken);
        const data = await spotifyApi.refreshAccessToken();
        spotifyApi.setAccessToken(data.body.access_token);
        
        // Retry
        const response = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 50 });
        
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

        const tracks = Array.from(trackMap.values())
          .sort((a, b) => b.playCount - a.playCount)
          .slice(0, limit);

        return tracks;
      } catch {
        return [];
      }
    }
    return [];
  }
}

function buildTopTrackDayHTML(tracks: any[], limit: number) {
  const hoje = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Carregar logo como base64
  const logoBase64 = getImageAsBase64('logo-yellow.png');
  
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Poppins', Arial, sans-serif;
          width: 1080px;
          height: 1080px;
          background: #191c1a;
          margin: 0;
          padding: 0;
        }
        
        .top-track-card {
          background: linear-gradient(135deg, #1DB954 0%, #191414 100%);
          border-radius: 48px;
          padding: 64px 48px;
          width: 100%;
          height: 100%;
          box-shadow: 0 8px 48px #000a;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }
        
        .header {
          text-align: center;
          margin-bottom: 48px;
        }
        
        .title {
          font-size: 72px;
          font-weight: 900;
          color: #fff;
          margin-bottom: 16px;
          text-shadow: 2px 2px 8px #0006;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        
        .subtitle {
          font-size: 32px;
          font-weight: 700;
          color: #ffe066;
          margin-bottom: 8px;
          text-shadow: 1px 1px 4px #0006;
        }
        
        .date {
          font-size: 24px;
          font-weight: 600;
          color: #fff;
          opacity: 0.8;
          text-transform: capitalize;
        }
        
        .tracks-grid {
          display: grid;
          grid-template-columns: repeat(${limit <= 5 ? 2 : 3}, 1fr);
          gap: 24px;
          flex: 1;
          align-items: center;
        }
        
        .track-item {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 24px;
          text-align: center;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          position: relative;
        }
        
        .track-rank {
          position: absolute;
          top: -12px;
          left: -12px;
          background: #1DB954;
          color: #fff;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 18px;
          border: 3px solid #fff;
          box-shadow: 0 2px 8px #0004;
        }
        
        .track-image {
          width: 120px;
          height: 120px;
          border-radius: 16px;
          object-fit: cover;
          margin-bottom: 16px;
          border: 4px solid #fff;
          box-shadow: 0 4px 16px #0004;
        }
        
        .track-name {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
          line-height: 1.2;
          text-shadow: 1px 1px 4px #0006;
        }
        
        .track-artist {
          font-size: 16px;
          font-weight: 600;
          color: #ffe066;
          opacity: 0.9;
        }
        
        .play-count {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          opacity: 0.7;
          margin-top: 8px;
        }
        
        .footer {
          text-align: center;
          margin-top: 32px;
        }
        
        .footer img {
          height: 48px;
          width: auto;
          border-radius: 8px;
          object-fit: contain;
        }
        
        .footer-url {
          font-size: 18px;
          font-weight: 600;
          color: #ffe066;
          margin-top: 8px;
          letter-spacing: 1px;
        }
      </style>
    </head>
    <body>
      <div class="top-track-card">
        <div class="header">
          <div class="title">Top Track Day</div>
          <div class="subtitle">Suas músicas mais ouvidas</div>
          <div class="date">${hoje}</div>
        </div>
        
        <div class="tracks-grid">
          ${tracks.map((track, index) => `
            <div class="track-item">
              <div class="track-rank">#${index + 1}</div>
              <img src="${track.image}" alt="${track.name}" class="track-image" />
              <div class="track-name">${track.name}</div>
              <div class="track-artist">${track.artist}</div>
              <div class="play-count">${track.playCount} reprodução${track.playCount > 1 ? 'ões' : ''}</div>
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
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '3');
    
    // Validar limite
    if (![3, 5, 10].includes(limit)) {
      return new Response(JSON.stringify({ error: 'Limite inválido. Use 3, 5 ou 10.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Buscar músicas recentes
    const tracks = await getRecentlyPlayedTracks(req, limit);
    
    if (tracks.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhuma música encontrada ou usuário não autenticado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Gerando Top Track Day com', tracks.length, 'músicas');

    // Montar HTML
    const html = buildTopTrackDayHTML(tracks, limit);
    
    // Gerar imagem com Puppeteer
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Aguardar um pouco para garantir que as imagens sejam carregadas
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
    console.error('Erro ao gerar Top Track Day:', err);
    return new Response(JSON.stringify({ error: 'Erro ao gerar Top Track Day' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 