# Route / Access Category Design - SIGAP

## Document Control

| Field | Detail |
|---|---|
| Status | Final - direvisi pasca-audit kode & rekonsiliasi keputusan Tahap 2 |
| Tanggal | 10 / 09 / 2026 |
| Pemilik | Tech Lead SIGAP |
| Dokumen Terkait | PRD SIGAP v4.0, DD_rbac.md, ROADMAP_TAHAP_2.md, Sprint Plan Tahap 2 (v2), Laporan Audit Endpoint & Security |

### Catatan Revisi

Dua kontradiksi faktual dikoreksi di revisi ini terhadap versi sebelumnya:
1. Jalur sirine fisik **tidak** memakai Firebase Realtime Database - itu arsitektur yang sudah ditiadakan (lihat catatan Status SIGAP terkait IoT ingestion path). Jalur nyata: REST Polling yang sama dengan siklus heartbeat.
2. Notifikasi ke operator **belum** memakai SID sama sekali di kode nyata - saat ini murni Web Push langsung (VAPID), keputusan sadar tim backend untuk tidak bergantung timeline SID. Dual-channel (SID + Web Push) tetap rencana Roadmap Tahap 2 Area 4, belum terimplementasi - lihat Section 5.

---

## 1. Prinsip Kategorisasi

Tiga kategori berdasarkan kebutuhan otentikasi, bukan sensitivitas isi data semata (direvisi dari 2 kategori - lihat catatan):

- **Public** - dapat diakses tanpa token. Mencakup seluruh data konsumsi warga dan titik masuk otentikasi (login) itu sendiri.
- **Protected** - wajib menyertakan `Authorization: Bearer <JWT>` yang valid, dengan permission code dipetakan lewat struktur RBAC (`roles`, `permissions`, `role_permissions`, `user_roles` - lihat `DD_rbac.md`).
- **Device Gateway (M2M)** *(kategori baru)* - dipanggil perangkat IoT (Unit Utama), bukan browser pengguna. Saat ini **tidak memiliki autentikasi apa pun** di kode (temuan audit) - target: `X-Device-Secret` per `deviceCode` (lihat Sprint Plan Story SEC-7). Route-nya berada di bawah prefix `/public/device/*` yang sama seperti Public biasa (bukan prefix terpisah) - dibedakan lewat requirement header device secret setelah SEC-7 selesai, bukan lewat path.

Prefix URL: `/api/public/*` dan `/api/protected/*` (tanpa segmen versi - keputusan final penghapusan `/v1`).

---

## 2. Tabel Kategorisasi Route

### 2.1 Auth & Users

| Resource | Aksi | Kategori | Permission Dibutuhkan |
|---|---|---|---|
| Auth - login | POST `/api/public/auth/login` | Public | - |
| Auth - profil sendiri | GET `/api/protected/auth/me` | Protected | (valid token) |
| Auth - logout | POST `/api/protected/auth/logout` | Protected | (valid token) - *belum ada di kode, Story SEC-3* |
| users - list | GET `/api/protected/users` | Protected | `user.manage` |
| users - detail | GET `/api/protected/users/:id` | Protected | `user.manage` |
| users - buat akun | POST `/api/protected/users` | Protected | `user.manage` |
| users - ubah (role/isActive) | PUT `/api/protected/users/:id` | Protected | `user.manage` |
| users - reset password | POST `/api/protected/users/:id/reset-password` | Protected | `user.manage` |

**Catatan:** tidak ada endpoint DELETE untuk users - akun tidak pernah dihapus permanen, hanya dinonaktifkan (`isActive=false`) via PUT, demi menjaga jejak histori di `siren_action_log` dan log lain. *(Koreksi dari versi sebelumnya yang masih mencantumkan DELETE.)*

### 2.2 Data Lingkungan & Alert

| Resource | Aksi | Kategori | Permission Dibutuhkan |
|---|---|---|---|
| environmental_data | GET `/api/public/environmental-data` | Public | - |
| alerts | GET `/api/public/alerts`, `/alerts/current`, `/alerts/history` | Public | - |
| alerts - klasifikasi | PATCH `/api/protected/alerts/:id/review` | Protected | `alert.validate` |

**Catatan:** aksi disebut *review* (bukan *validate*) sejak FS-02 - status `Dikonfirmasi`/`Ditolak`/`Ditindaklanjuti`, bukan validasi biner. Kode permission tetap `alert.validate` (tidak di-rename) - keputusan sadar untuk menghindari migrasi permission tanpa manfaat fungsional. *(Koreksi path dari `/validate` ke `/review`.)*

### 2.3 Perangkat IoT

