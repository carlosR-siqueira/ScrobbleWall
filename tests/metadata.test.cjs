const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeAlbums, lastfmUrl, infoImages } = require('../.test-build/lib/covers/metadata');
const url = size => `https://lastfm.freetls.fastly.net/i/u/${size}/${'a'.repeat(32)}.png`;
const entry = { name: 'Album', artist: { name: 'Artist' }, playcount: '42', image: [
  { size: 'small', '#text': url('34s') }, { size: 'extralarge', '#text': url('300x300') },
] };
test('normal ranking, resolution priority, counts and order', () => {
  const albums = normalizeAlbums({ topalbums: { album: [entry, { ...entry, name: 'Second' }] } });
  assert.deepEqual(albums.map(a => a.name), ['Album', 'Second']);
  assert.equal(albums[0].image, url('300x300'));
  assert.equal(albums[0].playcount, 42);
});
test('empty ranking is a success; missing image arrays are safe', () => {
  assert.deepEqual(normalizeAlbums({ topalbums: { album: [] } }), []);
  assert.equal(normalizeAlbums({ topalbums: { album: [{ ...entry, image: undefined }] } })[0].image, '');
});
test('missing preferred resolution falls back to available size', () => {
  assert.equal(normalizeAlbums({ topalbums: { album: [{ ...entry, image: entry.image.slice(0, 1) }] } })[0].image, url('34s'));
});
test('malformed metadata and provider errors never become empty lists', () => {
  for (const value of [null, {}, { topalbums: {} }, { topalbums: { album: [{}] } }, { error: 6, message: 'secret' }]) {
    assert.throws(() => normalizeAlbums(value));
  }
});
test('special characters cannot change request parameters', () => {
  const value = 'ação &user=other?#';
  const parsed = lastfmUrl('user.gettopalbums', { user: value }, 'secret');
  assert.equal(parsed.searchParams.get('user'), value);
  assert.equal(parsed.searchParams.getAll('user').length, 1);
});
test('album.getInfo requires exact identity and matching MBID when supplied', () => {
  const expected = { name: 'Album', artist: 'Artist' };
  assert.equal(infoImages({ album: { ...expected, image: entry.image } }, expected).length, 2);
  assert.deepEqual(infoImages({ album: { ...expected, name: 'Album Deluxe', image: entry.image } }, expected), []);
  assert.deepEqual(infoImages({ album: { ...expected, mbid: 'different', image: entry.image } }, { ...expected, mbid: 'id' }), []);
});
