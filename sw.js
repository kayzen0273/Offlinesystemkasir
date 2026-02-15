// Service Worker untuk Rafa Medica Offline Support
// Version 19.0

const CACHE_NAME = 'rafa-medica-v19';
const OFFLINE_CACHE = 'rafa-medica-offline-v19';

// Assets yang akan di-cache untuk offline access
const STATIC_ASSETS = [
    '/',
    '/Rafamwdica_V19_offline_ready.html',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/react@18/umd/react.production.min.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
    'https://unpkg.com/@babel/standalone/babel.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Amiri:wght@400;700&family=Courier+Prime:wght@400;700&display=swap'
];

// Firebase URLs yang harus selalu fresh (tidak di-cache)
const FIREBASE_URLS = [
    'firebaseapp.com',
    'googleapis.com',
    'gstatic.com'
];

// Install event - Cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching static assets...');
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.error('[SW] Failed to cache some assets:', err);
                // Continue even if some assets fail to cache
                return Promise.resolve();
            });
        })
    );
    
    // Force activation immediately
    self.skipWaiting();
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Take control of all clients immediately
    return self.clients.claim();
});

// Fetch event - Network first, then cache strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip Chrome extensions
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Check if it's a Firebase URL - always use network
    const isFirebaseUrl = FIREBASE_URLS.some(domain => url.hostname.includes(domain));
    
    if (isFirebaseUrl) {
        // Network only for Firebase (no cache)
        event.respondWith(
            fetch(request).catch(() => {
                // If offline, return a custom response
                return new Response(
                    JSON.stringify({ error: 'Offline - Firebase tidak tersedia' }),
                    { 
                        headers: { 'Content-Type': 'application/json' },
                        status: 503 
                    }
                );
            })
        );
        return;
    }
    
    // For other resources: Network first, fall back to cache
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Clone the response
                const responseClone = response.clone();
                
                // Cache successful responses
                if (response.status === 200) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                
                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log('[SW] Serving from cache:', request.url);
                        return cachedResponse;
                    }
                    
                    // If no cache, return offline page for HTML requests
                    if (request.headers.get('accept').includes('text/html')) {
                        return caches.match('/').then((response) => {
                            return response || new Response(
                                '<html><body><h1>Offline</h1><p>Aplikasi tidak dapat dimuat. Periksa koneksi internet Anda.</p></body></html>',
                                { headers: { 'Content-Type': 'text/html' } }
                            );
                        });
                    }
                    
                    // For other resources, return error
                    return new Response('Offline - Resource tidak tersedia', { status: 503 });
                });
            })
    );
});

// Background sync for pending operations (when supported)
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    if (event.tag === 'sync-pending-operations') {
        event.waitUntil(
            // This would trigger the sync in the main app
            self.clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({
                        type: 'SYNC_REQUEST',
                        timestamp: Date.now()
                    });
                });
            })
        );
    }
});

// Handle messages from the app
self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            }).then(() => {
                event.ports[0].postMessage({ success: true });
            })
        );
    }
});

// Periodic background sync (for supported browsers)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'sync-data') {
        console.log('[SW] Periodic sync triggered');
        event.waitUntil(
            self.clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({
                        type: 'PERIODIC_SYNC',
                        timestamp: Date.now()
                    });
                });
            })
        );
    }
});

console.log('[SW] Service Worker loaded and ready!');
