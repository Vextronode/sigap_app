# Session Log — SIGAP Backend & Dashboard

> Log kronologis kerjaan dalam sesi ini, ditulis biar bisa dilihat urutan alur kerjanya: apa yang diminta, apa yang ditemukan, apa yang diputuskan, dan apa hasilnya. Untuk status "sudah/belum dikerjakan" per fitur, lihat `CHECKLIST_SIGAP_ALERTS.md` (root, sejajar file ini) — dokumen itu snapshot kondisi terkini, dokumen ini ceritanya.
>
> Terakhir diperbarui: 7 September 2026

---

## 1. Redesain Card Gempa & Tsunami (Frontend)

- `EarthquakeCard.tsx`: ditemukan bug — komponen `ShakemapImage` sempat didefinisikan DI DALAM body render `EarthquakeCard`, menyebabkan React selalu remount ulang tiap render. Dipindah ke module scope.
- Layout diubah: Pangandaran di atas sendiri, Indonesia & Jawa Barat di grid 2 kolom di bawah.
- Ditambahkan blok shakemap (skeleton shimmer → gambar → fallback teks) khusus varian Pangandaran, dengan aspect-ratio terkunci biar tidak ada layout shift.
- `TsunamiCard.tsx`: redesain penuh — ikon diganti ke `GiBigWave` dari `react-icons`, badge status lama diganti titik status berdenyut (pulsing dot) + label singkat, subtitle "Desa Cibenda" dipindah ke bawah judul.

---

## 2. Audit `docs/api_spec/` — Keputusan: Diabaikan

- Spec YAML itu tidak struktural dan tidak mencerminkan backend asli.
- Fokus ke `docs/API_Spec.md` milik Naufal sendiri sebagai acuan tunggal, disesuaikan dengan kode asli.

---

## 3. Penulisan Ulang `docs/API_Spec.md` (v2.0 → v3.0 → v3.1)

- Ditulis ulang total dengan penanda status ✅ (real & terhubung) / ⚠️ (jalan tapi placeholder) / 🚧 (baru rencana), supaya siapa pun bisa langsung tahu statusnya.

---

## 4. Rework Decision Engine — MMI Resmi BMKG

- Severity gempa (WASPADA vs SIAGA) ditentukan dari field `Dirasakan` (MMI resmi BMKG) yang menyebut Cibenda/Parigi/Pangandaran.
- Scheduler diganti dari `getLatest()` ke `getPangandaran()` (sudah difilter radius 100km + umur 30 hari).

---

## 5. Status Tsunami Real (`feat/tsunami-live-status`)

- Status diestimasi otomatis dari field `Potensi` gempa BMKG terdekat (`getPangandaran()`), **dibatasi maksimal WASPADA**.
- Override manual lewat `BMKG_TSUNAMI_STATUS` env var tetap ada untuk operator/demo (4 level penuh).

---

## 6. Bug Database SSL — Fix

- `config/prisma.ts` SSL dipaksa hanya jika `DATABASE_URL` menunjuk ke host non-localhost.

---

## 7. Device Status Threshold & AI Summary Card

- ESP32 threshold waktu offline disesuaikan ke **20 detik** (`OFFLINE_THRESHOLD_MS = 20 * 1000`) pada `device.service.ts` & `useDeviceStatus.ts` (sync dengan 2x heartbeat ESP32 yang gagal).
- AI Summary Card di-comment out di `DashboardPage.tsx` per permintaan user, tetap tersimpan di codebase agar mudah di-uncomment jika dibutuhkan kembali.

---

## 8. Persistensi Database Shakemap (`EarthquakeRecord`) (21-22 Agustus 2026)

**Konteks:** BMKG hanya menyajikan field `Shakemap` pada gempa nasional 1 paling baru di `autogempa.json`. Ketika terjadi gempa nasional baru di daerah lain (misal gempa Bandung), gambar ShakeMap Pangandaran di BMKG hilang.

