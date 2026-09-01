import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 5173,
  },
  plugins: [react(), tailwindcss(), VitePWA({
      registerType: 'autoUpdate',
      // Pindah dari generateSW (auto, tidak bisa disisipi kode custom) ke
      // injectManifest supaya service worker bisa nanganin event `push` &
      // `notificationclick` sendiri — lihat src/sw.js. Precache & runtime
      // caching dashboard tetap ada, dipindah ke dalam sw.js itu sendiri.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      // Ikon PWA (png/ico) SUDAH otomatis di-precache lewat `manifest.icons`
      // di bawah — jangan ikut di-glob di sini juga, itu bikin entry ganda
      // untuk file yang sama dengan revision hash beda ("add-to-cache-list
      // -conflicting-entries" di console, service worker gagal install).
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,webmanifest}'],
      },
      devOptions: {
        enabled: process.env.VITE_PWA_DEV === 'true',
        type: 'module',
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
      }
    })],
});
