---
layout: compress
# PWA service worker
---

self.importScripts('{{ "/assets/js/data/swcache.js" | relative_url }}');

const cacheName = 'chirpy-{{ "now" | date: "%Y%m%d.%H%M" }}';

function verifyDomain(url) {
  for (const domain of allowedDomains) {
    const regex = RegExp(`^http(s)?:\/\/${domain}\/`);
    if (regex.test(url)) {
      return true;
    }
  }

  return false;
}

function isExcluded(url) {
  for (const item of denyUrls) {
    if (url === item) {
      return true;
    }
  }
  return false;
}

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(resource);
    })
  );
});


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        /* console.log(`[sw] method: ${event.request.method}, fetching: ${event.request.url}`); */
        if (response) {
          return response;
        }

        let fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            const url = fetchRequest.url;

            if (fetchRequest.method !== 'GET' ||
              !verifyDomain(url) ||
              isExcluded(url)) {
              return response;
            }

            let responseToCache = response.clone();

            caches.open(cacheName)
              .then(cache => {
                /* console.log('[sw] Caching new resource: ' + event.request.url); */
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
    );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keyList => {
          return Promise.all(
            keyList.map(key => {
              if(key !== cacheName) {
                return caches.delete(key);
              }
            })
          );
    })
  );
});