**Yang dikerjakan:**
- Model `EarthquakeRecord` ditambahkan pada `schema.prisma` dan dimigrasi ke **Neon PostgreSQL Cloud**.
- `EarthquakeService.ts`: fungsi `persistAndRetrievePangandaranShakemap` menyimpan data gempa & URL ShakeMap ke database secara otomatis.
- Jika BMKG memperbarui gempa nasional ke lokasi lain, backend SIGAP mengambil URL ShakeMap yang tersimpan di Postgres DB.
- Gambar ShakeMap Pangandaran (`20260820213133.mmi.jpg`) tampil permanen 100% di dashboard.
- Script seeder `seedEarthquakeRecord.ts` dibuat & dijalankan 1x untuk inisialisasi record gempa Pangandaran M4.2.

---

## 9. Penyesuaian UI Gempa & Pembersihan Label Magnitudo

- Di [`EarthquakeCard.tsx`](file:///c:/Kuliah%20Widyatama/sigap_app/apps/frontend/src/features/dashboard/components/EarthquakeCard.tsx), elemen `<span className="...">M</span>` dihapus agar tidak salah diartikan sebagai meter.
- Aspect ratio ShakeMap diubah dari `object-cover` to `object-contain` agar peta MMI tidak terpotong.

---

## 10. Dokumen Dokumentasi Logika Fitur (`DOKUMENTASI_LOGIKA_FITUR_SIGAP.md`)

- Dibuat dokumen teknis komprehensif di root workspace mencakup penjelasan konsep, matematika (rumus Haversine), alur kode, service, controller, hook, dan Prisma schema.

---

## 11. Pengetatan Filter Gempa Pangandaran Radius 100 KM & Dual-Filter (23 Agustus 2026)

- `EarthquakeService.getPangandaran()` diperketat: hanya mengambil gempa yang lokasinya menyebutkan kata "Pangandaran" ATAU berjarak $\le 100\text{ KM}$ dari Desa Cibenda.
- Gempa dari wilayah lain (seperti Kab. Bandung 116 KM) tidak lagi keliru masuk ke Card Pangandaran, melainkan dialihkan secara tepat ke Card Jawa Barat (radius 350 KM).
- Bila feed BMKG tidak memiliki gempa Pangandaran baru, backend secara otomatis melakukan query *fallback* ke record gempa Pangandaran $\le 100\text{ KM}$ terakhir di database Postgres `earthquake_records`.

---

## 12. Notifikasi Otomatis Tanpa Persetujuan Admin (23 Agustus 2026)

- Refaktor `alert.scheduler.ts` dengan fungsi terpisah `runAlertCheck()`.
- Web Push Notification otomatis di-dispatch untuk alert level `YELLOW`, `ORANGE`, dan `RED` tanpa membutuhkan persetujuan manual admin.
- Pengiriman notifikasi diisolasi dalam blok `try...catch` agar kendala jaringan push notification tidak menggagalkan proses penyimpanan alert ke database.

---

## 13. Pembaharuan Teks Deskripsi Alert Tsunami (25 Agustus 2026)

- Perubahan kalimat deskripsi alert `SIAGA` dan `AWAS` pada `bmkg.service.ts` dan script simulasi `simulate-alert.ts`.
- Aplikasi SIGAP berfungsi sebagai penerus informasi resmi yang mengarahkan warga ke portal resmi BMKG (`bmkg.go.id`) dan petunjuk petugas setempat, tanpa mendikte instruksi evakuasi secara sepihak.

---

## 14. Redesain Palet Warna Alert & Penataan Ikon Visual (25 Agustus 2026)

- **Palet Warna:**
  - Kuning (`YELLOW` / Waspada): `#ffc642` (Kuning Emas / Warm Gold) untuk kontras tinggi dan kenyamanan mata.
  - Orange (`ORANGE` / Siaga): `#f97316` (Oranye Jeruk) yang tegas dan dapat dibedakan dengan mudah dari warna kuning.
  - Dark Mode Red (`RED` / Awas): `#dc2626` (Merah Crimson Solid).
- **Hierarki Teks:** Teks deskripsi dan judul pada banner status menggunakan warna putih solid (`#ffffff`).
- **Penataan Ikon Banner:**
  - Aman (`GREEN`): Ceklis Hijau Lingkaran.
  - Waspada (`YELLOW`): `<AlertOctagon />` (Segidelapan / Octagon Tanda Seru).
  - Siaga (`ORANGE`): `<ShieldAlert />` (Perisai Tanda Seru).
  - Awas (`RED`): `<AlertTriangle />` (Segitiga Tanda Seru).

---

## 15. Audit Log Pengiriman Notifikasi & Endpoint Public (`NotificationLog`) (27 Agustus 2026)

- Model Prisma `NotificationLog` dibuat & dimigrasi ke database PostgreSQL Cloud (Neon DB).
- `NotificationService.dispatch()` secara otomatis mencatat setiap siklus pengiriman push notification ke `notification_logs`:
  - `alertId`, `level`, `title`, `body`
  - `triggeredBy` (`"CRON_SCHEDULER"`, `"MANUAL_SIMULATION"`, `"ADMIN_DISPATCH"`)
  - `totalSubscribers`, `sentCount` (sukses), `failedCount` (gagal)
  - `errorDetails` (rincian pesan error kegagalan pengiriman ke subscriber bila ada)
  - Timestamp pengiriman presisi (`createdAt`).
- **Endpoint Publik Baru:** `GET /api/v1/public/notifications/logs` dibuat untuk memberikan transparansi dan bukti riwayat pengiriman notifikasi yang dapat diakses oleh admin/dashboard kapan saja.

---

## 16. Diferensiasi Pola Getar (Vibrate) per Level Alert (23 Agustus 2026)

- `notification.types.ts`: tambah field `vibrate: number[]` dan `requireInteraction: boolean` ke `NotificationPayload`.
- `notification.service.ts`: tambah `VIBRATION_PATTERNS` map (YELLOW/ORANGE/RED) dan isi field tersebut di `getLatestPayload()`.
- `sw.js` (service worker frontend): update handler `push` event — konsumsi `vibrate`, `requireInteraction`, dan `renotify: true` dari data payload secara dinamis.

---

## 17. Backend 24/7 via Vercel + Cron-job.org (24 Agustus 2026)

- `internal.route.ts` dibuat: `POST /api/v1/public/internal/run-scheduler` — satu siklus `runAlertCheck()` per HTTP call.
- Route didaftarkan di `routes/index.ts` sebagai `publicRouter.use("/internal", internalRouter)`.
- cron-job.org dikonfigurasi: POST ke endpoint tersebut setiap 1 menit, timezone Asia/Jakarta.

---

## 18. Ikon Cuaca Siang/Malam Berstandar Industri & Redesain Logo Gempa SVG (28–30 Agustus 2026)

- **Ikon Cuaca Siang & Malam Dinamis (`WeatherSection.tsx`):**
  - Mengintegrasikan deteksi jam lokal (`06:00 - 18:00 WIB` = Siang, `18:00 - 06:00 WIB` = Malam).
  - Saat malam hari: kondisi Cerah menampilkan Bulan Sabit (`BsMoon`), dan kondisi Cerah Berawan/Berawan menampilkan Bulan + Awan (`BsCloudMoon`) dengan warna soft moonlight (`#60a5fa`).
  - Kondisi Hujan (`CloudRain`) dan Badai (`CloudLightning`) tetap konsisten di siang maupun malam.
- **Format Tanggal Bulan Utuh Tanpa Singkatan (`utils/date.ts`):**
  - Mengubah opsi Intl `month: "short"` menjadi `month: "long"`. Penulisan tanggal pada Card Gempa & Tsunami menjadi lengkap (contoh: **"28 Agustus 2026"**, bukan "28 Agu 2026").
- **Masa Aktif Status Alert (Current Alert Expiry):**
  - Dipatok maksimal **24 Jam (1 Hari)** sejak gempa Pangandaran terjadi.
  - `AlertService.getCurrentAlert()` dan `DecisionEngineService.evaluate()` secara otomatis mengembalikan status kesiapsiagaan ke **GREEN (AMAN)** jika alert atau gempa berusia > 24 jam.
- **Umur Maksimum Card Gempa Pangandaran & Jawa Barat:**
  - Batas umur maksimum gempa pada card Pangandaran dan Jawa Barat disesuaikan menjadi **7 Hari (1 Minggu)** (`PANGANDARAN_MAX_AGE_DAYS = 7`, `WEST_JAVA_MAX_AGE_DAYS = 7`).
- **Redesain Ikon Regional Card Gempa dengan Logo SVG Resmi:**
  - Menghapus background kotak warna di belakang ikon.
  - Menampilkan murni logo SVG beresolusi tinggi di samping judul:
    - Card Gempa Indonesia: **Bendera Merah Putih Indonesia** (`logo-indonesia.svg`).
    - Card Gempa Jawa Barat: **Logo Lambang Provinsi Jawa Barat** (`logo-jawabarat.svg`).
    - Card Gempa Pangandaran: **Logo Lambang Kabupaten Pangandaran** (`logo-pangandaran.svg`).
- **Push ke Repository GitHub:**
  - Kode dicommit dan dipush ke branch `feat/earthquake-expiry-and-logos` (Commit `594fcec` dan `9226e62`).

---

## 19. FS-03 Kelola Kontak Darurat — Backend: CRUD, Safeguard isCore & Seeding 6 Kontak Inti (3 September 2026)

- **Model Prisma & Sinkronisasi Neon Cloud Database (`schema.prisma`):**
  - Menambahkan model `EmergencyContact` yang dipetakan ke tabel `emergency_contacts`.
  - Field: `id` (UUID), `institution`, `phoneNumber`, `isCore` (Boolean default `false`), `createdAt`, `updatedAt`.
  - Schema disinkronkan ke PostgreSQL Cloud (Neon DB) dan Prisma Client digenerate ulang.
- **Seeding 6 Kontak Darurat Inti Resmi (`prisma/seed.ts`):**
  - Menginisialisasi 6 kontak darurat resmi Kabupaten Pangandaran / Desa Cibenda dengan flag `isCore = true`:
    1. Ambulans / PSC 119 Pangandaran (`119`)
    2. Pemadam Kebakaran (Damkar) Pangandaran (`0265-639113`)
    3. Kepolisian (Polsek Parigi) (`0265-639110`)
    4. Puskesmas Parigi (`0265-639345`)
    5. BPBD Kabupaten Pangandaran (`0265-639733`)
    6. Kantor Pemerintah Desa Cibenda (`0812-2345-6789`)
- **Implementasi Clean Repository Pattern di Backend:**
  - **Types (`types/emergencyContact.types.ts`):** Definisi interface entitas kontak dan DTO create/update.
  - **Repository (`repositories/emergencyContact.repository.ts`):** Query database dengan urutan kontak inti (`isCore: true`) selalu berada di paling atas.
  - **Service (`services/emergencyContact.service.ts`):** 
    - Create otomatis menetapkan `isCore = false` untuk seluruh kontak baru dari API.
    - Update mengizinkan pembaruan nama atau nomor baik untuk kontak inti maupun non-inti.
    - Safeguard Delete: Menolak penghapusan kontak inti dengan status `400 Bad Request` dan pesan error *"Kontak darurat inti tidak dapat dihapus."*.
  - **Validator (`validators/emergencyContact.validator.ts`):** Validasi string wajib non-kosong untuk institusi dan nomor telepon (`422 Unprocessable Entity`).
  - **Controller (`controllers/emergencyContact.controller.ts`):** Format standard JSON envelope `{ success, message, data }` atau `{ success, message, errors }`.
  - **Routes (`routes/emergencyContact.route.ts` & `routes/index.ts`):**
    - Public: `GET /api/public/emergency-contacts`, `GET /api/public/emergency-contacts/:id`.
    - Protected (JWT): `GET`, `POST`, `PUT`, `DELETE` di `/api/protected/emergency-contacts`.
- **Pengujian & Verifikasi:**
  - Verifikasi manual lolos 100% via cURL dan Postman (Get list, Get detail, Create non-core, Update, Reject delete core 400, Delete non-core 200, Reject validation 422).
  - TypeScript build & typecheck lolos (0 error).
  - Dikerjakan pada branch `feature/be-kontak-darurat`.

---

## 20. FS-05 Kelola Panduan Kesiapsiagaan — Backend: Entity PreparednessGuide & Constraint (3 September 2026)

- **Model Prisma & Sinkronisasi Neon Cloud Database (`schema.prisma`):**
  - Menambahkan enum `GuideSourceType` (`RESMI`, `MITRA`).
  - Menambahkan model `PreparednessGuide` yang dipetakan ke tabel `preparedness_guides`.
  - Field: `id` (UUID), `title`, `content` (nullable text), `externalUrl` (nullable text, `@map("external_url")`), `sourceType` (default `RESMI`, `@map("source_type")`), `publishedAt` (default `now()`, `@map("published_at")`), `createdAt`, `updatedAt`.
  - Schema disinkronkan ke PostgreSQL Cloud (Neon DB) dan Prisma Client digenerate ulang.
- **Seeding Baseline Data Panduan (`prisma/seed.ts`):**
  - Menginisialisasi 2 panduan kesiapsiagaan awal:
    1. *"Panduan Mitigasi Gempa Bumi Megathrust"* (mode artikel langsung, `sourceType = RESMI`).
    2. *"Buku Saku Tanggap Bencana BNPB"* (mode tautan eksternal `https://bnpb.go.id/buku-saku-tanggap-bencana`, `sourceType = MITRA`).
- **Implementasi Clean Repository Pattern di Backend:**
  - **Types (`types/preparednessGuide.types.ts`):** Interface tipe data record dan DTO create/update.
  - **Repository (`repositories/preparednessGuide.repository.ts`):** Query database dengan urutan waktu publikasi terbaru (`publishedAt: desc`).
  - **Service (`services/preparednessGuide.service.ts`):** Penegakan constraint bisnis (minimal salah satu dari `content` atau `externalUrl` harus terisi; tolak jika keduanya kosong atau keduanya dihapus saat update dengan error `422 Unprocessable Entity`).
  - **Validator (`validators/preparednessGuide.validator.ts`):** Validasi wajib judul (`title`), enum `sourceType` (`RESMI` | `MITRA`), format URL regex pada tautan eksternal, dan penolakan constraint data kosong (`422`).
  - **Controller (`controllers/preparednessGuide.controller.ts`):** Standard JSON envelope response `{ success, message, data }` atau `{ success, message, errors }`.
  - **Routes (`routes/preparednessGuide.route.ts` & `routes/index.ts`):**
    - Public: `GET /api/public/preparedness-guides`, `GET /api/public/preparedness-guides/:id`.
    - Protected (JWT): `GET`, `POST`, `PUT`, `DELETE` di `/api/protected/preparedness-guides`.
- **Pengujian & Verifikasi:**
  - Verifikasi manual lolos 100% via Postman (Get all, Create mode artikel 201, Create mode link 201, Reject constraint keduanya kosong 422, Update 200, Delete 200).
  - TypeScript build & typecheck lolos (0 error).
  - Dikerjakan pada branch `feature/be-guide-siapsiaga`.

---

## 21. Portal Login Admin & Integrasi Navigasi Sidebar Admin (Frontend) (3 September 2026)

- **Akses & Branding Portal Login:**
  - Halaman publik warga desa sengaja tidak memiliki tombol login (keamanan berbasis obscuritas terarah). Akses login dilakukan langsung melalui URL khusus `/admin/login` atau `/login`.
  - Menggunakan palet warna brand resmi `#00247D` (Navy Blue) yang selaras dengan lambang Kabupaten Pangandaran (`lambang-kabupaten-pangandaran.webp`), background dekoratif radial blur, dan tata letak kartu modern.
- **Implementasi Formulir Login Admin (`LoginPage.tsx`):**
  - Menggunakan React Hook Form dipadukan dengan schema validasi Zod (`zodResolver`).
  - Mekanisme keamanan proteksi percobaan login (rate-limiting / brute-force protection): kuota dibatasi maksimal 5 kali gagal berturut-turut.
  - Banner peringatan merah (`TriangleAlert`) hanya muncul saat ada kesalahan kredensial atau batas percobaan habis (akun terkunci 15 menit), sehingga tampilan awal tetap bersih.
  - Fitur "Ingat saya" menyimpan email preferensi di `localStorage` (`sigap_remember_email`).
  - Navigasi kembali: Tautan cepat "Kembali ke Portal Informasi Warga" (`/`).
- **Route Guard / Guest Route Protection (`GuestRoute.tsx` & Router):**
  - Dibuat komponen proteksi rute `GuestRoute.tsx` untuk membungkus rute `/login` dan `/admin/login`.
  - Jika pengguna sudah memiliki sesi login aktif (`sigap_token`), akses ke halaman login dicegah dan secara otomatis dialihkan (`replace: true`) ke dashboard.
- **State Management Autentikasi (`authStore.ts`):**
  - Implementasi store Zustand `useAuthStore` untuk melacak `token`, objek `user`, dan status boolean reaktif `isAdmin`.
  - Parsing token JWT base64 aman di sisi peramban untuk mengekstrak identitas administrator dan role akses.
  - Sinkronisasi instan terhadap penyimpanan `localStorage` (`sigap_token`).
- **Restrukturisasi Sidebar Khusus Admin (`Sidebar.tsx` & `global.css`):**
  - Tampilan sidebar terbagi rapi saat status `isAdmin` aktif:
    - Ditambahkan separator visual dan header kategori kecil `"ADMIN"`.
    - Menu utilitas admin berformat datar (flat list, bukan dropdown) dalam Bahasa Indonesia: *Dashboard Admin*, *Log & Verifikasi Alert*, *Monitoring Cuaca*, *Aktivitas Seismik*, *Kontrol Sirine & IoT*, *Pengaturan Sistem*.
    - Visual hover, status aktif (active hash / route), dan ukuran teks dibuat 100% konsisten dengan menu publik warga.
    - Spacing monitor status alat IoT (`.sidebar__device-card`) diperbaiki dengan penataan margin & divider agar tidak berhimpitan.
  - Footer menu admin di posisi paling bawah sidebar:
    - Tombol **Admin Profile**: membuka Modal Profil Administrator (backdrop-blur) yang menampilkan nama akun, email, peran hak akses, dan status sesi terautentikasi (pulsing emerald dot).
    - Tombol **Logout**: mengeksekusi pembersihan sesi token di store Zustand, menutup drawer sidebar, dan otomatis melakukan redirect kembali ke `/admin/login` (bukan terlempar di halaman publik).
- **Branch & Git Commits:**
  - Dikerjakan pada branch `feature/fe-admin-login`.
  - Dicommit secara terorganisir:
    1. `2a7f494` — `feat(auth): implementasi auth store zustand dan guest route protection`
    2. `8e2f86e` — `feat(auth): implementasi portal login admin dengan rate limit warning`
    3. `b5b0eef` — `feat(sidebar): integrasi menu navigasi admin, profil, dan redirect logout`

---

## 22. FS-02 Verifikasi & Validasi Alert — Backend: Migrasi Prisma, Endpoint & Safeguard Review (7 September 2026)

- **Model Prisma & Sinkronisasi Neon Cloud Database (`schema.prisma`):**
  - Menambahkan enum `AlertReviewStatus` (`BELUM_DITINJAU`, `DIKONFIRMASI`, `DITOLAK`, `DITINDAKLANJUTI`).
  - Menambahkan field audit di model `Alert`: `reviewStatus`, `reviewedBy`, `reviewedAt`.
  - Menambahkan relasi foreign key opsional ke model `User` (`reviewer User? @relation(fields: [reviewedBy], references: [id])`).
  - Menambahkan index database majemuk: `@@index([reviewStatus, createdAt(sort: Desc)])` dan `@@index([level, reviewStatus])` untuk optimasi filter tabel data.
  - Menjalankan migrasi Prisma ke Neon PostgreSQL Cloud.
- **Implementasi Clean Architecture di Backend:**
  - **Repository (`alert.repository.ts`):** `findFilteredAlerts()` dengan filter dinamis (severity, status, date range), pagination, dan kalkulasi agregasi statistik status 24 jam (`getStats()`).
  - **Service (`alert.service.ts`):** Penegakan aturan bisnis review (hanya dapat mengklasifikasikan ke Dikonfirmasi, Ditolak, atau Ditindaklanjuti; status Belum Ditinjau adalah status default awal dan tidak bisa dipilih manual).
  - **Validator (`alert.validator.ts`):** Validasi query params (`page`, `limit`, `severity`, `reviewStatus`, rentang tanggal ISO) dan body payload review (`422 Unprocessable Entity`).
  - **Controller (`alert.controller.ts`):** Menangani `GET /api/protected/alerts`, `GET /api/protected/alerts/:id`, dan `PATCH /api/protected/alerts/:id/review`.
- **Pengujian & Verifikasi:**
  - Database schema sinkron 100% di Neon DB.
  - Branch: `feature/be-alert-validate` (Commit: `de957a7`).

---

## 23. FS-02 Verifikasi & Riwayat Alert — Frontend: Redesain Presisi & Destrukturisasi Komponen Modular (7 September 2026)

- **Redesain UI Sesuai Referensi Visual:**
  - **Header Halaman:** Tipografi modern tanpa container icon (`Alert Verification` & subtitle `Review and process incoming telemetry and agency alerts.`).
  - **4 Stat Cards:**
    - `Total Pending`: Nilai besar + circular badge soft blue dengan icon monitor di pojok kanan atas.
    - `Confirmed (24h)`: Nilai besar + badge trend persentase `↑12%` + circular badge soft mint checkmark di pojok kanan atas.
    - `Rejected (24h)`: Nilai besar + circular badge soft grey X di pojok kanan atas.
    - `Escalated`: Nilai besar + circular badge soft amber warning di pojok kanan atas.
  - **Toolbar Filter:** Input pencarian `Filter by description or source...` dan 2 pill select dropdown (`All Severities` dan `Belum Ditinjau`) di sisi kanan.
  - **Tabel Data:**
    - Timestamp dengan tanggal primer (`Today, 14:23 WIB`) dan relative time (`2 mins ago`).
    - Severity badge pill dengan dot (`• High`, `• Medium`, `• Low`).
    - Status badge pill (`Belum Ditinjau`, `✓ Dikonfirmasi`, `✕ Ditolak`, `Ditindaklanjuti`).
    - Aksi diferensiasi tombol: Solid dark blue (`#00247D`) untuk `Tinjau Detail` (item pending), dan Outline blue (`Lihat`) untuk item yang sudah ditinjau.
  - **Pagination Footer:** Menampilkan `Showing X-Y of Z` di sisi kiri dan navigasi halaman berformat `< [1] 2 ... >` di sisi kanan.
- **Destrukturisasi Kode (Eliminasi Monolithic File):**
  - Menguraikan `AlertTable.tsx` (~402 baris) dan `AlertReviewModal.tsx` (~302 baris) menjadi modul-modul kecil berfokus tunggal (rata-rata 25-80 baris):
    - `components/AlertHeader.tsx` (43 baris)
    - `components/AlertFeedbackBanner.tsx` (49 baris)
    - `components/badges/AlertSeverityBadge.tsx` (44 baris)
    - `components/badges/AlertStatusBadge.tsx` (55 baris)
    - `components/cards/AlertStatCard.tsx` (52 baris)
    - `components/cards/AlertStatCards.tsx` (62 baris)
    - `components/table/AlertTableToolbar.tsx` (87 baris)
    - `components/table/AlertTableHeader.tsx` (28 baris)
    - `components/table/AlertTableRow.tsx` (78 baris)
    - `components/table/AlertTableSkeleton.tsx` (40 baris)
    - `components/table/AlertTableEmpty.tsx` (22 baris)
    - `components/table/AlertPagination.tsx` (117 baris)
    - `components/table/AlertTable.tsx` (100 baris)
    - `components/modal/AlertReviewSummary.tsx` (64 baris)
    - `components/modal/AlertReviewOption.tsx` (58 baris)
    - `components/modal/AlertReviewModal.tsx` (174 baris)
    - `utils/alertFormatters.ts` (helper formatting relative time)
  - Seluruh file lama mempertahankan re-export bersih untuk backward-compatibility.
- **Pengujian & Verifikasi:**
  - `tsc -b && vite build` lolos 100% dengan 0 error TypeScript.
  - Dev server HTTP 200 di `http://localhost:5173/admin/alerts`.
  - Dikerjakan pada branch `feature/fe-alert-validate`.

---

## Ringkasan Keputusan Penting

- Severity gempa: dari MMI/`Dirasakan` resmi BMKG, **bukan** ambang batas magnitudo/radius buatan sendiri.
- Umur aktif alert status: **maksimal 24 Jam (1 Hari)**, setelahnya otomatis kembali ke status **GREEN (AMAN)**.
- Umur maksimum card gempa Pangandaran & Jawa Barat: **maksimal 7 Hari (1 Minggu)**.
- Filter gempa Pangandaran: **pencocokan nama + radius $\le 100\text{ KM}$**.
- Format tanggal di dashboard: **Bulan diisi utuh ("Agustus", "September") tanpa singkatan**.
- Ikon cuaca: **Diferensiasi Siang (Matahari) & Malam (Bulan / Bulan+Awan)** sesuai jam lokal (18:00 - 06:00 WIB).
- Ikon card gempa: **Logo SVG resmi (Indonesia, Jawa Barat, Pangandaran) murni tanpa background kotak**.
- Push notification: **otomatis terkirim** untuk level `YELLOW`/`ORANGE`/`RED` & **dicatat ke `notification_logs`**.
- Audit trail notifikasi: diakses via public endpoint **`GET /api/v1/public/notifications/logs`**.
- Deskripsi alert tsunami: **mengarahkan ke BMKG & petugas resmi**, tidak mendikte evakuasi sepihak.
- Threshold ESP32 Device: **20 detik** (2x heartbeat failure).
- Persistensi ShakeMap: disimpan permanen di **Neon Postgres Cloud (`earthquake_records`)**.
- Vibrate pattern: **YELLOW `[200]` | ORANGE `[200,100,200]` | RED `[300,100,300,100,300]`**.
- Backend 24/7: **cron-job.org** trigger `POST /internal/run-scheduler` tiap 1 menit ke Vercel.
- Portal Admin Login: **URL tersembunyi `/admin/login` tanpa tombol di UI publik warga, brand color `#00247D`, lockout batas 5x gagal**.
- Navigasi Sidebar Admin: **Format flat menyatu dengan divider dan label "ADMIN", modal info profil, serta aksi logout yang mengalihkan langsung kembali ke portal login**.
- FS-02 Review Status Alert: **`Belum Ditinjau` (default), `Dikonfirmasi` (valid), `Ditolak` (false alarm), `Ditindaklanjuti` (eskalasi lapangan)**. Tidak memblokir notifikasi realtime warga, murni administratif & pengarsipan.
- Destrukturisasi Komponen: **Komponen tabel, modal, kartu statistik, dan badge dipecah ke subdirektori modular (table/, modal/, cards/, badges/) dengan baris kode ramping (< 100 baris per file)**.
