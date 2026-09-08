# SIGAP Development Checklist

> Ditulis ulang 10 Agustus 2026 berdasarkan audit langsung ke kode. Diperbarui 30 Agustus 2026: penanganan umur alert 24h, umur card gempa 7 hari, ikon cuaca siang/malam dinamis, format nama bulan utuh, logo SVG regional, dan validasi migrasi API `726f81e`.

Status Legend

- [ ] Belum dikerjakan
- [x] Selesai
- [~] Sedang berjalan / sebagian selesai (lihat catatan)

---

# 1. Alert (Decision Engine) — Fitur Utama

### Backend

- [x] Alert model (Prisma)
- [x] AlertService (simpan & baca dari PostgreSQL)
- [x] AlertController + public API (`/alerts`, `/alerts/current`, `/alerts/history`)
- [x] Scheduler polling BMKG tiap 60 detik
- [x] Decision Engine — status tsunami resmi sebagai prioritas 1
- [x] Decision Engine — severity gempa dari field `Dirasakan` (MMI resmi BMKG), bukan ambang batas magnitudo buatan sendiri
- [x] Decision Engine — pakai gempa yang sudah difilter relevan (`getPangandaran()`), bukan gempa nasional terbaru
- [x] **Umur Status Alert 24 Jam (1 Hari)**: Status alert aktif (Waspada/Siaga/Awas) dipatok maksimal 24 jam sejak kejadian gempa Pangandaran. Setelah > 24 jam, status otomatis kadaluarsa & kembali ke **GREEN (AMAN)**
- [x] Duplicate alert prevention (skip simpan kalau level/source/description sama persis)
- [~] Alert Validation oleh admin (`POST /alerts/validate`) — endpoint didokumentasikan, **belum diimplementasikan**. Terkait langsung dengan bagian 11 (Push Notification).
- [ ] RBAC benar-benar menegakkan role/permission — token sudah bawa `roles`/`permissions`, tapi belum ada middleware yang benar-benar mengecek (belum ada 403 di mana pun)

### Frontend

- [x] Alert query hook
- [x] CurrentAlertCard (banner status besar + badge status di top bar)
- [x] Loading / Error / Empty / Success state

---

# 2. Weather — Fitur Utama

### Backend

- [x] Current Weather API (`/weather/current`)
- [x] Forecast API (`/weather/forecast`)
- [x] BMKG parser (`bmkg.service.ts`)

### Frontend

- [x] WeatherSection (suhu, kelembapan, angin, forecast 4 hari)
- [x] **Ikon Cuaca Siang & Malam Dinamis Berstandar Industri**: Deteksi jam lokal real-time (18:00 - 06:00 WIB = Malam). Kondisi cerah berganti ke Bulan Sabit (`BsMoon`), dan cerah berawan/berawan berganti ke Bulan + Awan (`BsCloudMoon`) dengan warna soft moonlight (`#60a5fa`)
- [x] Auto refresh via React Query

---

# 3. Earthquake — Fitur Utama

**Status: Selesai**, telah diperbarui dengan persistensi database ShakeMap, penyesuaian umur gempa 7 hari, dan logo SVG regional.

### Backend

- [x] 3 endpoint regional: `/earthquakes/indonesia`, `/earthquakes/west-java`, `/earthquakes/pangandaran` (+ alias lama `/latest`)
- [x] **Batas Umur Gempa 7 Hari (1 Minggu)**: Filter radius + umur maksimum disesuaikan menjadi 7 hari (`PANGANDARAN_MAX_AGE_DAYS = 7`, `WEST_JAVA_MAX_AGE_DAYS = 7`)
- [x] **Persistensi Database ShakeMap (`EarthquakeRecord` model Prisma)**: Data & URL ShakeMap gempa Pangandaran ditangkap & disimpan ke Postgres Cloud (Neon DB)
- [x] Response contract sesuai `API_Spec.md` bagian 8.3

### Frontend

