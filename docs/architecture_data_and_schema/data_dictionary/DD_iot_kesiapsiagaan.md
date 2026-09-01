# Data Dictionary - Domain: IoT Kesiapsiagaan (Indikator + Sirine)

> Status: **light_green**. Arsitektur hybrid (lokal fisik + remote aplikasi) dan protokol komunikasi (REST Polling) sudah final - lihat ADR-012, ADR-013. Implementasi jalur remote aplikasi sengaja ditangguhkan (bukan TBD yang menghambat), lihat ADR-012.

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
| sync_status | VARCHAR(20), NULLABLE | Status sinkronisasi terakhir saat device berhasil polling data ini | `"synced"` / `NULL` |

## Entity: `siren_action_log`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | - |
| device_id | UUID (FK → iot_devices.id) | Device yang sirine-nya dibunyikan | - |
| operator_id | UUID (FK → users.id), NULLABLE | Terisi hanya jika trigger_source = remote_aplikasi (ditegakkan lewat CHECK constraint di database, lihat ADR-014). NULL jika trigger_source = lokal_fisik. | - |
| level_at_trigger | ENUM `status_level` | Level saat tombol ditekan - **hanya boleh `oranye` atau `merah`** (safeguard by design, dikunci di level database via CHECK constraint) | `"merah"` |
| triggered_at | TIMESTAMPTZ | Waktu sirine dibunyikan | - |
| trigger_source | ENUM `siren_trigger_source` | Jalur aktivasi: `lokal_fisik` atau `remote_aplikasi` (ADR-012) | `"lokal_fisik"` |

**Konsekuensi desain (final, ADR-012/ADR-014):** untuk aksi via lokal_fisik, audit trail mencatat perangkat dan waktu, tetapi tidak mencatat identitas operator secara digital — ini konsekuensi yang disadari dan diterima, bukan keterbatasan sementara.
