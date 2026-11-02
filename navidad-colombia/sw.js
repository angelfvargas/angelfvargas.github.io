// Service worker: guarda todo el sitio en el celular para que funcione sin internet.
const VERSION = 'novena-73b60ecbc64d';
const ARCHIVOS = ["./","./assets/index-Bj6bqava.css","./assets/index-C7-18MAI.js","./iconos/icono-192.png","./iconos/icono-512.png","./iconos/icono.svg","./index.html","./manifest.webmanifest"];

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
  e.respondWith(
    caches.match(req, { ignoreSearch: true, ignoreVary: true }).then((r) => {
      if (r) return r;
      return fetch(req)
        .then((resp) => {
          if (resp.ok) caches.open(VERSION).then((c) => c.put(req, resp.clone()));
          return resp;
        })
        .catch(() => (req.mode === 'navigate' ? caches.match('./', { ignoreVary: true }) : Response.error()));
    }),
  );
});
