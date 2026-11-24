import { coverUrl, MBID } from './urls';

export interface Album {
  name: string;
  artist: string;
  playcount: number;
  image: string;
  images: string[];
  mbid?: string;
}

export class MetadataError extends Error {
  constructor(public code: string, public status = 502) { super(code); }
}

export function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}

export function imageCandidates(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const priority: Record<string, number> = { mega: 6, extralarge: 5, large: 4, medium: 3, small: 2, '': 1 };
  return [...new Set(value.map(record)
    .sort((a, b) => (priority[String(b.size)] || 0) - (priority[String(a.size)] || 0))
    .map(item => coverUrl(item['#text'])).filter((url): url is string => !!url))];
}

export function checkLastfmError(value: unknown) {
  const json = record(value);
  if (json.error !== undefined) {
    const code = Number(json.error);
    throw new MetadataError(`lastfm_${Number.isFinite(code) ? code : 'error'}`,
      code === 6 ? 404 : [11, 16, 29].includes(code) ? 503 : 502);
  }
  return json;
}

export function normalizeAlbums(value: unknown): Album[] {
  const top = record(checkLastfmError(value).topalbums);
  if (!Array.isArray(top.album)) throw new MetadataError('malformed_metadata');
  return top.album.map((value): Album => {
    const item = record(value);
    const artist = typeof item.artist === 'string' ? item.artist : record(item.artist).name;
    if (typeof item.name !== 'string' || typeof artist !== 'string') throw new MetadataError('malformed_album');
    const images = imageCandidates(item.image);
    const count = Number(item.playcount);
    return { name: item.name, artist, images, image: images[0] || '',
      playcount: Number.isFinite(count) && count >= 0 ? count : 0,
      ...(typeof item.mbid === 'string' && MBID.test(item.mbid) ? { mbid: item.mbid } : {}) };
  });
}

export function lastfmUrl(method: string, params: Record<string, string>, key: string) {
  const url = new URL('https://ws.audioscrobbler.com/2.0/');
  url.search = new URLSearchParams({ ...params, method, api_key: key, format: 'json' }).toString();
  return url;
}

const identity = (s: string) => s.normalize('NFC').trim().toLocaleLowerCase('en-US');
export function infoImages(value: unknown, expected: { name: string; artist: string; mbid?: string }): string[] {
  const album = record(checkLastfmError(value).album);
  if (typeof album.name !== 'string' || typeof album.artist !== 'string') throw new MetadataError('malformed_album_info');
  if (identity(album.name) !== identity(expected.name) || identity(album.artist) !== identity(expected.artist)) return [];
  if (expected.mbid && album.mbid !== expected.mbid) return [];
  return imageCandidates(album.image);
}
