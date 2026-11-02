// Service worker: guarda todo el sitio en el celular para que funcione sin internet.
const VERSION = 'novena-1c0f074cb55c';
const ARCHIVOS = ["./","./assets/fraunces-latin-full-normal-CFFu7zhK.woff2","./assets/index-B9NGAE26.js","./assets/index-BqEO3MXY.css","./assets/literata-latin-wght-italic-Bm_GJfSc.woff2","./assets/literata-latin-wght-normal-DLxlUchJ.woff2","./assets/nunito-latin-wght-normal-BzFMHfZw.woff2","./iconos/icono-192.png","./iconos/icono-512.png","./iconos/icono.svg","./index.html","./manifest.webmanifest"];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith('novena-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // HTML: primero la red (para ver siempre la versión nueva) y, sin internet, la copia guardada.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((resp) => {
          if (resp.ok) { const copia = resp.clone(); caches.open(VERSION).then((c) => c.put('./', copia)); }
          return resp;
        })
        .catch(() => caches.match('./', { ignoreVary: true })),
    );
    return;
  }
  // Lo demás (JS, CSS, fuentes, íconos con nombre único): primero la caché.
  e.respondWith(
    caches.match(req, { ignoreSearch: true, ignoreVary: true }).then((r) => r || fetch(req).then((resp) => {
      if (resp.ok) { const copia = resp.clone(); caches.open(VERSION).then((c) => c.put(req, copia)); }
      return resp;
    })),
  );
});
