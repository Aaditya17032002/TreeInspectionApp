/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope

import { openDB } from 'idb'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { BackgroundSyncPlugin } from 'workbox-background-sync'

const CACHE_NAME = 'tree-inspection-cache-v1'

// Clean old caches
cleanupOutdatedCaches()

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST)

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  })
)

// Cache images with a Cache First strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
)

// Cache other static assets
registerRoute(
  ({ request }) => 
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'static-resources'
  })
)

// Background sync for inspections
const bgSyncPlugin = new BackgroundSyncPlugin('inspection-sync-queue', {
  maxRetentionTime: 24 * 60 // Retry for up to 24 hours (specified in minutes)
})

registerRoute(
  ({ url }) => url.pathname.includes('/api/inspections'),
  new NetworkFirst({
    cacheName: 'inspections-cache',
    plugins: [bgSyncPlugin]
  }),
  'POST'
)

self.addEventListener('sync', async (event) => {
  if (event.tag === 'sync-inspections') {
    const db = await openDB('tree-inspection-db', 1)
    const pendingSyncs = await db.getAll('pending-syncs')
    
    for (const sync of pendingSyncs) {
      try {
        const response = await fetch('/api/inspections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sync.data),
        })

        if (response.ok) {
          await db.delete('pending-syncs', sync.id)
        }
      } catch (error) {
        console.error('Sync failed:', error)
      }
    }
  }
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

