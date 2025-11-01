const CACHE_NAME = 'smetapro-cache-v1';
const OFFLINE_QUEUE = [];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(['/', '/index.html', '/manifest.webmanifest']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request).then((response) => response || caches.match('/')))
    );
  }

  if (event.request.method === 'POST') {
    const response = fetch(event.request.clone()).catch(async () => {
      const body = await event.request.clone().json();
      OFFLINE_QUEUE.push(body);
      new BroadcastChannel('offline-queue').postMessage({ size: OFFLINE_QUEUE.length });
      return new Response(JSON.stringify({ queued: true }), { status: 202, headers: { 'Content-Type': 'application/json' } });
    });

    event.respondWith(response);
  }
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'FLUSH_QUEUE') {
    const items = OFFLINE_QUEUE.splice(0, OFFLINE_QUEUE.length);
    Promise.allSettled(
      items.map((payload) =>
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      )
    ).catch(() => {
      OFFLINE_QUEUE.push(...items);
    });
  }
});