- [x] 3x EarthquakeCard (Indonesia, Jawa Barat, Pangandaran) — Pangandaran di atas, 2 lainnya di grid bawah
- [x] **Redesain Ikon Logo Regional SVG Resmi**: Menghapus background kotak warna, menggunakan logo SVG murni beresolusi tinggi (Bendera Indonesia, Logo Jawa Barat, Logo Pangandaran)
- [x] **Penulisan Format Tanggal Bulan Utuh**: Mengubah `month: "short"` ke `month: "long"` agar nama bulan tidak disingkat ("28 Agustus 2026")
- [x] Loading / Error / Empty state per card

---

# 4. Tsunami

**Status: Selesai (dengan batasan yang didokumentasikan)** — UI dan sumber data jalan otomatis.

- [x] Public endpoint `/tsunami/status` (+ alias `/tsunamis/status`)
- [x] Response contract sesuai `API_Spec.md` bagian 8.4
- [x] Status diestimasi otomatis dari field `Potensi` gempa BMKG terdekat (`getPangandaran()`), dibatasi maksimal WASPADA.
- [x] Redesain TsunamiCard dengan ikon `GiBigWave` & titik status berdenyut.

---

# 5. AI Summary

- [x] Frontend `AISummaryCard` di-comment di `DashboardPage.tsx` (dapat di-uncomment kapan saja)

---

# 6. Fitur Bonus (Announcements, Kontak Darurat, Evakuasi)

- [ ] Prisma model (Announcement, EvacuationPoint, EvacuationRoute, EmergencyContact)
- [ ] Backend routes (public GET + protected CRUD)
- [x] Frontend tampil dengan data dummy/statis (`peta-evakuasi.webp` terpasang)

---

# 7. Auth & RBAC

- [x] Login (`POST /auth/login`) — terbitkan JWT berisi roles & permissions
- [x] `GET /auth/me` (protected)
- [ ] Enforcement role/permission di endpoint

---

# 8. Device / IoT (Sirine) — Punya tim device

- [x] `GET /device/status` — return systemStatus + level alert
- [x] `POST /device/register` & `POST /device/heartbeat`
- [x] Threshold waktu offline **20 detik** (`OFFLINE_THRESHOLD_MS = 20 * 1000`)
- [x] `useDeviceStatus.ts` — polling interval 20 detik

---

# 9. Push Notification (`feature/push-notification`)

- [x] Model `PushSubscription` & `NotificationLog` (Prisma)
- [x] Endpoint `GET /api/v1/public/notifications/logs`
- [x] Vibrate pattern per level (`[200]`, `[200, 100, 200]`, `[300, 100, 300, 100, 300]`)
- [x] `requireInteraction: true` & `renotify: true` di service worker (`sw.js`)

---

# 10. Backend 24/7 via Vercel + Cron-job.org

- [x] Endpoint `POST /api/v1/public/internal/run-scheduler` (`internal.route.ts`)
- [x] Cron-job.org dipasang polling tiap 1 menit
- [~] **`CRON_SECRET` di-set di Vercel env**: Ditunda untuk tahap development. Endpoint aman saat dev, dan disarankan dipasang `CRON_SECRET` sebelum go-live production akhir.

---

# 11. Audit Migrasi API Ketua Tim (Commit `726f81e`)

- [x] **Verified & Valid**: Commit `726f81e` dari Ketua Tim (Rival) memvalidasi `apiClient.ts` dengan helper `publicPath`/`protectedPath` dan penanganan `ApiResponse<T>` yang 100% seragam.
- [x] Build Test: Frontend & Backend `npx tsc -b` **Passed (0 Error)**.

---

# 12. Rencana Pekerjaan Selanjutnya (Dashboard User & Admin Prep)

- [ ] **Direct Click-to-Call Kontak Darurat di PWA**: Mengintegrasikan protokol `tel:` pada daftar kontak darurat agar warga di HP bisa langsung sekali klik menelepon ambulan/BPBD/polisi.
- [ ] **Zoom / Lightbox Modal Peta Evakuasi**: Menambahkan fitur klik-untuk-memperbesar gambar peta evakuasi (`peta-evakuasi.webp`) agar mudah dibaca di layar HP.
- [ ] **Persiapan Struktur Layout Halaman Admin (Persiapan Minggu Depan)**: Menyiapkan layout & protected route middleware halaman admin agar minggu depan siap pakai.
