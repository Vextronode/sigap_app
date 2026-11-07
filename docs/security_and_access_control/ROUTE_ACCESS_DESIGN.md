# Route / Access Category Design - SIGAP

| Field | Detail |
|---|---|
| Status | Aktif |
| Tanggal | 7 November 2026 |
| Pemilik | Tech Lead SIGAP |
| Dokumen Terkait | `PRD.md`, `DD_rbac.md`, `api_spec/openapi.yaml` |

## 1. Kategori Akses

| Kategori | Autentikasi | Prefix |
|---|---|---|
| Public | Tanpa token | `/api/public/*`, juga tersedia tanpa segmen `public` melalui `/api/*` |
| Protected | `Authorization: Bearer <JWT>` | `/api/protected/*` |
| Device Gateway | Header `x-device-token` | `/api/public/device/register`, `/api/public/device/heartbeat` |
| Internal | `CRON_SECRET` melalui `Authorization: Bearer` atau `x-cron-secret` | `/api/public/internal/*` |
| Health | Tanpa token dan tanpa rate limit | `/api/healthz`, `/api/readyz` |

## 2. Tabel Route

### 2.1 Auth dan Users

| Aksi | Route | Kategori | Syarat |
|---|---|---|---|
| Login | POST `/api/public/auth/login` | Public | - |
| Profil | GET `/api/protected/auth/me` | Protected | Token valid |
| Logout | POST `/api/protected/auth/logout` | Protected | Token valid |
| Ganti password | POST `/api/protected/auth/change-password` | Protected | Token valid |
| Daftar dan statistik akun | GET `/api/protected/users`, `/users/stats`, `/users/roles` | Protected | `user.manage` |
| Detail akun | GET `/api/protected/users/:id` | Protected | `user.manage` |
| Buat akun | POST `/api/protected/users` | Protected | `user.manage` |
| Ubah akun | PUT `/api/protected/users/:id` | Protected | `user.manage` |
| Reset password | POST `/api/protected/users/:id/reset-password` | Protected | `user.manage` |
| Buka kunci akun | POST `/api/protected/users/:id/unlock` | Protected | `user.manage` |

Akun tidak dihapus, hanya dinonaktifkan melalui `isActive`.

### 2.2 Data Lingkungan dan Alert

| Aksi | Route | Kategori | Syarat |
|---|---|---|---|
| Cuaca | GET `/api/public/weather/current`, `/weather/forecast` | Public | - |
| Gempa | GET `/api/public/earthquakes`, `/latest`, `/indonesia`, `/map`, `/west-java`, `/west-java/history`, `/pangandaran`, `/pangandaran/history` | Public | - |
| Tsunami | GET `/api/public/tsunami`, `/tsunami/status`, `/tsunamis`, `/tsunamis/status` | Public | - |
| Alert | GET `/api/public/alerts`, `/alerts/current`, `/alerts/history`, `/alerts/:id` | Public | - |
| Daftar alert | GET `/api/protected/alerts`, `/alerts/:id` | Protected | Token valid |
| Catat tinjauan alert | PATCH `/api/protected/alerts/:id/review` | Protected | `alert.validate` |

### 2.3 Perangkat

| Aksi | Route | Kategori | Syarat |
|---|---|---|---|
| Status level dan koneksi | GET `/api/public/device/status` | Public | - |
| Registrasi | POST `/api/public/device/register` | Device Gateway | `x-device-token` |
| Heartbeat | POST `/api/public/device/heartbeat` | Device Gateway | `x-device-token` |

Nilai `x-device-token` dibandingkan dengan satu kunci bersama `DEVICE_SHARED_KEY`. Di `NODE_ENV=production`, startup gagal bila kunci kosong. Di luar production, endpoint terbuka bila kunci kosong.

### 2.4 Konten

