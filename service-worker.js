// Service Worker for קוונטום טק
const CACHE_NAME = 'quantum-tech-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  // Only handle HTTPS requests
  if (event.request.url.startsWith('https://')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return cached response if found
          if (response) {
            return response;
          }
          
          // Clone the request
          const fetchRequest = event.request.clone();
          
          // Make network request and cache the response
          return fetch(fetchRequest)
            .then(response => {
              // Check if valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clone the response
              const responseToCache = response.clone();
              
              // Cache the fetched response
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            })
            .catch(error => {
              console.log('Fetch failed:', error);
              // You can return a custom offline page here
            });
        })
    );
  }
});

// Security-focused headers for all requests
self.addEventListener('fetch', event => {
  if (event.request.url.startsWith('https://')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response to add security headers
          const secureResponse = new Response(response.body, response);
          
          // Add security headers
          secureResponse.headers.append('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
          secureResponse.headers.append('X-Content-Type-Options', 'nosniff');
          secureResponse.headers.append('X-Frame-Options', 'SAMEORIGIN');
          secureResponse.headers.append('Content-Security-Policy', "default-src 'self' https: data:; img-src 'self' https: data:; script-src 'self' https: 'unsafe-inline'; style-src 'self' https: 'unsafe-inline'");
          
          return secureResponse;
        })
    );
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old cache versions
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 