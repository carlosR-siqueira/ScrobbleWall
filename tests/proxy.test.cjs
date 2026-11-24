const { test } = require('node:test');
const assert = require('node:assert/strict');
const { coverUrl } = require('../.test-build/lib/covers/urls');
const { retrieveImage, proxyResponse, publicIPv4, pinnedRequest, MAX_IMAGE_BYTES } = require('../.test-build/lib/covers/proxy.server');
const url = `https://lastfm.freetls.fastly.net/i/u/300x300/${'a'.repeat(32)}.png`;
const png = Buffer.from([137,80,78,71,13,10,26,10,0]);
const reply = overrides => ({ status: 200, type: 'image/png', bytes: png, ...overrides });
const signal = new AbortController().signal;
test('strict URL allowlist rejects malicious and malformed destinations', () => {
  assert.equal(coverUrl(url), url);
  assert.ok(coverUrl(url.replace('lastfm.freetls', 'lastfm-img.freetls')));
  for (const bad of ['garbage', 'http://localhost/', 'https://127.0.0.1/', 'https://169.254.169.254/',
    url.replace('fastly.net', 'fastly.net.evil.com'), url.replace('https://', 'https://user:pass@'),
    url.replace('https:', 'http:'), url + '?x=1', url.replace('/i/u/', '/anything/'), url.replace('.net/', '.net:444/')]) {
    assert.equal(coverUrl(bad), null, bad);
  }
});
test('DNS denies local, metadata, reserved, IPv6 and mapped addresses', () => {
  for (const ip of ['0.0.0.0','10.1.1.1','127.1.2.3','169.254.169.254','172.16.1.1','192.168.1.1','100.64.1.1',
    '198.18.0.1','224.0.0.1','::1','::ffff:127.0.0.1','fe80::1']) assert.equal(publicIPv4(ip), false, ip);
  assert.equal(publicIPv4('8.8.8.8'), true);
});
test('forbidden redirect is rejected before a second request', async () => {
  let calls = 0;
  await assert.rejects(retrieveImage(url, signal, async () => { calls++; return reply({ status: 302, location: 'https://127.0.0.1/' }); }), /forbidden_redirect/);
  assert.equal(calls, 1);
  await assert.rejects(retrieveImage(url, signal, async () => reply({ status: 302, location: 'https://[' })), /forbidden_redirect/);
});
test('permitted redirects are validated with a bounded chain', async () => {
  let calls = 0;
  await retrieveImage(url, signal, async () => ++calls === 1 ? reply({ status: 302, location: url }) : reply());
  assert.equal(calls, 2);
  await assert.rejects(retrieveImage(url, signal, async () => reply({ status: 302, location: url })), /forbidden_redirect/);
});
test('missing MIME, disguised HTML, upstream HTTP errors and oversized data fail', async () => {
  for (const response of [reply({ type: '' }), reply({ bytes: Buffer.from('<html>') }), reply({ status: 404 }),
    reply({ bytes: Buffer.alloc(MAX_IMAGE_BYTES + 1) })]) {
    await assert.rejects(retrieveImage(url, signal, async () => response));
  }
});
test('only successful images receive cache headers; errors are no-store', async () => {
  const req = new Request('https://app.test/api/image-proxy?' + new URLSearchParams({ url }));
  const ok = await proxyResponse(req, async () => reply());
  assert.equal(ok.status, 200);
  assert.match(ok.headers.get('cache-control'), /max-age=3600/);
  assert.equal(ok.headers.get('content-type'), 'image/png');
  const fail = await proxyResponse(req, async () => reply({ status: 503 }));
  assert.equal(fail.status, 502);
  assert.equal(fail.headers.get('cache-control'), 'no-store');
  assert.equal((await fail.json()).retryable, true);
});
test('request timeout and caller cancellation abort upstream work', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const transport = (_url, signal) => new Promise((_, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  });
  const req = new Request('https://app.test/api/image-proxy?' + new URLSearchParams({ url }));
  const timeout = proxyResponse(req, transport);
  t.mock.timers.tick(7001);
  assert.equal((await timeout).status, 504);
  const controller = new AbortController();
  const cancelled = proxyResponse(new Request(req.url, { signal: controller.signal }), transport);
  controller.abort();
  assert.equal((await cancelled).status, 499);
});
test('private DNS answers are rejected; validated public IP is pinned against rebinding', async () => {
  const dns = require('node:dns/promises');
  const https = require('node:https');
  const { PassThrough } = require('node:stream');
  const { EventEmitter } = require('node:events');
  const originalLookup = dns.lookup, originalRequest = https.request;
  try {
    dns.lookup = async () => [{ address: '127.0.0.1', family: 4 }];
    await assert.rejects(pinnedRequest(new URL(url), signal), /forbidden_dns/);
    dns.lookup = async () => [{ address: '8.8.8.8', family: 4 }];
    let pinned;
    https.request = (_url, options, callback) => {
      assert.equal(options.agent, false);
      assert.equal(options.family, 4);
      // DNS has changed since validation, but the socket lookup uses the saved IP.
      dns.lookup = async () => [{ address: '169.254.169.254', family: 4 }];
      options.lookup('lastfm.freetls.fastly.net', {}, (_err, address) => { pinned = address; });
      const req = new EventEmitter();
      req.end = () => {
        const response = new PassThrough();
        response.statusCode = 200; response.headers = { 'content-type': 'image/png' };
        callback(response); response.end(png);
      };
      return req;
    };
    const result = await pinnedRequest(new URL(url), signal);
    assert.equal(pinned, '8.8.8.8');
    assert.equal(result.status, 200);
    assert.deepEqual(result.bytes, png);
  } finally { dns.lookup = originalLookup; https.request = originalRequest; }
});
