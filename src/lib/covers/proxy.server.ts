import { lookup } from 'node:dns/promises';
import { request } from 'node:https';
import { isIP } from 'node:net';
import { coverUrl } from './urls';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export class ProxyError extends Error {
  constructor(public code: string, public status: number, public retryable = false) { super(code); }
}

// IPv6 is deliberately not used: no mapped IPv4, local scopes or transition ranges.
export function publicIPv4(address: string): boolean {
  if (isIP(address) !== 4) return false;
  const [a, b, c] = address.split('.').map(Number);
  return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 168 || b === 0 || (b === 88 && c === 99))) ||
    (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
    (a === 203 && b === 0 && c === 113));
}

function aborted<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const stop = () => reject(signal.reason);
    signal.addEventListener('abort', stop, { once: true });
    if (signal.aborted) stop();
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', stop));
  });
}

export interface ImageReply { status: number; type: string; location?: string; bytes: Buffer }
export type Transport = (url: URL, signal: AbortSignal) => Promise<ImageReply>;

export const pinnedRequest: Transport = async (url, signal) => {
  const addresses = await aborted(lookup(url.hostname, { all: true, family: 4 }), signal);
  if (!addresses.length || addresses.some(item => !publicIPv4(item.address))) throw new ProxyError('forbidden_dns', 403);
  const address = addresses[0].address;
  return new Promise((resolve, reject) => {
    // Pin the validated address to this exact connection; TLS still verifies the hostname.
    const req = request(url, {
      method: 'GET', signal, agent: false, family: 4,
      lookup: (_hostname, _options, callback) => callback(null, address, 4),
      headers: { Accept: 'image/jpeg,image/png,image/webp,image/gif', 'Accept-Encoding': 'identity',
        'User-Agent': 'ScrobbleWall/1.0 (+https://scrobblewall.com)' },
    }, response => {
      const status = response.statusCode || 502;
      const type = String(response.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
      const location = response.headers.location;
      if (status !== 200) {
        response.destroy();
        resolve({ status, type, location, bytes: Buffer.alloc(0) });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(type)) {
        response.destroy(); reject(new ProxyError('invalid_content', 422)); return;
      }
      if (Number(response.headers['content-length']) > MAX_IMAGE_BYTES || response.headers['content-encoding']) {
        response.destroy(); reject(new ProxyError('image_too_large_or_encoded', 413)); return;
      }
      const chunks: Buffer[] = [];
      let size = 0;
      response.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_IMAGE_BYTES) {
          response.destroy(); reject(new ProxyError('image_too_large', 413));
        } else chunks.push(chunk);
      });
      response.on('end', () => resolve({ status, type, bytes: Buffer.concat(chunks) }));
      response.on('error', reject);
      response.on('aborted', () => reject(new ProxyError('origin_network', 502, true)));
    });
    req.on('error', reject);
    req.end();
  });
};

export function validSignature(type: string, bytes: Buffer): boolean {
  if (type === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (type === 'image/jpeg') return bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (type === 'image/gif') return ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString('ascii'));
  if (type === 'image/webp') return bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  return false;
}

export async function retrieveImage(raw: unknown, signal: AbortSignal, transport: Transport = pinnedRequest): Promise<ImageReply> {
  let valid = coverUrl(raw);
  if (!valid) throw new ProxyError('invalid_url', 400);
  for (let redirects = 0; redirects <= 2; redirects++) {
    const reply = await transport(new URL(valid), signal);
    if ([301, 302, 303, 307, 308].includes(reply.status)) {
      let destination: string | undefined;
      try { destination = reply.location && new URL(reply.location, valid).href; }
      catch { throw new ProxyError('forbidden_redirect', 403); }
      valid = coverUrl(destination);
      if (!valid || redirects === 2) throw new ProxyError('forbidden_redirect', 403);
      continue;
    }
    if (reply.status !== 200) {
      const temporary = [408, 425, 429].includes(reply.status) || reply.status >= 500;
      throw new ProxyError(`origin_http_${reply.status}`, temporary ? (reply.status === 429 ? 429 : 502) : 404, temporary);
    }
    if (reply.bytes.length > MAX_IMAGE_BYTES) throw new ProxyError('image_too_large', 413);
    if (!validSignature(reply.type, reply.bytes)) throw new ProxyError('invalid_content', 422);
    return reply;
  }
  throw new ProxyError('forbidden_redirect', 403);
}

let active = 0;
export async function proxyResponse(req: Request, transport?: Transport): Promise<Response> {
  if (active >= 12) return Response.json({ error: 'proxy_busy', retryable: true }, {
    status: 429, headers: { 'Cache-Control': 'no-store', 'Retry-After': '2' },
  });
  active++;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('timeout')), 7000);
  const cancel = () => controller.abort(new Error('cancelled'));
  req.signal.addEventListener('abort', cancel, { once: true });
  if (req.signal.aborted) cancel();
  try {
    const result = await retrieveImage(new URL(req.url).searchParams.get('url'), controller.signal, transport);
    return new Response(new Uint8Array(result.bytes), { headers: {
      'Content-Type': result.type, 'Content-Length': String(result.bytes.length),
      'Cache-Control': 'public, max-age=3600, s-maxage=86400', 'X-Content-Type-Options': 'nosniff',
    } });
  } catch (error) {
    const failure = controller.signal.aborted
      ? new ProxyError(req.signal.aborted ? 'cancelled' : 'origin_timeout', req.signal.aborted ? 499 : 504, true)
      : error instanceof ProxyError ? error : new ProxyError('origin_network', 502, true);
    if (failure.retryable && failure.status !== 499) console.warn('[image-proxy]', failure.code);
    return Response.json({ error: failure.code, retryable: failure.retryable }, {
      status: failure.status, headers: { 'Cache-Control': 'no-store' },
    });
  } finally {
    clearTimeout(timer);
    req.signal.removeEventListener('abort', cancel);
    active--;
  }
}
