const CACHE_NAME = 'swachhlens-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-svg.svg'
]

// 1. Install & Cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => self.skipWaiting())
  )
})

// 2. Activate & Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// 3. Fetch Strategy: Network First for APIs, Stale-While-Revalidate for App Shell & Static Assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignore non-GET requests or backend API endpoints (handled by offlineQueue.js in app)
  if (request.method !== 'GET' || url.pathname.startsWith('/complaints') || url.pathname.startsWith('/dashboard')) {
    return
  }

  // Handle static assets & navigation
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })
        }
        return networkResponse
      }).catch(() => {
        // Fallback for navigation requests when offline
        if (request.mode === 'navigate') {
          return caches.match('/index.html')
        }
      })

      return cachedResponse || fetchPromise
    })
  )
})
