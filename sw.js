const CACHE_NAME = 'ultrabotox-v1';
const urlsToCache = [
  '/',
  '/style.css',
  '/script.js',
  '/images/ultrabotox-logo.webp',
  '/images/doctor-hero.webp',
  '/images/doctor-about.webp',
  '/images/redescubra-versao.webp',
  '/images/clinic-bh.webp',
  '/images/clinic-patos.webp',
  '/images/clinic-barbacena.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});