// sw.js - Service Worker for TRADE X AI Viewer

const CACHE_NAME = 'trade-x-ai-viewer-cache-v1';
const urlsToCache = [
    '/',
    '/index.html', // Assuming index.html is the main file
    // Add other assets that should be cached for offline use
    // e.g., '/css/style.css', '/js/main.js', '/images/logo.png'
    // For this app, we primarily rely on CDN, but if you have local assets, list them here.
    // CDNs are generally not cached by service workers unless explicitly fetched and added.
];

self.addEventListener('install', (event) => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching essential app shell');
                // We are not aggressively caching CDN resources here as they are external.
                // For a PWA, you'd typically cache your own static assets.
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Service Worker: Cache open or addAll failed during install:', error);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // No cache hit - fetch from network
                return fetch(event.request).then(
                    (response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and can only be consumed once. We must clone it so that
                        // we can consume one in the cache and one in the browser.
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                // Only cache successful GET requests for HTTP/HTTPS
                                if (event.request.method === 'GET' && event.request.url.startsWith('http')) {
                                    cache.put(event.request, responseToCache);
                                }
                            });

                        return response;
                    }
                ).catch((error) => {
                    console.error('Service Worker: Fetch failed:', error);
                    // You can return a fallback page for offline here
                    // e.g., return caches.match('/offline.html');
                });
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

