/**
 * Service Worker for Kafkasder Panel PWA
 * Implements offline-first caching strategy with network fallback
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `kafkasder-${CACHE_VERSION}`;
const OFFLINE_PAGE = '/offline.html';

// Assets to cache on install
const PRECACHE_ASSETS = ['/', '/genel', '/offline.html', '/manifest.json'];

// Cache strategies
const CACHE_FIRST_PATTERNS = [
  /\/_next\/static\//,
  /\/icons\//,
  /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
  /\.(?:woff|woff2|ttf|otf)$/,
];

const NETWORK_FIRST_PATTERNS = [/\/api\//, /\.convex\.cloud/];

const STALE_WHILE_REVALIDATE_PATTERNS = [/\/_next\/data\//, /\.json$/];

/**
 * Install event - precache essential assets
 */
self.addEventListener('install', (event) => {
  console.warn('[SW] Installing service worker...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.warn('[SW] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.warn('[SW] Service worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Precache failed:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.warn('[SW] Activating service worker...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.warn('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.warn('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - handle requests with appropriate caching strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine caching strategy
  if (CACHE_FIRST_PATTERNS.some((pattern) => pattern.test(url.href))) {
    event.respondWith(cacheFirst(request));
  } else if (NETWORK_FIRST_PATTERNS.some((pattern) => pattern.test(url.href))) {
    event.respondWith(networkFirst(request));
  } else if (STALE_WHILE_REVALIDATE_PATTERNS.some((pattern) => pattern.test(url.href))) {
    event.respondWith(staleWhileRevalidate(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

/**
 * Cache-first strategy: Check cache, then network
 * Best for static assets that don't change often
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] Cache-first fetch failed:', error);
    return new Response('Network error', { status: 408, statusText: 'Request Timeout' });
  }
}

/**
 * Network-first strategy: Try network, fallback to cache
 * Best for API requests and dynamic content
 */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (_error) {
    console.warn('[SW] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    // If navigation request and no cache, show offline page
    if (request.mode === 'navigate') {
      const offlinePage = await cache.match(OFFLINE_PAGE);
      if (offlinePage) {
        return offlinePage;
      }
    }

    return new Response('Offline - no cached version available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Stale-while-revalidate strategy: Return cached, update in background
 * Best for data that can be slightly stale
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => {
      // Silently fail - we already have cached version
    });

  return cached || fetchPromise;
}

/**
 * Background sync for offline mutations
 */
self.addEventListener('sync', (event) => {
  console.warn('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // TODO: Implement offline data sync with Convex
  console.warn('[SW] Syncing offline data...');
}

/**
 * Push notifications
 */
self.addEventListener('push', (event) => {
  console.warn('[SW] Push notification received');

  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'Yeni bildirim',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/genel',
    },
  };

  event.waitUntil(self.registration.showNotification(data.title || 'Kafkasder', options));
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
  console.warn('[SW] Notification clicked');

  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data.url || '/genel'));
});

/**
 * Message handler for communication with main thread
 */
self.addEventListener('message', (event) => {
  console.warn('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.payload;
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
  }
});
