# Rancangan Data Model Tahap 2

Dokumen ini memuat rancangan tabel yang belum ada di database. Tabel yang sudah berjalan berada di `architecture_data_and_schema/data_dictionary/`.

## 1. Data Historis Lingkungan (Area 6)

### `environmental_data`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | TEXT | Primary key | - |
| source | TEXT | Sumber data: `BMKG` atau `Open-Meteo` | `BMKG` |
| type | TEXT | Jenis data | `curah_hujan`, `suhu`, `kelembapan`, `angin` |
| value | DOUBLE PRECISION | Nilai terukur | `45.2` |
| unit | TEXT | Satuan | `mm` |
| recorded_at | TIMESTAMP | Waktu data tercatat di sumber | - |

Data seismik tidak termasuk tabel ini karena sudah disimpan pada `earthquake_records`.

## 2. Perangkat dan Sirine

Kontrak perangkat menunggu ketetapan Tech Lead. Rancangan berikut menjadi bahan keputusan tersebut dan mengikuti ADR-012, ADR-014, dan ADR-029.

### Perluasan `devices`

| Field | Tipe Data | Deskripsi |
|---|---|---|
| latitude / longitude | DOUBLE PRECISION, NULLABLE | Koordinat pemasangan, diisi admin |
| deviceType | ENUM `UNIT_UTAMA`, `SIRINE` | Jenis perangkat |
| current_level | ENUM `AlertLevel` | Level yang sedang ditampilkan perangkat |

### `device_status_log`

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | TEXT | Primary key |
| device_id | TEXT, FK ke `devices.id` | Perangkat terkait |
| level_sent | ENUM `AlertLevel` | Level yang diberikan ke perangkat |
| sent_at | TIMESTAMP | Waktu pengiriman |
| ack_status | TEXT, NULLABLE | Status sinkronisasi perangkat |

### `siren_action_log`

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | TEXT | Primary key |
| device_id | TEXT, FK ke `devices.id` | Sirine yang menerima perintah |
| level_at_trigger | ENUM `AlertLevel` | Level saat dipicu; hanya `ORANGE` atau `RED` |
| trigger_source | ENUM `digital`, `fisik`, `dibatalkan_otomatis` | Jalur aktivasi |
| triggered_by | TEXT, NULLABLE, FK ke `users.id` | Akun pemicu, hanya untuk jalur digital |
| triggered_from_ip | TEXT, NULLABLE | IP pemicu, hanya untuk jalur digital |
| triggered_at | TIMESTAMP | Waktu perintah diminta |
| executed_at | TIMESTAMP, NULLABLE | Waktu eksekusi dilaporkan |
| ack_status | ENUM `Diterima & Dieksekusi`, `Tidak Ada Respons`, `Menunggu` | Status eksekusi |
| cooldown_overridden | BOOLEAN | Trigger memotong cooldown karena eskalasi ke `RED` |

Kontrak API terkait berada di `planned_api/`.
