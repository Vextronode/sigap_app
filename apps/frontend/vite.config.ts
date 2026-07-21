import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: process.env.VITE_PWA_DEV === 'true'
      },
      manifest: {
        name: 'SIGAP Desa Cibenda',
        short_name: 'SIGAP',
        description: 'Sistem Informasi dan Kesiapsiagaan Bencana Desa Cibenda',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/assets/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/assets/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // cache statis untuk dashboard tetap bisa dibuka offline (data terakhir)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/dashboard/, // ini masih harus diubah sesuai dengan URL API yang digunakan untuk dashboard
            handler: 'NetworkFirst',
            options: { cacheName: 'sigap-dashboard-cache', networkTimeoutSeconds: 5 }
          }
        ]
      }
    })],
});
