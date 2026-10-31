# SIGAP — Sistem Informasi Gawat Darurat & Kesiapsiagaan Bencana Desa Cibenda

Platform monitoring lingkungan dan kesiapsiagaan bencana untuk Desa Cibenda, Kecamatan Parigi, Kabupaten Pangandaran. SIGAP mengolah data resmi **BMKG** (gempa, potensi tsunami, prakiraan cuaca) dan **Open-Meteo** menjadi status kesiapsiagaan yang sederhana bagi warga, dilengkapi peta evakuasi, kontak darurat, panduan kesiapsiagaan, notifikasi web push, serta gateway untuk perangkat indikator IoT di titik strategis desa (kontrol sirine masih dalam pengembangan).

SIGAP adalah platform **monitoring dan peringatan berbasis aturan**, bukan sistem prediksi bencana. Sesuai desain, aktivasi sirine selalu dilakukan oleh operator, tidak pernah otomatis. SIGAP dikembangkan sebagai bagian dari program capstone multi-sistem bersama **SID** dan **Cibenda Mart**, dengan domain, database, dan deployment terpisah.

Dibangun sebagai monorepo npm workspaces: frontend PWA React 19 (TypeScript, Vite) dan backend REST API Express 5 (TypeScript, Prisma 7) di atas PostgreSQL.

---

## Tech Stack

| Layer | Komponen / Teknologi |
|---|---|
| Frontend | React 19 + TypeScript 6 + Vite 8, React Router 7, TanStack Query, Zustand |
| Styling & UI | Tailwind CSS v4 + Lucide React Icons |
| PWA & Notifikasi | vite-plugin-pwa (Workbox) + Web Push (VAPID, `web-push`) |
| Backend | Node.js 24 + Express 5 (TypeScript), validasi Zod, autentikasi JWT + RBAC |
| ORM & Database | Prisma 7 (`@prisma/adapter-pg`) + PostgreSQL 18 |
| Scheduler Peringatan Dini | Polling BMKG di dalam proses backend (default setiap 60 detik), rule-based alert |
| Sumber Data Eksternal | BMKG (gempa, tsunami, prakiraan cuaca) & Open-Meteo (cuaca) |
| Maps | Leaflet + React Leaflet (tile Google Maps) |
| IoT | Device gateway REST (`register`, `heartbeat`, `status`) dengan header `x-device-token` untuk perangkat ESP32-C3; kontrol sirine masih dalam pengembangan |
| Container & Web Server | Docker Compose, Caddy (menyajikan SPA dan meneruskan `/api` ke backend) |

---

## Alokasi Port Server

Stack SIGAP hanya membuka **satu port**, dan hanya di loopback: container `web` di `127.0.0.1:8080`. HTTPS, domain, dan firewall ditangani reverse proxy di server (Nginx/Caddy milik pengelola), yang meneruskan seluruh path (termasuk `/api`) ke port tersebut.

### 1. Port Publik (Firewall / Inbound Server)
Port yang dibuka pada firewall server (dikelola pengelola server, bukan oleh stack SIGAP):

| Port | Protokol | Layanan | Keterangan |
|---|---|---|---|
| 80 | TCP | HTTP | Redirect otomatis ke HTTPS (port 443) |
| 443 | TCP | HTTPS | Pintu masuk Web App (warga & admin), API, dan perangkat IoT |
| 22 | TCP | SSH | Akses remote administration terminal |

### 2. Port Internal Docker (Loopback 127.0.0.1)
Port yang hanya diakses reverse proxy di server dan tidak diekspos ke publik:

| Service Container | Port Host | Port Container | Fungsi |
|---|---|---|---|
| web | 127.0.0.1:8080 | 80 | Caddy: frontend PWA + reverse proxy `/api/*` ke backend |
| backend | - | 3000 | REST API Express + scheduler peringatan dini BMKG |
| db | - | 5432 | PostgreSQL 18 (network internal, tanpa akses internet) |
| migrate | - | - | Job sekali jalan `prisma migrate deploy` sebelum backend start |