| Resource | Aksi | Kategori | Permission Dibutuhkan |
|---|---|---|---|
| device status (agregat) | GET `/api/public/device/status` | Public | - |
| device - self register | POST `/api/public/device/register` | Device Gateway (M2M) | *(belum ada, target SEC-7)* |
| device - heartbeat | POST `/api/public/device/heartbeat` | Device Gateway (M2M) | *(belum ada, target SEC-7)* |
| iot_devices (list admin) | GET `/api/protected/devices` | Protected | `device.view` |
| iot_devices | POST/PUT `/api/protected/devices` | Protected | `device.manage` |
| device_status_log | GET `/api/protected/devices/:id/status-log` | Protected | `device.view` |
| siren_action_log | GET `/api/protected/devices/:id/siren-log` | Protected | `siren.view` |
| siren - trigger remote | POST `/api/protected/devices/trigger-siren` | Protected | `siren.trigger` |

**Catatan penting:**
- `GET /api/public/device/status` (singular) **sudah live** - mengembalikan status agregat sistem (level, jumlah perangkat online/offline), **bukan** list per-perangkat. Ini resource berbeda dari `GET /api/protected/devices` (plural, admin, belum dibangun) - keduanya sengaja hidup berdampingan, jangan digabung (lihat pembahasan best-practice deviceService).
- `POST .../trigger-siren` **tidak lagi menerima `:id`** - broadcast ke seluruh Sirine terdaftar sekaligus, tidak ada pemilihan perangkat (keputusan protokol keamanan sirine). *(Koreksi dari versi sebelumnya yang masih pakai `:id`.)*
- Response trigger-siren adalah **202 Accepted** (command diterima, dieksekusi async lewat siklus poll ≤15 detik), bukan 201 seolah langsung tereksekusi.
- Body request trigger-siren wajib field `confirmed: boolean` - backend menolak (409) kalau level RED dan `confirmed=false` (konfirmasi 2-langkah).
- Validasi bisnis di endpoint ini: level saat ini harus `ORANGE`/`RED` (enum `AlertLevel` di database - **bukan** `oranye`/`merah` seperti versi dokumen sebelumnya, disesuaikan ke enum nyata `GREEN/YELLOW/ORANGE/RED`); **cooldown 60 detik** pasca-trigger, dipotong otomatis kalau eskalasi ke RED terjadi selama cooldown; re-validasi level tepat sebelum eksekusi.
- `operator_id`/`triggeredBy` diambil dari token yang memanggil, tidak boleh dari body - prinsip ini **tidak berubah**.

**Jalur fisik (bukan lewat route ini):** Unit Utama mengeksekusi trigger lokal langsung (ESP-NOW ke Sirine) tanpa melalui backend sama sekali. Pelaporan kejadian ini ke `siren_action_log` terjadi **asinkron lewat siklus heartbeat/poll REST yang sama** dengan komunikasi normal Unit Utama↔backend (`trigger_source = fisik`, `triggeredBy = NULL`) - **bukan** lewat Firebase Realtime Database seperti tertulis di versi dokumen sebelumnya; jalur itu sudah ditiadakan dari arsitektur SIGAP secara keseluruhan.

### 2.4 Konten Admin (Evakuasi, Kontak Darurat, Panduan)

| Resource | Aksi | Kategori | Permission Dibutuhkan |
|---|---|---|---|
| evacuation_points | GET `/api/public/evacuation-points` | Public | - |
| evacuation_points | POST/PUT/DELETE `/api/protected/evacuation-points` | Protected | `content.manage` |
| evacuation_routes | GET `/api/public/evacuation-routes` | Public | - |
| evacuation_routes | POST/PUT/DELETE `/api/protected/evacuation-routes` | Protected | `content.manage` |
| emergency_contacts | GET `/api/public/emergency-contacts` | Public | - |
| emergency_contacts | POST/PUT/DELETE `/api/protected/emergency-contacts` | Protected | `content.manage` (DELETE ditolak jika `isCore=true`) |
| preparedness_guides | GET `/api/public/preparedness-guides` | Public | - |
| preparedness_guides | POST/PUT/DELETE `/api/protected/preparedness-guides` | Protected | `content.manage` |
| announcements | GET `/api/public/announcements` | Public | - (proxy read-only dari SID, lihat catatan) |
| announcements | POST/PUT/DELETE `/api/protected/announcements` | **Deprecated (410)** | - |

