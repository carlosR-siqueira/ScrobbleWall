const { test } = require('node:test');
const assert = require('node:assert/strict');
const { renderCollage } = require('../.test-build/lib/covers/export');
function canvas() {
  const calls = [], texts = [];
  const ctx = { drawImage: (...args) => calls.push(args), fillRect() {}, fillText: text => texts.push(text) };
  return { width: 0, height: 0, getContext: () => ctx, toDataURL: () => 'data:image/png;base64,valid', calls, texts };
}
for (const size of [3, 4, 5]) test(`exports ${size}x${size} at 300px per cover in ranking order`, () => {
  const target = canvas();
  const albums = Array.from({ length: size * size }, (_, i) => ({ name: `Album ${i}`, artist: `Artist ${i}`, playcount: i }));
  const assets = albums.map((_, i) => ({ image: { index: i }, src: 'blob:' + i }));
  renderCollage(albums, assets, size, false, false, () => target);
  assert.equal(target.width, size * 300);
  assert.equal(target.height, size * 300);
  assert.deepEqual(target.calls.map(args => args[0]), assets.map(a => a.image));
  assert.deepEqual(target.calls[size].slice(1), [0, 300, 300, 300]);
  assert.deepEqual(target.texts, []);
});
test('optional album, artist and playcount labels retain their independent switches', () => {
  for (const info of [false, true]) for (const plays of [false, true]) {
    const target = canvas();
    renderCollage([{ name: 'Album', artist: 'Artist', playcount: 42 }], [{ image: {} }], 3, info, plays, () => target);
    assert.deepEqual(target.texts, [...(info ? ['Album', 'Artist'] : []), ...(plays ? ['42 plays'] : [])]);
  }
});
test('unresolved covers, unavailable Canvas and invalid file generation throw', () => {
  assert.throws(() => renderCollage([{}], [], 3, false, false, canvas), /unusable_cover/);
  assert.throws(() => renderCollage([], [], 3, false, false, () => ({ getContext: () => null })), /canvas_unavailable/);
  const target = canvas(); target.toDataURL = () => { throw new Error('SecurityError'); };
  assert.throws(() => renderCollage([], [], 3, false, false, () => target), /SecurityError/);
  target.toDataURL = () => 'data:,';
  assert.throws(() => renderCollage([], [], 3, false, false, () => target), /file_generation/);
});
