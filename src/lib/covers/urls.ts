// Exact hosts and paths actually used by Last.fm; never a generic URL proxy.
const hosts = new Set(['lastfm.freetls.fastly.net', 'lastfm-img.freetls.fastly.net', 'lastfm-img2.akamaized.net']);

export function coverUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048 || /[\\\s]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
        !hosts.has(url.hostname) || url.search || url.hash ||
        !/^\/i\/u\/[a-zA-Z0-9]+\/[a-fA-F0-9]{32}\.(?:png|jpe?g|webp|gif)$/.test(url.pathname)) return null;
    if (url.pathname.includes('2a96cbd8b46e442fc41c2b86b821562f')) return null;
    return url.href;
  } catch { return null; }
}

export const MBID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
