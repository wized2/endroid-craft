const CACHE_NAME = 'endroid-craft-v23';
const ASSETS = [
  './',
  './index.html',
  './css/base.css','./css/hud.css','./css/controls.css','./css/menus.css','./css/icons.css','./css/script.css','./css/settings.css',
  './js/boot.js','./js/icons.js','./js/config.js','./js/touch.js','./js/audio.js','./js/seed.js','./js/noise.js','./js/textures.js','./js/scene.js','./js/world.js','./js/hud.js','./js/physics.js','./js/player.js','./js/mobs.js','./js/playermodel.js','./js/farming.js','./js/villages.js','./js/machines.js','./js/interact.js','./js/crafting.js','./js/hunger.js','./js/sleep.js','./js/objectives.js','./js/templates.js','./js/scripting.js','./js/weather.js','./js/features.js','./icons/icon-192.png','./icons/icon-512.png','./js/settings.js','./js/input.js','./js/save.js','./js/main.js',
  './manifest.json',
  './icon.svg',
  'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Network-first for HTML pages so updates are instant
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  // Own files (js/css): network-first so edits show up, cache as offline fallback.
  // Three.js (cross-origin, versioned): cache-first.
  const own = new URL(event.request.url).origin === location.origin;
  event.respondWith(
    (own ? Promise.resolve(null) : caches.match(event.request)).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match(event.request).then(c => c || caches.match('./index.html')));
    })
  );
});
