import type { Album } from './metadata';
import { coverUrl } from './urls';

export type CoverStatus = 'loading' | 'loaded' | 'retrying' | 'failed' | 'fallback';
export interface CoverAsset { src: string; image: HTMLImageElement }
export interface CoverState { status: CoverStatus; asset?: CoverAsset; error?: string }

class CoverError extends Error {
  constructor(public code: string, public retryable = false) { super(code); }
}
const abortError = () => new DOMException('Cancelled', 'AbortError');

function scope(parent: AbortSignal, ms: number) {
  const controller = new AbortController();
  const cancel = () => controller.abort(abortError());
  const timer = setTimeout(() => controller.abort(new CoverError('timeout', true)), ms);
  parent.addEventListener('abort', cancel, { once: true });
  if (parent.aborted) cancel();
  return { signal: controller.signal, clear: () => { clearTimeout(timer); parent.removeEventListener('abort', cancel); } };
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const stop = () => { clearTimeout(timer); signal.removeEventListener('abort', stop); reject(signal.reason); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', stop); resolve(); }, ms);
    signal.addEventListener('abort', stop, { once: true });
    if (signal.aborted) stop();
  });
}

export function decodeImage(src: string, signal: AbortSignal): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const cleanup = () => { image.onload = null; image.onerror = null; signal.removeEventListener('abort', stop); };
    const stop = () => { cleanup(); image.src = ''; reject(signal.reason); };
    image.onload = () => {
      if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 4_000_000) {
        cleanup(); reject(new CoverError('invalid_dimensions')); return;
      }
      // decode() also verifies that the renderer can actually consume these bytes.
      image.decode().then(() => { cleanup(); resolve(image); }, () => { cleanup(); reject(new CoverError('decode')); });
    };
    image.onerror = () => { cleanup(); reject(new CoverError('decode')); };
    signal.addEventListener('abort', stop, { once: true });
    if (signal.aborted) { stop(); return; }
    image.src = src;
  });
}

interface Dependencies {
  fetch: typeof fetch;
  decode: typeof decodeImage;
  createURL: (blob: Blob) => string;
  revokeURL: (src: string) => void;
  sleep: typeof sleep;
  requestTimeout: number;
  albumTimeout: number;
}

// Lifetime belongs to one result set. Successful assets expire for new lookups after
// ten minutes, but remain owned until disposal so preview/Canvas references stay valid.
export class CoverSession {
  states: CoverState[];
  private controller = new AbortController();
  private cache = new Map<string, { promise: Promise<CoverAsset>; expires: number; asset?: CoverAsset }>();
  private urls = new Set<string>();
  private estimatedBytes = 0;
  private jobs: Promise<void>[] = [];
  private queue: Array<() => void> = [];
  private active = 0;
  private started = false;
  private disposed = false;
  private deps: Dependencies;

  constructor(private albums: Album[], private changed: () => void, overrides: Partial<Dependencies> = {}) {
    this.states = albums.map(() => ({ status: 'loading' }));
    this.deps = { fetch: (...args) => fetch(...args), decode: decodeImage,
      createURL: blob => URL.createObjectURL(blob), revokeURL: src => URL.revokeObjectURL(src),
      sleep, requestTimeout: 8000, albumTimeout: 35_000, ...overrides };
  }

  private update(index: number, state: CoverState) {
    if (this.disposed) return;
    this.states[index] = state;
    this.changed();
  }

  private enqueue(index: number): Promise<void> {
    return new Promise(resolve => {
      this.queue.push(() => {
        if (this.disposed) { resolve(); return; }
        this.active++;
        this.resolve(index).finally(() => {
          this.active--; resolve(); this.pump();
        });
      });
      this.pump();
    });
  }

  private pump() {
    while (this.active < 4 && this.queue.length) this.queue.shift()!();
  }

  start() {
    if (this.started || this.disposed) return;
    this.started = true;
    this.jobs = this.albums.map((_, index) => this.enqueue(index));
  }

  async wait(): Promise<CoverAsset[]> {
    this.start();
    await Promise.all(this.jobs);
    if (this.disposed) throw abortError();
    return this.states.map(state => {
      if (!state.asset || !['loaded', 'fallback'].includes(state.status)) throw new Error('unusable_cover');
      return state.asset;
    });
  }

  retry(index: number) {
    if (this.disposed || !['failed', 'fallback'].includes(this.states[index]?.status)) return;
    this.update(index, { status: 'loading' });
    this.jobs[index] = this.enqueue(index);
  }

  previewFailed(index: number) {
    const asset = this.states[index]?.asset;
    if (!asset || this.disposed) return;
    for (const [key, entry] of this.cache) if (entry.asset === asset) this.cache.delete(key);
    for (let i = 0; i < this.states.length; i++) {
      if (this.states[i].asset === asset) this.update(i, { status: 'failed', error: 'preview_decode' });
    }
    this.deps.revokeURL(asset.src);
    this.urls.delete(asset.src);
    this.estimatedBytes -= asset.image.naturalWidth * asset.image.naturalHeight * 4;
  }

