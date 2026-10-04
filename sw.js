/* Offline: la app se guarda al instalar; los tiles del mapa se guardan al verlos (máx. 400). */
const VERSION = 'viaje-v4';
const APP = [
  './', 'index.html', 'manifest.webmanifest',
  'css/m-design.css', 'css/app.css',
  'js/itinerario.js', 'js/app.js', 'js/visitas.js', 'js/ubicacion.js', 'js/sesion.js',
  'vendor/leaflet/leaflet.js', 'vendor/leaflet/leaflet.css',
  'vendor/gesture/leaflet-gesture-handling.min.js', 'vendor/gesture/leaflet-gesture-handling.min.css',
  'vendor/lucide/lucide.min.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'
];
const TILES = 'viaje-tiles', FONTS = 'viaje-fonts', MAX_TILES = 400;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => ![VERSION, TILES, FONTS].includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function trim(cacheName, max){
  const c = await caches.open(cacheName), keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.hostname.endsWith('basemaps.cartocdn.com')) {
    e.respondWith(caches.open(TILES).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') { c.put(req, res.clone()); trim(TILES, MAX_TILES); }
      return res;
    }));
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(res => { c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin === location.origin) {
    /* Red primero para ver cambios del itinerario; si no hay conexión, la copia guardada. */
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
  }
});
