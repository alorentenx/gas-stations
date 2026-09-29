'use strict';
/* Service worker: la app abre sin conexión.
   - Páginas y archivos propios: red primero, caché si no hay red.
   - Librerías de CDN (versionadas): caché primero.
   - Teselas del mapa: caché primero, limitado a MAX_TILES.
   - API de precios: no se toca (la app guarda su propia copia en localStorage). */
const VERSION = 'gs-v1';
const SHELL = VERSION + '-shell';
const TILES = VERSION + '-tiles';
const MAX_TILES = 600;
const PRECACHE = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png'];
const CDN = /^(unpkg\.com|cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com)$/;
const TILE = /(arcgisonline\.com|tile\.openstreetmap\.de)$/;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function cacheFirst(req, cacheName, limit) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') {
    await cache.put(req, res.clone());
    if (limit) {
      const keys = await cache.keys();
      if (keys.length > limit) await Promise.all(keys.slice(0, keys.length - limit).map(k => cache.delete(k)));
    }
  }
  return res;
}

async function networkFirst(req) {
  const cache = await caches.open(SHELL);
  try {
    const res = await fetch(req);
    if (res.ok) await cache.put(req, res.clone());
    return res;
  } catch (e) {
    return (await cache.match(req, { ignoreSearch: true })) || (await cache.match('./index.html')) || Response.error();
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) e.respondWith(networkFirst(req));
  else if (CDN.test(url.hostname)) e.respondWith(cacheFirst(req, SHELL));
  else if (TILE.test(url.hostname)) e.respondWith(cacheFirst(req, TILES, MAX_TILES));
});
