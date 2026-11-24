import { checkLastfmError, lastfmUrl, MetadataError, normalizeAlbums, record } from './metadata';

const cache = new Map<string, { value: unknown; expires: number }>();
const pending = new Map<string, Promise<unknown>>();
let active = 0;

// Bounded, success-only cache. Limits are per process/serverless instance.
export async function lastfm(method: string, params: Record<string, string>): Promise<unknown> {
  const key = process.env.LASTFM_API_KEY;
  if (!key) throw new MetadataError('metadata_configuration', 503);
  const cacheKey = JSON.stringify([method, params]);
  const hit = cache.get(cacheKey);
  if (hit && hit.expires > Date.now()) return hit.value;
  if (pending.has(cacheKey)) return pending.get(cacheKey)!;
  if (active >= 4) throw new MetadataError('metadata_busy', 429);
  const task = (async () => {
    active++;
    try {
      const response = await fetch(lastfmUrl(method, params, key), {
        signal: AbortSignal.timeout(6000), cache: 'no-store', redirect: 'error',
      });
      if (!response.ok) throw new MetadataError('metadata_http', response.status === 429 ? 503 : 502);
      const reader = response.body?.getReader();
      if (!reader) throw new MetadataError('malformed_metadata');
      let size = 0;
      const chunks: Uint8Array[] = [];
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 1024 * 1024) throw new MetadataError('metadata_too_large');
          chunks.push(value);
        }
      } finally { await reader.cancel().catch(() => {}); }
      let json: unknown;
      try { json = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
      catch { throw new MetadataError('malformed_metadata'); }
      checkLastfmError(json);
      if (!json || typeof json !== 'object' || !(method === 'album.getInfo' ? 'album' in json : 'topalbums' in json)) {
        throw new MetadataError('malformed_metadata');
      }
      if (method === 'user.gettopalbums') normalizeAlbums(json);
      else {
        const album = record(record(json).album);
        if (typeof album.name !== 'string' || typeof album.artist !== 'string') throw new MetadataError('malformed_album_info');
      }
      for (const [k, entry] of cache) if (entry.expires <= Date.now()) cache.delete(k);
      if (cache.size >= 100) cache.delete(cache.keys().next().value!);
      cache.set(cacheKey, { value: json, expires: Date.now() + 120_000 });
      return json;
    } catch (error) {
      if (error instanceof MetadataError) throw error;
      throw new MetadataError(error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name)
        ? 'metadata_timeout' : 'metadata_network');
    } finally { active--; }
  })();
  pending.set(cacheKey, task);
  try { return await task; } finally { pending.delete(cacheKey); }
}

export function metadataFailure(error: unknown) {
  const failure = error instanceof MetadataError ? error : new MetadataError('malformed_metadata');
  console.warn('[metadata]', failure.code);
  return Response.json({ error: failure.code }, { status: failure.status, headers: { 'Cache-Control': 'no-store' } });
}
