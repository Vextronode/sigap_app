# SIGAP Frontend

PWA SIGAP untuk dashboard warga dan panel admin, dibangun dengan React, TypeScript, dan Vite.

## Menjalankan

Dari root repositori:

```bash
npm run dev --workspace=apps/frontend
```

Aplikasi berjalan di port 5173 dan membaca `VITE_API_BASE_URL` dari `apps/frontend/.env.local`.

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev --workspace=apps/frontend` | Server pengembangan |
| `npm run build --workspace=apps/frontend` | Typecheck dan build |
| `npm run lint --workspace=apps/frontend` | Lint |

## Dokumentasi

Panduan penyiapan lengkap berada di `README.md` pada root repositori. Desain berada di `docs/DESIGN.md` dan `docs/DESIGN_ADMIN.md`.
