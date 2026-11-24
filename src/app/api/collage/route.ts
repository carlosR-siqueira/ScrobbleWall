import { normalizeAlbums } from '../../../lib/covers/metadata';
import { lastfm, metadataFailure } from '../../../lib/covers/lastfm.server';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const username = params.get('username')?.trim();
  const period = params.get('period') || '7day';
  const limit = params.get('limit') || '9';
  if (!username || username.length > 100 || !['7day', '1month', '3month', '6month', '12month', 'overall'].includes(period) ||
      !['9', '16', '25'].includes(limit)) return Response.json({ error: 'invalid_parameters' }, { status: 400 });
  try {
    const albums = normalizeAlbums(await lastfm('user.gettopalbums', { user: username, period, limit, extended: '1' })).slice(0, Number(limit));
    return Response.json({ albums }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return metadataFailure(error); }
}