  private async attempts<T>(operation: () => Promise<T>, signal: AbortSignal, retrying: () => void): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt++) {
      signal.throwIfAborted();
      try { return await operation(); } catch (error) {
        if (signal.aborted) throw signal.reason;
        const failure = error instanceof CoverError ? error : new CoverError('network', true);
        if (!failure.retryable) throw failure;
        if (attempt === 2) throw new CoverError(`attempts_exhausted:${failure.code}`);
        retrying();
        await this.deps.sleep(300 * 2 ** attempt + Math.random() * 150, signal);
      }
    }
    throw new CoverError('attempts_exhausted');
  }

  private async response(path: string, signal: AbortSignal): Promise<Response> {
    const response = await this.deps.fetch(path, { signal, credentials: 'same-origin', redirect: 'error' });
    if (!response.ok) {
      const temporary = [408, 425, 429].includes(response.status) || response.status >= 500;
      let code = path.startsWith('/api/album-art') ? 'metadata_http' : 'proxy_http';
      try { const body = await response.json(); if (typeof body.error === 'string') code = body.error; } catch { /* no payload */ }
      throw new CoverError(code, temporary);
    }
    return response;
  }

  private asset(path: string, signal: AbortSignal, retrying: () => void): Promise<CoverAsset> {
    const hit = this.cache.get(path);
    if (hit && hit.expires > Date.now()) return hit.promise;
    const promise = this.attempts(async () => {
      const attempt = scope(signal, this.deps.requestTimeout);
      let src: string | undefined;
      try {
        const response = await this.response(path, attempt.signal);
        if (!/^image\/(png|jpeg|webp|gif)(;|$)/i.test(response.headers.get('content-type') || '')) throw new CoverError('invalid_content');
        const blob = await response.blob();
        if (!blob.size || blob.size > 5 * 1024 * 1024) throw new CoverError('invalid_size');
        src = this.deps.createURL(blob);
        let image: HTMLImageElement;
        try { image = await this.deps.decode(src, attempt.signal); } catch (error) {
          if (attempt.signal.aborted) throw attempt.signal.reason;
          throw new CoverError(error instanceof CoverError ? error.code : 'decode');
        }
        attempt.signal.throwIfAborted();
        const bytes = image.naturalWidth * image.naturalHeight * 4;
        // Leave room for the shared fallback; try a smaller Last.fm resolution
        // instead of retaining an unbounded amount of decoded image memory.
        const limit = path === '/fallback1.png' ? 96 * 1024 * 1024 : 80 * 1024 * 1024;
        if (this.estimatedBytes + bytes > limit) throw new CoverError('decoded_memory_limit');
        this.estimatedBytes += bytes;
        this.urls.add(src);
        return { src, image };
      } catch (error) {
        if (src) this.deps.revokeURL(src);
        if (attempt.signal.aborted) throw attempt.signal.reason;
        throw error;
      } finally { attempt.clear(); }
    }, signal, retrying);
    const entry = { promise, expires: Date.now() + 600_000, asset: undefined as CoverAsset | undefined };
    this.cache.set(path, entry);
    promise.then(asset => { entry.asset = asset; }, () => {});
    promise.catch(() => { if (this.cache.get(path)?.promise === promise) this.cache.delete(path); });
    return promise;
  }

  private async alternatives(album: Album, signal: AbortSignal, retrying: () => void): Promise<string[]> {
    if (!album.name.trim() || !album.artist.trim()) return [];
    const params = new URLSearchParams({ name: album.name, artist: album.artist, ...(album.mbid ? { mbid: album.mbid } : {}) });
    return this.attempts(async () => {
      const attempt = scope(signal, this.deps.requestTimeout);
      try {
        const response = await this.response(`/api/album-art?${params}`, attempt.signal);
        const body = await response.json();
        return Array.isArray(body.images) ? body.images.filter((url: unknown) => !!coverUrl(url)) : [];
      } catch (error) {
        if (attempt.signal.aborted) throw attempt.signal.reason;
        throw error;
      } finally { attempt.clear(); }
    }, signal, retrying);
  }

  private async resolve(index: number) {
    const album = this.albums[index];
    const deadline = scope(this.controller.signal, this.deps.albumTimeout);
    let reason = album.image ? 'invalid_url' : 'missing_url';
    const retrying = () => this.update(index, { status: 'retrying' });
    const tried = new Set<string>();
    const candidates = async (urls: string[]): Promise<boolean> => {
      for (const raw of urls) {
        const url = coverUrl(raw);
        if (!url || tried.has(url)) continue;
        tried.add(url);
        try {
          const asset = await this.asset(`/api/image-proxy?${new URLSearchParams({ url })}`, deadline.signal, retrying);
          deadline.signal.throwIfAborted();
          this.update(index, { status: 'loaded', asset });
          return true;
        } catch (error) {
          if (deadline.signal.aborted) throw deadline.signal.reason;
          reason = error instanceof CoverError ? error.code : 'network';
        }
      }
      return false;
    };
    try {
      if (await candidates([album.image, ...(album.images || [])])) return;
      if (await candidates(await this.alternatives(album, deadline.signal, retrying))) return;
    } catch (error) {
      reason = error instanceof CoverError ? error.code : 'network';
    } finally { deadline.clear(); }
    if (this.disposed) return;
    this.update(index, { status: 'failed', error: reason });
    const fallbackBudget = scope(this.controller.signal, 8000);
    try {
      const asset = await this.asset('/fallback1.png', fallbackBudget.signal, retrying);
      this.update(index, { status: 'fallback', asset, error: reason });
      console.warn('[covers]', { code: 'fallback', reason, index });
    } catch {
      this.update(index, { status: 'failed', error: 'fallback_unavailable' });
      if (!this.disposed) console.warn('[covers]', { code: 'fallback_unavailable', reason, index });
    } finally { fallbackBudget.clear(); }
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.controller.abort(abortError());
    for (const src of this.urls) this.deps.revokeURL(src);
    this.urls.clear(); this.cache.clear();
    this.estimatedBytes = 0;
    this.pump();
  }
}
