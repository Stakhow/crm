const CACHE_NAME = 'pwa-cache-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

// Install: Cache essential files
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

// Fetch: Serve from cache if offline
self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // можна кешувати тут
          return response;
        })
        .catch(() => {
          return caches.match('/offline.html');
        });
    })
  );
});
