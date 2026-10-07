const CACHE_NAME = 'dsa-tracker-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.json'
];

// Install: pre-cache static app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
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

// Fetch: Network-first for API requests; Stale-while-revalidate for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip caching non-GET requests or browser-extension / Google Auth requests
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // API calls: Network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets & navigation: Stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

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
      // If a tab is already open with the app, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Message listener: Client app can command SW to show notification directly
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    const finalOptions = {
      icon: '/icon-192.svg',
      badge: '/favicon.svg',
      vibrate: [100, 50, 100],
      ...options,
    };
    self.registration.showNotification(title || 'DSA Tracker', finalOptions);
  }
});
