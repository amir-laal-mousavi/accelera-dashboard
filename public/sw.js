const CACHE_NAME = 'accelera-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.svg',
  '/logo.png',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // API requests - network first
  if (request.url.includes('/api/') || request.url.includes('convex')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Offline' }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }
  
  // Static assets - cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      
      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
