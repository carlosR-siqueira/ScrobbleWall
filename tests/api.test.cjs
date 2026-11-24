const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { GET: collage } = require('../.test-build/app/api/collage/route');
const { GET: art } = require('../.test-build/app/api/album-art/route');
const originalFetch = global.fetch;
const originalKey = process.env.LASTFM_API_KEY;
after(() => { global.fetch = originalFetch; if (originalKey === undefined) delete process.env.LASTFM_API_KEY; else process.env.LASTFM_API_KEY = originalKey; });
process.env.LASTFM_API_KEY = 'test-only-secret';
const image = `https://lastfm-img.freetls.fastly.net/i/u/300x300/${'b'.repeat(32)}.png`;
const value = { topalbums: { album: [{ name: 'Album', artist: { name: 'Artist' }, playcount: '5', image: [{ size: 'extralarge', '#text': image }] }] } };
const request = params => new Request('https://app.test/api/collage?' + new URLSearchParams({ username: 'user', ...params }));
test('API encodes usernames, preserves ranking and caches/deduplicates successful metadata', async () => {
  let calls = 0;
  global.fetch = async input => {
    calls++;
    assert.equal(new URL(input).searchParams.get('user'), 'ação &user=other');
    await new Promise(r => setTimeout(r, 5));
    return Response.json(value);
  };
  const responses = await Promise.all([collage(request({ username: 'ação &user=other' })), collage(request({ username: 'ação &user=other' }))]);
  assert.equal(calls, 1);
  assert.equal((await responses[0].json()).albums[0].image, image);
  await collage(request({ username: 'ação &user=other' }));
  assert.equal(calls, 1);
});
test('upstream HTTP and Last.fm errors have coherent error statuses', async () => {
  global.fetch = async () => new Response('unavailable', { status: 503 });
  assert.equal((await collage(request({ username: 'http-failure' }))).status, 502);
  global.fetch = async () => Response.json({ error: 6, message: 'provider message should not leak' });
  const missing = await collage(request({ username: 'missing-user' }));
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: 'lastfm_6' });
});
test('malformed metadata is not cached and retry can succeed', async () => {
  let calls = 0;
  global.fetch = async () => ++calls === 1 ? Response.json({ topalbums: {} }) : Response.json(value);
  assert.equal((await collage(request({ username: 'malformed-retry' }))).status, 502);
  assert.equal((await collage(request({ username: 'malformed-retry' }))).status, 200);
  assert.equal(calls, 2);
});
test('invalid API parameters cause no upstream requests', async () => {
  global.fetch = async () => { throw new Error('must not fetch'); };
  assert.equal((await collage(request({ limit: '10000' }))).status, 400);
  assert.equal((await collage(request({ period: 'invalid' }))).status, 400);
  assert.equal((await collage(request({ username: '' }))).status, 400);
  assert.equal((await art(new Request('https://app.test/api/album-art?name=A&artist=B&mbid=invalid'))).status, 400);
});
test('album-art rejects incorrect identities from the provider', async () => {
  global.fetch = async () => Response.json({ album: { name: 'Different', artist: 'Artist', image: [{ size: 'large', '#text': image }] } });
  const response = await art(new Request('https://app.test/api/album-art?name=Original&artist=Artist'));
  assert.deepEqual(await response.json(), { images: [] });
});
