const CACHE_NAME = 'coast-guide-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/data/cities.json',
  '/data/resources.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)));
    })
  );
  self.clients.claim();
});

// Stale-While-Revalidate caching strategy ensures fast loading & offline support
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/data/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => cachedResponse);
          return cachedResponse || fetchPromise;
        });
      })
    );
  } else {
    event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
  }
});