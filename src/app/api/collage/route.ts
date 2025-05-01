import { NextRequest } from 'next/server';

const API_KEY = process.env.LASTFM_API_KEY!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  const period = searchParams.get('period') || '7day';
  const limit = searchParams.get('limit') || '9';

  if (!username) {
    return new Response(JSON.stringify({ error: 'Missing username' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${username}&api_key=${API_KEY}&format=json&period=${period}&limit=${limit}`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    const albums = json.topalbums?.album?.map((item: any) => ({
      name: item.name,
      artist: item.artist.name,
      image: item.image[3]['#text'] || '',
    })) || [];

    return new Response(JSON.stringify({ albums }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro ao buscar dados do Last.fm' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}