| Aksi | Route | Kategori | Syarat |
|---|---|---|---|
| Baca titik evakuasi | GET `/api/public/evacuation-points`, `/:id` | Public | - |
| Ubah titik evakuasi | POST, PUT, DELETE `/api/protected/evacuation-points` | Protected | `content.manage` |
| Baca kontak darurat | GET `/api/public/emergency-contacts`, `/:id` | Public | - |
| Ubah kontak darurat | POST, PUT, DELETE `/api/protected/emergency-contacts` | Protected | `content.manage`; kontak inti tidak dapat dihapus |
| Baca panduan | GET `/api/public/preparedness-guides`, `/:id` | Public | - |
| Baca panduan untuk staf | GET `/api/protected/preparedness-guides`, `/:id` | Protected | Token valid |
| Ubah panduan | POST, PUT, DELETE `/api/protected/preparedness-guides` | Protected | `content.manage` |
| Pengumuman | GET `/api/public/announcements` | Public | - |
| Jalur evakuasi | GET `/api/public/evacuation-routes` | Public | - |

### 2.5 Notifikasi dan Sistem

| Aksi | Route | Kategori | Syarat |
|---|---|---|---|
| VAPID key | GET `/api/public/notifications/vapid-public-key` | Public | - |
| Subscribe, unsubscribe | POST `/api/public/notifications/subscribe`, `/unsubscribe` | Public | - |
| Konten terkini | GET `/api/public/notifications/latest` | Public | - |
| Kirim manual | POST `/api/protected/notifications/dispatch` | Protected | Role `admin` |
| Riwayat pengiriman | GET `/api/protected/notifications/logs` | Protected | Token valid |
| Jumlah subscriber | GET `/api/protected/notifications/subscribers/count` | Protected | Token valid |
| Kesehatan sistem | GET `/api/public/system-health`, `/system/health`, `/api/protected/system-health` | Public | - |
| Pemicu scheduler | GET, POST `/api/public/internal/run-scheduler` | Internal | `CRON_SECRET` |

## 3. Pemetaan Role

| Role | Permission |
|---|---|
| admin | `content.manage`, `alert.validate`, `device.view`, `device.manage`, `siren.view`, `user.manage` |
| operator | `content.manage`, `alert.validate`, `device.view`, `siren.view`, `siren.trigger` |

Permission yang dipakai route saat ini adalah `content.manage`, `user.manage`, dan `alert.validate`. Permission dan role dibaca dari klaim JWT yang diterbitkan saat login.

## 4. Rate Limiting

Implementasi memakai `express-rate-limit` dengan penyimpanan memori per proses, sehingga backend berjalan satu replika.

| Cakupan | Batas | Kunci |
|---|---|---|
| Seluruh `/api/public`, `/api/protected`, dan alias `/api` | 300 request per menit | IP |
| POST `/api/public/auth/login` | 15 percobaan gagal per 15 menit | IP |
| Kesehatan sistem | 60 request per menit | IP |
| Lockout login | 5 kali gagal, akun terkunci 15 menit | Akun |

`/api/healthz` dan `/api/readyz` tidak dikenai rate limit. IP klien ditentukan oleh `TRUST_PROXY`.

## 5. Sesi

- Token JWT HS256 dengan `iss` dan `aud`; masa berlaku `JWT_EXPIRES_IN` (default 1 hari).
- Logout mencabut `jti` token yang dipakai melalui tabel `revoked_tokens`.
- Menonaktifkan akun, mengubah role, dan reset password oleh admin menaikkan `users.token_version`, sehingga seluruh token akun tersebut yang terbit sebelumnya tidak berlaku.
- `authMiddleware` memeriksa tanda tangan token, daftar pencabutan, status aktif akun, dan versi token. Token tanpa klaim `tokenVersion` dianggap versi 0.
- Bila database gagal dibaca saat pemeriksaan sesi, request dilanjutkan berdasarkan validitas tanda tangan token.

## 6. Notifikasi

SIGAP mengirim Web Push langsung ke seluruh subscriber (VAPID). Integrasi notifikasi dengan SID belum tersedia.
