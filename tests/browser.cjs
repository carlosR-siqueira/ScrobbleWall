// Optional browser QA: use an available Playwright installation (no runtime dependency).
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3100';

(async () => {
  await fs.mkdir('.test-artifacts', { recursive: true });
  const browser = await chromium.launch({ channel: process.env.TEST_BROWSER_CHANNEL || 'chrome', headless: true });
  let scenarios = 0;
  try {
    for (const [size, mode, mobile] of [[3, 'normal', false], [4, 'transient', false], [5, 'normal', true],
      [3, 'pending', false], [3, 'permanent', true], [3, 'decode', false], [3, 'fallback-failure', false], [3, 'canvas', false]]) {
      const context = await browser.newContext({ locale: 'en-US', viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 1000 }, acceptDownloads: true });
      await context.addInitScript(() => localStorage.setItem('language', 'en'));
      const page = await context.newPage();
      const errors = [], downloads = [], requests = new Map();
      page.on('pageerror', error => errors.push(error.message));
      page.on('download', download => downloads.push(download));
      await page.route('**/*', route => new URL(route.request().url()).origin === new URL(baseURL).origin ? route.continue() : route.abort());
      await page.goto(baseURL + '/generate');
      await page.getByPlaceholder('Last.fm username').waitFor();
      const fixtures = await page.evaluate(() => ['#ff0000', '#00ff00', '#0000ff'].map(color => {
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = 300;
        const ctx = canvas.getContext('2d'); ctx.fillStyle = color; ctx.fillRect(0, 0, 300, 300);
        return canvas.toDataURL('image/png').split(',')[1];
      }));
      const albums = Array.from({ length: size * size }, (_, i) => {
        const image = `https://lastfm-img.freetls.fastly.net/i/u/300x300/${i.toString(16).padStart(32, '0')}.png`;
        return { name: `Album ${i}`, artist: `Artist ${i}`, playcount: i + 1, image, images: [image] };
      });
      await page.route('**/api/collage?*', async route => {
        assert.equal(new URL(route.request().url()).searchParams.get('username'), 'ação &name=value');
        await route.fulfill({ json: { albums } });
      });
      await page.route('**/api/album-art?*', route => route.fulfill({ json: { images: mode === 'decode' ? [
        'https://lastfm-img.freetls.fastly.net/i/u/300x300/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.png',
      ] : [] } }));
      await page.route('**/api/image-proxy?*', async route => {
        const imageURL = new URL(route.request().url()).searchParams.get('url');
        const number = imageURL.includes('bbbbbbbbbbbbbbbb') ? 0 : parseInt(new URL(imageURL).pathname.split('/').pop().split('.')[0], 16);
        const count = (requests.get(imageURL) || 0) + 1; requests.set(imageURL, count);
        if (number === 0 && mode === 'pending') await new Promise(r => setTimeout(r, 1200));
        if (number === 0 && mode === 'transient' && count === 1) return route.abort('failed');
        if (number === 0 && ['permanent', 'fallback-failure'].includes(mode)) return route.fulfill({ status: 404, json: { error: 'origin_http', retryable: false } });
        if (number === 0 && mode === 'decode' && count === 1 && !imageURL.includes('bbbbbbbbbbbbbbbb')) {
          return route.fulfill({ contentType: 'image/png', body: Buffer.from('corrupt') });
        }
        await route.fulfill({ contentType: 'image/png', body: Buffer.from(fixtures[number % 3], 'base64') });
      });
      if (mode === 'fallback-failure') await page.route('**/fallback1.png', route => route.fulfill({ status: 404, body: 'missing' }));
      await page.getByPlaceholder('Last.fm username').fill('ação &name=value');
      await page.locator('select').nth(1).selectOption(String(size));
      await page.getByRole('button', { name: 'Generate Collage', exact: true }).click();
      await page.waitForFunction(count => document.querySelectorAll('[aria-busy]').length === count, size * size);
      if (mode === 'pending') {
        await page.getByRole('button', { name: 'Download Image', exact: true }).click();
        await page.getByRole('button', { name: 'Waiting for covers…', exact: true }).waitFor();
        assert.equal(downloads.length, 0);
      }
      await page.waitForFunction(() => document.querySelectorAll('[aria-busy="true"]').length === 0);
      assert.equal(await page.locator('main img').evaluateAll(images => images.some(img => !img.complete || !img.naturalWidth)), false);
      if (mode === 'transient') assert.equal([...requests.values()].filter(count => count === 2).length, 1);
      await page.mouse.move(0, 0);
      await page.waitForFunction(() => [...document.querySelectorAll('main img')].every(img => Number(getComputedStyle(img).opacity) >= 0.99));
      await page.screenshot({ path: `.test-artifacts/${size}x${size}-${mode}.png`, fullPage: true });
      if (mobile) assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'mobile overflow');
      const beforeExport = [...requests.values()].reduce((a, b) => a + b, 0);
      if (mode === 'normal' && size === 3) {
        await page.getByRole('checkbox', { name: 'Include album information', exact: true }).check();
        await page.getByRole('checkbox', { name: 'Include play count', exact: true }).check();
      }
      if (mode === 'canvas') await page.evaluate(() => {
        HTMLCanvasElement.prototype.toDataURL = () => { throw new DOMException('Simulated Canvas error', 'SecurityError'); };
      });
      if (mode !== 'pending') await page.getByRole('button', { name: 'Download Image', exact: true }).click();
      if (['fallback-failure', 'canvas'].includes(mode)) {
        await page.getByRole('alert').filter({ hasText: 'Could not generate the image' }).waitFor();
        assert.equal(downloads.length, 0);
      } else {
        if (mode === 'permanent') {
          await page.getByRole('button', { name: 'Download with default image', exact: true }).waitFor();
          assert.equal(downloads.length, 0);
          await page.getByRole('button', { name: 'Download with default image', exact: true }).click();
        }
        await page.getByText('Gostou do ScrobbleWall?', { exact: true }).waitFor();
        assert.equal(downloads.length, 1);
        assert.match(downloads[0].suggestedFilename(), /^ScrobbleWall - Last week - \d{4}-\d{2}-\d{2}\.png$/);
        const output = path.resolve(`.test-artifacts/${size}x${size}-${mode}-export.png`);
        await downloads[0].saveAs(output);
        const bytes = await fs.readFile(output);
        assert.equal(bytes.readUInt32BE(16), size * 300);
        assert.equal(bytes.readUInt32BE(20), size * 300);
        if (mode !== 'permanent') {
          const pixels = await page.evaluate(async base64 => {
            const image = new Image(); image.src = 'data:image/png;base64,' + base64; await image.decode();
            const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
            const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
            return [0, 1, 2].map(i => [...ctx.getImageData(i * 300 + 150, 150, 1, 1).data]);
          }, bytes.toString('base64'));
          assert.deepEqual(pixels, [[255,0,0,255], [0,255,0,255], [0,0,255,255]]);
        }
      }
      assert.equal([...requests.values()].reduce((a, b) => a + b, 0), beforeExport, 'export must not request covers again');
      assert.deepEqual(errors, []);
      console.log(`PASS browser ${size}x${size} ${mode}${mobile ? ' mobile' : ''}`);
      scenarios++;
      await context.close();
    }
    console.log(`${scenarios} browser scenarios passed`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
