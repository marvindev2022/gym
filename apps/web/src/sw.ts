/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { NetworkFirst } from 'workbox-strategies'
import { registerRoute } from 'workbox-routing'

declare const self: ServiceWorkerGlobalScope

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Cache Supabase requests com NetworkFirst
registerRoute(
  ({ url }) => url.hostname.includes('supabase.co'),
  new NetworkFirst({ cacheName: 'supabase-cache', networkTimeoutSeconds: 10 })
)

// Push notification
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'TreinoZap', {
      body: data.body ?? 'Você tem uma nova notificação.',
      icon: '/favicon.png',
      badge: '/favicon.png',
      data: { url: data.url ?? '/' },
      vibrate: [200, 100, 200],
    })
  )
})

// Ao clicar na notificação — abre o dashboard
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) { client.focus(); return }
      }
      self.clients.openWindow(url)
    })
  )
})
