const CACHE_NAME = 'namira-birthday-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/index.css',
  '/src/assets/images/bali_kempinski_1786555487793.jpg',
  '/src/assets/images/dubai_chewy_cookie_1786555506115.jpg',
  '/src/assets/images/hero_romantic_cover_1786555470247.jpg',
  '/src/assets/images/romantic_bali_ticket_1786555525448.jpg',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and API requests — always go to network
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback: serve from cache
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // For navigation requests, return index.html
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