**Catatan:** `announcements` CRUD lokal sudah dinonaktifkan - sumber data pindah jadi proxy read-only dari SID (Roadmap Tahap 2 S2.1 #3-4). `content.manage` kini dipegang **admin dan operator** (bukan admin-only seperti versi sebelumnya) - lihat `DD_rbac.md`.

### 2.5 Lainnya

| Resource | Aksi | Kategori | Permission Dibutuhkan |
|---|---|---|---|
| Ringkasan AI | GET `/api/public/ai-summary?type={weather\|earthquake\|recommendation}` | Public | - |
| Notifications - VAPID key | GET `/api/public/notifications/vapid-public-key` | Public | - |
| Notifications - subscribe/unsubscribe | POST `/api/public/notifications/subscribe`, `/unsubscribe` | Public | - |
| Notifications - konten terkini | GET `/api/public/notifications/latest` | Public | - |
| Notifications - riwayat kirim | GET `/api/public/notifications/logs` | Public | - *(sebaiknya di-review apakah seharusnya Protected - berisi data operasional internal, saat ini terbuka publik)* |
| Notifications - dispatch manual | POST `/api/protected/notifications/dispatch` | Protected | *(belum ada permission spesifik - kandidat: `content.manage` atau permission baru `notification.manage`, perlu diputuskan)* |
| Internal - trigger scheduler | POST `/api/public/internal/run-scheduler` | Public + `CRON_SECRET` header | *(bukan RBAC user biasa - proteksi terpisah via shared secret, lihat Section 4)* |

*(Domain Notifications sebelumnya sama sekali tidak ada di dokumen ini - ditambahkan sekarang karena sudah live di kode, ditemukan lewat audit endpoint.)*

---

## 3. Pemetaan Role Default

| Role | Permission |
|---|---|
| admin | `content.manage`, `alert.validate`, `device.view`, `device.manage`, `siren.view`, `user.manage` |
| operator | `content.manage`, `alert.validate`, `device.view`, `siren.view`, `siren.trigger` |

*(Baris operator diperbarui - kini setara admin untuk `content.manage`. Detail struktur & alasan: `DD_rbac.md`.)*

---

## 4. Rate Limiting

**Status implementasi saat ini:** **belum ada sama sekali** di kode (temuan audit - tidak ditemukan `express-rate-limit` atau middleware serupa). Tabel di bawah adalah target desain, dikerjakan di Story `SEC-2` (Sprint 1-2, Sprint Plan Tahap 2 v2).

**Algoritma:** Token Bucket.

**Layering:** level aplikasi (middleware) + level infrastruktur/reverse proxy.

**Batas per endpoint:**

| Endpoint | Limit | Alasan |
|---|---|---|
| `POST /api/public/auth/login` | 5 request / 15 menit / **IP** *dan* 5 request / 15 menit / **akun** (dua lapis, bukan cuma IP) | Mencegah brute-force; lockout per-akun mencegah penyerang memutar banyak IP untuk satu akun target (koreksi dari versi sebelumnya yang cuma per-IP - lihat FS-01/SEC-2) |
| `GET /api/public/*` (data umum) | 100 request / menit / IP | Mengakomodasi pemakaian dashboard wajar, membatasi scraping massal |
| `GET /api/public/ai-summary` | 20 request / menit / IP | Setiap request memicu panggilan berbayar ke AI API eksternal |

---

## 5. Integrasi Lintas Sistem - Notifikasi

**Status nyata saat ini (dari audit kode, bukan rencana):** SIGAP mengirim Web Push **langsung** ke warga (VAPID, `notification.service.ts`), **tanpa** melalui SID. Ini keputusan sadar tim backend, didokumentasikan eksplisit di kode: menghindari ketergantungan pada timeline tim lain yang belum pasti.

**Rencana Roadmap Tahap 2 (S2.1 #5, belum terimplementasi):** dual-channel - SID **dan** Web Push berjalan bersamaan sebagai redundansi fail-safe, bukan saling menggantikan.

**Kesenjangan yang perlu keputusan eksplisit, bukan diasumsikan otomatis:** versi dokumen sebelumnya menulis seolah SID sudah jadi kanal aktif - itu tidak akurat terhadap kode maupun terhadap rencana dual-channel Roadmap. Tolong konfirmasi: apakah dual-channel SID+WebPush tetap target Tahap 2 (berarti integrasi SID masih perlu dibangun di atas Web Push yang sudah ada), atau Web Push-only sekarang dianggap solusi final (berarti Roadmap S2.1 #5 perlu direvisi menghapus rencana SID)?

---

## 6. Isu Governance Terbuka

| Isu | Status | Pemilik |
|---|---|---|
| Kontrak integrasi SID (endpoint, autentikasi, SLA) | Draft - menunggu sign-off Tim SID & Architecture Working Group | Tech Lead SIGAP + Tech Lead SID |
| Status kanal notifikasi (SID vs Web Push vs dual-channel) | **Baru** - perlu keputusan eksplisit, lihat Section 5 | Tech Lead SIGAP + PM |
| Autentikasi Device Gateway (`X-Device-Secret`) | Draft, Story SEC-7 Tahap 2 | Tech Lead + Tim IoT |
| Konsistensi penamaan kolom junction table RBAC (snake_case dokumen vs kemungkinan camelCase Prisma nyata) | **Baru** - perlu verifikasi langsung ke database, lihat catatan `006_rbac.sql` | Tech Lead |
| Permission untuk `notifications/dispatch` (belum ada kode permission spesifik) | **Baru** - perlu diputuskan | Tech Lead |
| Validasi personel per role (siapa memegang role apa) | Kebijakan operasional mitra desa, di luar cakupan arsitektur sistem | Mitra desa |