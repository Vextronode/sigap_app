# Data Dictionary - Domain: Data Lingkungan & Alert

> **Catatan:** entity `alerts` di bawah **sudah live** di database, dengan struktur yang berbeda signifikan dari versi dokumen sebelumnya (`alert_log`) - lihat riwayat revisi di `004_environmental.sql`. `environmental_data` masih murni desain, belum ada di database nyata.

## Entity: `environmental_data` *(desain, belum live)*

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | - |
| source | VARCHAR(30) | Sumber data: `BMKG` / `USGS` / `OpenWeatherMap` | `"BMKG"` |
| type | VARCHAR(30) | Jenis data | `"curah_hujan"`, `"seismik"` |
| value | NUMERIC | Nilai terukur | `45.2` |
| unit | VARCHAR(20) | Satuan | `"mm"`, `"magnitude"` |
| recorded_at | TIMESTAMPTZ | Waktu data tercatat di sumber | `2026-07-09T08:00:00Z` |

## Entity: `alerts` *(live - koreksi total dari `alert_log`)*

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | - |
| level | ENUM `AlertLevel` | GREEN/YELLOW/ORANGE/RED - **bukan** `status_level` Indonesia | `"YELLOW"` |
| source | VARCHAR(100) | Asal/provenance data, jujur soal sumbernya (lihat catatan) | `"BMKG"`, `"BMKG (estimasi dari data gempa)"` |
| description | TEXT, NULLABLE | Deskripsi/pesan alert | `"Curah hujan tinggi terdeteksi"` |
| review_status | ENUM `alert_review_status` | Klasifikasi administratif FS-02 - **tidak** menggerbang visibilitas publik maupun trigger sirine | `"Dikonfirmasi"` |
| reviewed_by | UUID (FK → users.id), NULLABLE | Siapa yang mengklasifikasikan | - |
| reviewed_at | TIMESTAMPTZ, NULLABLE | Kapan diklasifikasikan | - |
| created_at / updated_at | TIMESTAMPTZ | Audit standar | - |

**Field yang DIHAPUS dari versi sebelumnya** (tidak ada padanannya di database nyata): `alert_type`, `source_rule`, `triggered_at` (digantikan `created_at`), `validated_by`/`validated_at` (digantikan `reviewed_by`/`reviewed_at` + `review_status`).

**Catatan provenance (`source`):** field ini WAJIB jujur soal asal data - nilai `"BMKG (estimasi dari data gempa)"` menandakan hasil estimasi internal SIGAP (bukan status resmi InaTEWS), sesuai prinsip yang sudah ditegakkan di logika tsunami status (lihat catatan terkait di dokumen API_SPEC.md).