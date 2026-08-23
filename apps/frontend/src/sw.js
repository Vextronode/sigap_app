import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

precacheAndRoute(self.__WB_MANIFEST);

// Cache API dashboard (cuaca/gempa/tsunami/alert) biar data terakhir tetap
// bisa dibuka offline. Pola URL diperbaiki dari versi lama yang menunjuk ke
// /api/dashboard (endpoint yang tidak pernah ada, lihat docs/API_Spec.md).
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/v1/public/"),
  new NetworkFirst({
    cacheName: "sigap-dashboard-cache",
    networkTimeoutSeconds: 5,
  })
);

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const payload = event.data.json();

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || "/assets/icons/icon-192.png",
      // `image` TIDAK didukung Web Push di iOS Safari — di sana notifikasi
      // tetap tampil, cuma tanpa gambar shakemap. Ini fallback yang aman,
      // bukan bug.
      image: payload.image,
      badge: "/assets/icons/icon-192.png",
      data: { url: payload.url || "/" },
      // tag konsisten per topik notifikasi → notif baru menggantikan yang lama
      // di tray (tidak menumpuk). renotify: true wajib ada bersama tag supaya
      // saat level naik (YELLOW→ORANGE→RED), getar+bunyi tetap ulang meskipun
      // tag-nya sama — tanpa renotify, update senyap saja.
      tag: "sigap-alert",
      renotify: true,
      // Notifikasi tidak hilang otomatis sampai warga tap/dismiss manual.
      // Nilai true/false dikontrol backend per level (lihat notification.service.ts).
      requireInteraction: payload.requireInteraction ?? false,
      // Pola getar per level: YELLOW [200ms], ORANGE [200,100,200], RED [300,100,300,100,300].
      // Array kosong = tidak getar (fallback aman jika field tidak ada di payload lama).
      vibrate: payload.vibrate ?? [],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

self.skipWaiting();
self.addEventListener("activate", () => self.clients.claim());
