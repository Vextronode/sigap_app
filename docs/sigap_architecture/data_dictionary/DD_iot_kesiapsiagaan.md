# Data Dictionary - Domain: IoT Kesiapsiagaan (Indikator + Sirine)

> Status: **yellow**. Dua keputusan governance masih terbuka (jalur tombol sirine, protokol komunikasi platform↔device) - lihat PRD SIGAP v4.0 7.1. Field yang bergantung padanya ditandai eksplisit di bawah, bukan diasumsikan.

## Entity: `iot_devices`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | - |
| device_name | VARCHAR(100) | Nama/lokasi device | `"Indikator Balai Desa"` |
| latitude | NUMERIC(9,6) | Koordinat pemasangan | `-7.691000` |
| longitude | NUMERIC(9,6) | Koordinat pemasangan | `108.470000` |
| status | ENUM `device_connectivity` | Status koneksi terkini: online/offline/degraded | `"online"` |
| current_level | ENUM `status_level` | Level yang sedang ditampilkan di device | `"kuning"` |
| last_seen_at | TIMESTAMPTZ | Waktu terakhir device melapor | `2026-07-09T08:10:00Z` |
| created_at / updated_at | TIMESTAMPTZ | Audit standar | - |

**Catatan Fail-Safe (Final):** saat `status = 'offline'`, FE wajib menampilkan mode terpisah (bukan warna `current_level` apa adanya) agar tidak disalahartikan sebagai kondisi aman. Ini bukan sekadar rekomendasi UI - ini requirement keselamatan yang sudah dikunci di PRD §3.1.

## Entity: `device_status_log`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | - |
| device_id | UUID (FK → iot_devices.id) | Device terkait | - |
| level_sent | ENUM `status_level` | Level yang dikirim sistem ke device | `"merah"` |
| sent_at | TIMESTAMPTZ | Waktu pengiriman | - |
| ack_status | VARCHAR(20), NULLABLE | TBD - hanya terisi jika device network-connected & mengirim acknowledgment | `"acked"` / `NULL` |

## Entity: `siren_action_log`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | - |
| device_id | UUID (FK → iot_devices.id) | Device yang sirine-nya dibunyikan | - |
| operator_id | UUID (FK → users.id), NULLABLE | TBD - hanya terisi jika tombol network-connected & operator teridentifikasi sistem. `NULL` jika jalur lokal murni (berarti tidak ada audit trail digital) | - |
| level_at_trigger | ENUM `status_level` | Level saat tombol ditekan - **hanya boleh `oranye` atau `merah`** (safeguard by design, dikunci di level database via CHECK constraint) | `"merah"` |
| triggered_at | TIMESTAMPTZ | Waktu sirine dibunyikan | - |

**Konsekuensi jika jalur tombol ternyata lokal murni (bukan network-connected):** `operator_id` akan selalu `NULL`, dan tabel ini menjadi log yang hanya mencatat "sirine di device X dibunyikan pada level Y", tanpa mencatat siapa pelakunya. Ini keterbatasan yang perlu disadari tim sebelum FE membangun tampilan yang menampilkan `operator_id` seolah selalu tersedia.
