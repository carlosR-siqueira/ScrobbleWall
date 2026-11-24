const { test } = require('node:test');
const assert = require('node:assert/strict');
const { CoverSession } = require('../.test-build/lib/covers/resolver');
const url = n => `https://lastfm.freetls.fastly.net/i/u/300x300/${String(n).padStart(32, 'a')}.png`;
const album = (image = url(1)) => ({ name: 'Album', artist: 'Artist', image, images: image ? [image] : [], playcount: 4 });
function harness(fetcher, extra = {}) {
  let objects = 0;
  const revoked = [];
  const deps = { fetch: fetcher, decode: async src => ({ src, naturalWidth: 300, naturalHeight: 300 }),
    createURL: () => `blob:${++objects}`, revokeURL: src => revoked.push(src), sleep: async () => {},
    requestTimeout: 1000, albumTimeout: 2000, ...extra };
  return { deps, revoked };
}
const image = () => new Response(new Blob(['image'], { type: 'image/png' }), { headers: { 'Content-Type': 'image/png' } });
const unavailable = () => Response.json({ error: 'origin_http', retryable: false }, { status: 404 });
test('successful cover is decoded once and reused by export', async () => {
  let calls = 0;
  const { deps, revoked } = harness(async () => { calls++; return image(); });
  const session = new CoverSession([album()], () => {}, deps);
  session.start();
  const [asset] = await session.wait();
  assert.equal(session.states[0].status, 'loaded');
  assert.equal((await session.wait())[0], asset);
  assert.equal(calls, 1);
  session.dispose();
  assert.deepEqual(revoked, ['blob:1']);
});
test('transient network failure retries then succeeds with visible retry state', async () => {
  let calls = 0;
  const events = [];
  const { deps } = harness(async () => { if (++calls === 1) throw new TypeError('network'); return image(); });
  const session = new CoverSession([album()], () => events.push(session.states[0].status), deps);
  session.start(); await session.wait();
  assert.equal(calls, 2);
  assert.ok(events.includes('retrying'));
  session.dispose();
});
test('permanent error tries alternate resolution without retrying 404', async () => {
  const calls = [];
  const { deps } = harness(async path => { calls.push(path); return calls.length === 1 ? unavailable() : image(); });
  const session = new CoverSession([{ ...album(), images: [url(1), url(2)] }], () => {}, deps);
  session.start(); await session.wait();
  assert.equal(calls.length, 2);
  assert.equal(session.states[0].status, 'loaded');
  session.dispose();
});
test('permanent failure exhausts metadata alternatives before decoded fallback', async () => {
  const calls = [];
  const { deps } = harness(async path => {
    calls.push(path);
    if (path.startsWith('/api/album-art')) return Response.json({ images: [] });
    return path === '/fallback1.png' ? image() : unavailable();
  });
  const session = new CoverSession([album()], () => {}, deps);
  session.start(); await session.wait();
  assert.equal(session.states[0].status, 'fallback');
  assert.equal(calls.length, 3);
  session.dispose();
});
test('timeout is bounded and exhausts only three transient attempts', async () => {
  let calls = 0;
  const { deps } = harness(async (path, options) => {
    if (path.startsWith('/api/album-art')) return Response.json({ images: [] });
    if (path === '/fallback1.png') return image();
    calls++;
    return new Promise((_, reject) => options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true }));
  }, { requestTimeout: 20 });
  const session = new CoverSession([album()], () => {}, deps);
  session.start(); await session.wait();
  assert.equal(calls, 3);
  assert.equal(session.states[0].status, 'fallback');
  session.dispose();
});
test('invalid MIME and decode failure recover through alternate candidates', async () => {
  let calls = 0;
  const { deps } = harness(async () => ++calls === 1 ? new Response('html', { headers: { 'Content-Type': 'text/html' } }) : image());
  const session = new CoverSession([{ ...album(), images: [url(1), url(2)] }], () => {}, deps);
  session.start(); await session.wait();
  assert.equal(calls, 2);
  session.dispose();
  let decodes = 0;
  const h = harness(async () => image(), { decode: async src => {
    if (++decodes === 1) throw new Error('decode');
    return { src, naturalWidth: 300, naturalHeight: 300 };
  } });
  const second = new CoverSession([{ ...album(), images: [url(1), url(2)] }], () => {}, h.deps);
  second.start(); await second.wait();
  assert.equal(second.states[0].status, 'loaded');
  assert.deepEqual(h.revoked, ['blob:1']);
  second.dispose();
});
test('concurrent duplicate URLs share a single request and decoded asset', async () => {
  let calls = 0;
  const { deps } = harness(async () => { calls++; await new Promise(r => setTimeout(r, 5)); return image(); });
  const session = new CoverSession([album(), album()], () => {}, deps);
  session.start(); const assets = await session.wait();
  assert.equal(calls, 1);
  assert.equal(assets[0], assets[1]);
  session.dispose();
});
test('cancellation aborts active requests and prevents callbacks after disposal', async () => {
  let callbacks = 0, aborted = false;
  const { deps } = harness(async (_path, options) => new Promise((_, reject) => {
    options.signal.addEventListener('abort', () => { aborted = true; reject(options.signal.reason); }, { once: true });
  }));
  const session = new CoverSession([album()], () => callbacks++, deps);
  session.start();
  const waiting = session.wait();
  session.dispose(); const count = callbacks;
  await assert.rejects(waiting);
  await new Promise(r => setTimeout(r, 5));
  assert.equal(aborted, true);
  assert.equal(callbacks, count);
});
test('a missing fallback is a terminal failure, never an unusable image', async () => {
  const { deps } = harness(async path => path.startsWith('/api/album-art') ? Response.json({ images: [] }) : unavailable());
  const session = new CoverSession([album('')], () => {}, deps);
  session.start(); await assert.rejects(session.wait(), /unusable_cover/);
  assert.equal(session.states[0].status, 'failed');
  session.dispose();
});
test('at most four album loads run concurrently, including a 5x5 grid', async () => {
  let active = 0, peak = 0;
  const { deps } = harness(async () => { peak = Math.max(peak, ++active); await new Promise(r => setTimeout(r, 2)); active--; return image(); });
  const session = new CoverSession(Array.from({ length: 25 }, (_, i) => album(url(i))), () => {}, deps);
  session.start(); await session.wait();
  assert.equal(peak, 4);
  session.dispose();
});
test('metadata alternatives are lazy and can recover missing covers', async () => {
  const calls = [];
  const { deps } = harness(async path => {
    calls.push(path);
    return path.startsWith('/api/album-art') ? Response.json({ images: [url(2)] }) : image();
  });
  const session = new CoverSession([album('')], () => {}, deps);
  session.start(); await session.wait();
  assert.equal(session.states[0].status, 'loaded');
  assert.equal(calls.length, 2);
  session.dispose();
});
test('manual retry does not cache transient failures as successful covers', async () => {
  let recovered = false, calls = 0;
  const { deps } = harness(async path => {
    if (path.startsWith('/api/album-art')) return Response.json({ images: [] });
    if (path === '/fallback1.png') return image();
    calls++;
    return recovered ? image() : unavailable();
  });
  const session = new CoverSession([album()], () => {}, deps);
  session.start(); await session.wait();
  recovered = true;
  session.retry(0); await session.wait();
  assert.equal(session.states[0].status, 'loaded');
  assert.equal(calls, 2);
  session.dispose();
});
test('preview failures clear unusable shared assets and release their URLs', async () => {
  const { deps, revoked } = harness(async () => image());
  const session = new CoverSession([album(), album()], () => {}, deps);
  session.start(); await session.wait();
  session.previewFailed(0);
  assert.deepEqual(session.states.map(s => s.status), ['failed', 'failed']);
  assert.deepEqual(revoked, ['blob:1']);
  await assert.rejects(session.wait(), /unusable_cover/);
  session.retry(0); session.retry(1); await session.wait();
  assert.deepEqual(session.states.map(s => s.status), ['loaded', 'loaded']);
  session.dispose();
  assert.deepEqual(revoked, ['blob:1', 'blob:2']);
});
test('decoded memory budget tries a smaller candidate and revokes rejected assets', async () => {
  let decodes = 0;
  const { deps, revoked } = harness(async () => image(), {
    decode: async src => ({ src, naturalWidth: ++decodes <= 7 ? 2000 : 300, naturalHeight: decodes <= 7 ? 2000 : 300 }),
  });
  const albums = Array.from({ length: 7 }, (_, i) => ({ ...album(url(i)), images: [url(i), url(i + 100)] }));
  const session = new CoverSession(albums, () => {}, deps);
  session.start(); await session.wait();
  assert.ok(session.states.every(state => state.status === 'loaded'));
  assert.ok(revoked.length > 0);
  session.dispose();
});