Catatan:
- Port host diatur lewat `SIGAP_HTTP_BIND` dan `SIGAP_HTTP_PORT` di `deploy/compose.env`. **Ubah `SIGAP_HTTP_PORT` bila bentrok** dengan aplikasi lain di server yang sama.
- Backend butuh akses keluar (HTTPS) ke `api.bmkg.go.id`, `data.bmkg.go.id`, `api.open-meteo.com`, dan layanan push browser (mis. `fcm.googleapis.com`, `updates.push.services.mozilla.com`).
- Backend hanya boleh berjalan **1 replika**: scheduler, rate limiter, dan cache masih in-memory.

---

## Fitur Utama

- **Warga (Publik, tanpa login)**:
  - Status kesiapsiagaan desa (Aman/Waspada/Siaga/Awas) yang diperbarui otomatis dari data BMKG.
  - Peta sebaran gempa BMKG dan info gempa terkini (Pangandaran, Jawa Barat, Indonesia).
  - Status potensi tsunami dan cuaca terkini serta prakiraan cuaca desa.
  - Peta titik dan jalur evakuasi beserta navigasi rute.
  - Kontak darurat dan panduan kesiapsiagaan bencana.
  - Notifikasi gempa via web push, serta dapat dipasang sebagai aplikasi (PWA).
- **Admin & Operator (Dashboard Admin)**:
  - Command center: ringkasan alert, kesiapsiagaan, jumlah pelanggan web push, dan status perangkat IoT.
  - Verifikasi alert (dikonfirmasi, ditindaklanjuti, atau ditolak).
  - Kelola kontak darurat, titik evakuasi, dan panduan kesiapsiagaan.
  - Manajemen akun dan role (RBAC `admin`/`operator`).
  - Halaman kontrol sirine & IoT (modul masih dalam pengembangan, menunggu integrasi perangkat keras).
  - Pengaturan sistem dan pemantauan kesehatan layanan.
- **Sistem & Keamanan**:
  - Scheduler peringatan dini di dalam backend, dengan heartbeat opsional untuk monitoring eksternal.
  - Endpoint health untuk orchestrator: `/api/healthz` (liveness) dan `/api/readyz` (readiness DB).
  - Gateway perangkat IoT: registrasi dan heartbeat perangkat (autentikasi `x-device-token`), serta status perangkat untuk dashboard.
  - Rate limiting per IP, CORS whitelist, header keamanan, dan revokasi sesi JWT.
  - Validasi environment saat startup (fail-fast) tanpa membocorkan nilai secret.

---

## Deployment Server (Staging)

Deployment dijalankan dengan **Docker Compose** lewat satu script operasional, `deploy/sigap.sh`. Image di-build langsung di server dari git tag rilis. HTTPS ditangani reverse proxy di server.

### Isi Folder `deploy/`

| File | Fungsi |
|---|---|
| `sigap.sh` | Script operasional: deploy per tag + rollback otomatis, migrasi, backup/restore, log, status |
| `compose.reference.yml` | Definisi service `web`, `backend`, `migrate`, `db` |
| `docker/` | `backend.Dockerfile`, `frontend.Dockerfile`, `Caddyfile` |
| `compose.env.example` | Variabel compose: nama proyek, tag awal, bind & port host |
| `sigap.env.example` | Environment runtime aplikasi + kredensial container DB |
| `sigap.external.env.example` | Override koneksi DB bila memakai PostgreSQL di luar container (mode external) |

### Ringkasan Menjalankan Docker
Prasyarat: Docker Engine dengan Docker Compose ≥ 2.20, git, dan curl.

1. Ambil source code pada tag rilis:
   ```bash
   git clone <repo-url> sigap && cd sigap
   git checkout <tag-rilis>
   ```
2. Salin dan isi konfigurasi environment (semua placeholder `<...>` wajib diganti):
   ```bash
   cp deploy/compose.env.example deploy/compose.env
   cp deploy/sigap.env.example deploy/sigap.env
   chmod 600 deploy/compose.env deploy/sigap.env

   openssl rand -hex 32               # untuk JWT_SECRET, CRON_SECRET, DEVICE_SHARED_KEY, password DB
   npx web-push generate-vapid-keys   # untuk VAPID_PUBLIC_KEY & VAPID_PRIVATE_KEY
   ```
   Isi `ALLOWED_ORIGINS=https://<hostname-sigap>`. Tanpa itu, login dan semua request tulis ditolak CORS.
