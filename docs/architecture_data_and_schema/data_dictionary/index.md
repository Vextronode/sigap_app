# Data Dictionary - SIGAP
## Panduan Membaca & Struktur Folder

---

### 1. Status Dokumen

**INTERIM - 7 Hari.** Dokumen ini dibuat untuk kebutuhan mendesak kontrak data bagi FE dalam jangka waktu 7 hari, bukan deliverable G3 (Architecture Document) final. Setelah G3 resmi berjalan, dokumen ini menjadi titik awal, bukan keputusan yang sudah terkunci.

### 2. Struktur Folder

| File | Domain | Status |
|---|---|---|
| `DD_core_users.md` | Users & autentikasi | light_green |
| `DD_content_admin.md` | Pengumuman, titik/jalur evakuasi, kontak darurat | light_green |
| `DD_environmental.md` | Data lingkungan & alert log | light_green |
| `DD_iot_kesiapsiagaan.md` | Perangkat IoT, indikator, sirine | yellow |

Status `yellow` pada domain IoT Kesiapsiagaan menandai bahwa dua keputusan governance (jalur tombol sirine, protokol komunikasi platform↔device) masih terbuka - lihat PRD SIGAP v4.0 7.1. Field yang bergantung pada keputusan tersebut ditandai eksplisit di masing-masing tabel, bukan diasumsikan.

Penomoran file mengikuti urutan dependency foreign key yang sama dengan `db/schema/` - `users` harus ada lebih dulu karena beberapa tabel domain lain mereferensikannya.

### 3. Konvensi Penamaan

Standar penamaan lintas sistem program belum tersedia. Konvensi berikut dipakai sebagai standar sementara untuk SIGAP, konsisten dan mudah diperbarui:

- Tabel dan kolom: `snake_case`
- Primary key: `id` (UUID)
- Foreign key: `<nama_tabel_singular>_id`
- Timestamp: `created_at`, `updated_at` (TIMESTAMPTZ), `*_at` untuk waktu kejadian spesifik
- Enum status: nilai dalam Bahasa Indonesia huruf kecil (`hijau`, `kuning`, `oranye`, `merah`) agar konsisten dengan istilah yang dipakai warga dan operator di lapangan

### 4. Status Kesiapsiagaan (Referensi Silang)

Dipakai di `alert_log.severity`, `iot_devices.current_level`, `device_status_log.level_sent`, `siren_action_log.level_at_trigger` - satu ENUM (`status_level`) dipakai di seluruh domain, bukan didefinisikan ulang per tabel.

| Nilai Enum | Nama Status | Dapat Memicu Sirine? |
|---|---|---|
| `hijau` | Aman | Tidak |
| `kuning` | Waspada | Tidak |
| `oranye` | Siaga | Ya |
| `merah` | Awas | Ya |

### 5. Referensi Silang ke Schema SQL

Setiap entity pada dokumen ini punya definisi DDL 1:1 di `db/schema/`, dengan penomoran file yang sama:

| Data Dictionary | Schema SQL |
|---|---|
| `DD_core_users.md` | `002_users.sql` |
| `DD_content_admin.md` | `003_content_admin.sql` |
| `DD_environmental.md` | `004_environmental.sql` |
| `DD_iot_kesiapsiagaan.md` | `005_iot_kesiapsiagaan.sql` |

ENUM types (`status_level`, `device_connectivity`) didefinisikan satu kali di `001_core_types.sql` dan dirujuk lintas domain.
