// Менять ничего не требуется — он всегда пропускает запросы с меткой времени напрямую
const CACHE_NAME = 'scanner-live-cache-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))),
    self.clients.claim()
  );
});

self.addEventListener('fetch', (event) => {
  // Пропускаем сетевые запросы напрямую в интернет
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
