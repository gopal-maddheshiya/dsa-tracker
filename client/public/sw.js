const CACHE_NAME = 'dsa-tracker-v4';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.json'
];

// Install: pre-cache static app shell safely
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('SW pre-cache skipped for asset:', asset, err);
        }
      }
    })
  );
  self.skipWaiting();
});

// Activate: delete outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: SPA Navigation fallback, API network-first, and safe static caching
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip caching non-GET requests or external/Google Auth requests
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Never cache Vite development / HMR internal requests
  if (
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.search.includes('t=') ||
    url.search.includes('import') ||
    url.pathname.includes('__vite_ping')
  ) {
    return;
  }

  // API calls: Network-first with no cache pollution
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // SPA Navigation requests (e.g. /problems, /revision, /dashboard):
  // Network-first with immediate fallback to cached /index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          const matched =
            (await caches.match(event.request)) ||
            (await caches.match('/index.html')) ||
            (await caches.match('/'));
          if (matched) return matched;
          return new Response('Network unavailable. DSA Tracker is reconnecting...', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        })
    );
    return;
  }

  // Static assets (CSS, images, icons, fonts): Stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// ==============================================================
// WEB PUSH & DEVICE NOTIFICATIONS
// ==============================================================

// Listen for push events (from backend or web push service)
self.addEventListener('push', (event) => {
  let payload = {
    title: 'DSA Tracker · Revision Reminder',
    body: 'You have spaced repetition problems due for review today.',
    url: '/revision',
    tag: 'dsa-revision-reminder',
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: '/icon-192.svg',
    badge: '/favicon.svg',
    data: { url: payload.url || '/revision' },
    tag: payload.tag || 'dsa-revision-reminder',
    vibrate: [100, 50, 100],
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// Handle notification click: Focus existing app window or open a new one
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/revision';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Message listener: Client app commands (show notification, flush cache)
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    const finalOptions = {
      icon: '/icon-192.svg',
      badge: '/favicon.svg',
      vibrate: [100, 50, 100],
      ...options,
    };
    self.registration.showNotification(title || 'DSA Tracker', finalOptions);
  }

  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    });
  }
});
