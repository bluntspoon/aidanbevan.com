// Gains Atlas offline: keep the app's own files, serve them from the cache, refresh them from the network.
// Bump CACHE whenever any file in FILES changes, so installed copies pick up the new version.
const CACHE = 'gains-atlas-v2';
const FILES = [
  'index.html',
  'app.css',
  'app.js',
  'muscles.js',
  'exercises.js',
  'steps.js',
  'diagram.js',
  'body-map.js',
  'icon.svg',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
  'manifest.webmanifest',
  'img/hero.jpg',
];

const SCOPE = new URL('./', self.location).href;
const KEYS = new Set(FILES.map((file) => new URL(file, SCOPE).href));

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(FILES.map((file) => new Request(new URL(file, SCOPE), { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names
        .filter((name) => name.startsWith('gains-atlas-') && name !== CACHE)
        .map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

/** The cache key for a request, or null if it is not one of ours. A visit to the app's root is index.html. */
function keyFor(request) {
  if (request.method !== 'GET') return null;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return null;
  url.hash = '';
  url.search = '';
  if (request.mode === 'navigate' && url.href === SCOPE) return new URL('index.html', SCOPE).href;
  return KEYS.has(url.href) ? url.href : null;
}

self.addEventListener('fetch', (event) => {
  const key = keyFor(event.request);
  if (!key) return; // anything else goes to the network untouched

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(key);
    const fresh = fetch(key, { cache: 'no-cache' })
      .then((response) => {
        // Only same-origin, complete, successful responses are kept: never opaque or partial ones.
        if (response.ok && response.type === 'basic' && response.status === 200) {
          return cache.put(key, response.clone()).then(() => response);
        }
        return response;
      });
    if (cached) {
      event.waitUntil(fresh.catch(() => {}));
      return cached;
    }
    return fresh;
  })());
});