3. Deploy (build image, backup DB, migrasi dengan konfirmasi `ya`, start, lalu smoke test):
   ```bash
   bash deploy/sigap.sh deploy <tag-rilis> --migrate
   ```
4. Cek status dan kesehatan:
   ```bash
   bash deploy/sigap.sh status
   bash deploy/sigap.sh smoke
   ```

### Perintah `sigap.sh`

| Perintah | Fungsi |
|---|---|
| `deploy <tag> [--migrate] [--no-build]` | Build dan jalankan tag baru; otomatis kembali ke tag sebelumnya bila smoke test gagal |
| `up [--db local\|external]` | Jalankan stack dengan tag aktif (ditolak bila ada migrasi pending) |
| `down` / `restart [service]` | Hentikan (volume data tetap) / restart stack |
| `logs [service]` / `status` | Ikuti log / lihat tag aktif, status container, dan riwayat deploy |
| `migrate` | Backup DB, tampilkan migrasi pending, konfirmasi, lalu jalankan |
| `health` / `smoke` | Cek `/api/healthz` dan `/api/readyz` / smoke test endpoint publik dan halaman SPA |
| `backup [label]` / `restore <file.dump>` | `pg_dump` ke `deploy/backups/` (+ checksum) / restore dengan verifikasi checksum |
| `shell <service>` / `reset` | Shell ke container / hapus stack beserta volume DB (dengan konfirmasi) |

Bantuan lengkap: `bash deploy/sigap.sh help`.

### Contoh Reverse Proxy (Nginx di Server)
```nginx
server {
    listen 443 ssl;
    server_name <hostname-sigap>;
    # ssl_certificate / ssl_certificate_key: sertifikat Let's Encrypt (Certbot)

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Header `X-Forwarded-For` wajib diteruskan agar rate limit per IP bekerja per pengguna. Nilai `TRUST_PROXY` bawaan di `sigap.env.example` sudah sesuai untuk proxy ber-IP privat seperti ini.

---

## Menjalankan di Lokal (Development)

Untuk menjalankan project di lingkungan pengembangan lokal tanpa Docker.

### Prasyarat
- Node.js 24 & npm
- PostgreSQL (disarankan versi 18)

### Langkah Cepat
1. Clone repositori, lalu siapkan file environment **sebelum** instalasi (`npm ci` menjalankan `prisma generate`, yang membutuhkan `DATABASE_URL` dan `DIRECT_URL`):
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```
   Isi minimal `DATABASE_URL`, `DIRECT_URL` (boleh sama dengan `DATABASE_URL`), `JWT_SECRET` (≥ 32 karakter), dan `CRON_SECRET`. Tambahkan `ENABLE_LOCAL_SCHEDULER=true` bila ingin scheduler BMKG ikut berjalan.

   Buat `apps/frontend/.env.local`:
   ```bash
   VITE_API_BASE_URL=http://localhost:3000/api
   ```
2. Install dependensi semua workspace dari root:
   ```bash
   npm ci
   ```
3. Jalankan migrasi database dan seed data awal (role, permission, akun admin placeholder, data contoh):
   ```bash
   cd apps/backend
   npx prisma migrate deploy
   npm run seed
   cd ../..
   ```
   Kredensial admin placeholder ditampilkan di output seed. Segera ganti di luar lingkungan lokal.
4. Jalankan layanan development (terminal terpisah):
   - Backend: `npm run dev --workspace=apps/backend` (Port 3000)
   - Frontend: `npm run dev --workspace=apps/frontend` (Port 5173)

Perintah lain: `npm run lint --workspace=apps/frontend`, `npm run typecheck --workspace=apps/backend`, `npm run build --workspace=<apps/frontend|apps/backend>`.

---

## Dokumentasi Terkait

- [`docs/PRD.md`](./docs/PRD.md) — Product Requirement Document
- [`docs/architecture/`](./docs/architecture/) — dokumen arsitektur (termasuk [arsitektur IoT](./docs/architecture/05_iot_architecture.md) dan [deployment view](./docs/architecture/08_deployment_view.md))
- [`docs/api_spec/`](./docs/api_spec/) — spesifikasi API (OpenAPI)
- [`docs/architecture_data_and_schema/`](./docs/architecture_data_and_schema/) — data dictionary dan skema
