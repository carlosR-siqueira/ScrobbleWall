import { infoImages } from '../../../lib/covers/metadata';
import { lastfm, metadataFailure } from '../../../lib/covers/lastfm.server';
import { MBID } from '../../../lib/covers/urls';

export const runtime = 'nodejs';

// Called only after the ranking's image candidates fail.
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const name = params.get('name') || '';
  const artist = params.get('artist') || '';
  const mbid = params.get('mbid') || undefined;
  if (!name.trim() || !artist.trim() || name.length > 300 || artist.length > 300 || (mbid && !MBID.test(mbid))) {
    return Response.json({ error: 'invalid_parameters' }, { status: 400 });
  }
  try {
    const query: Record<string, string> = mbid ? { mbid, autocorrect: '0' } : { album: name, artist, autocorrect: '0' };
    const images = infoImages(await lastfm('album.getInfo', query), { name, artist, mbid });
    return Response.json({ images }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return metadataFailure(error); }
}
