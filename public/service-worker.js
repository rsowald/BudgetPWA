const FILES_TO_CACHE = [
    'index.html',
    'styles.css',
    'index.js',
    'db.js',
    'images/icons/icon-192x192.png',
    'images/icons/icon-512x512.png',
    "manifest.json",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
];

const CACHE_NAME = "cache-v1";
const RUNTIME = "runtime";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(FILES_TO_CACHE))
            .then(self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    const currentCaches = [CACHE_NAME, RUNTIME];
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
            })
            .then((cachesToDelete) => {
                return Promise.all(
                    cachesToDelete.map((cacheToDelete) => {
                        return caches.delete(cacheToDelete);
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});


self.addEventListener("fetch", event => {
    // non GET requests are not cached and requests to other origins are not cached
    if (
        event.request.method !== "GET" ||
        !event.request.url.startsWith(self.location.origin)
    ) {
        event.respondWith(fetch(event.request));
        return;
    }


    // use cache first for all other requests for performance
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            // request is not in cache. make network request and cache the response
            return caches.open(RUNTIME).then(cache => {
                return fetch(event.request).then(response => {
                    return cache.put(event.request, response.clone()).then(() => {
                        return response;
                    });
                });
            });
        })
    );
});