const CACHE_NAME = 'scanner-pwa-v10';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://unpkg.com/@zxing/library@latest'
];

// Установка: кэшируем базовые файлы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Активация: удаляем все старые версии кэша
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Стратегия Network-First: всегда пробуем взять свежий файл из сети
self.addEventListener('fetch', (event) => {
  // Для запросов самого приложения
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Если ответ валидный, обновляем его в кэше на фоне
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Если сети нет (офлайн), отдаем сохраненный кэш
        return caches.match(event.request);
      })
  );
});

// Слушаем команду на полную очистку кэша
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'clearCache') {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  }
});
