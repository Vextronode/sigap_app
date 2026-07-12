# Data Dictionary - Domain: Data Lingkungan & Alert

## Entity: `environmental_data`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | - |
| source | VARCHAR(30) | Sumber data: `BMKG` / `USGS` / `OpenWeatherMap` | `"BMKG"` |
| type | VARCHAR(30) | Jenis data | `"curah_hujan"`, `"seismik"` |
| value | NUMERIC | Nilai terukur | `45.2` |
| unit | VARCHAR(20) | Satuan | `"mm"`, `"magnitude"` |
| recorded_at | TIMESTAMPTZ | Waktu data tercatat di sumber | `2026-07-09T08:00:00Z` |

## Entity: `alert_log`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | - |
| alert_type | VARCHAR(30) | Kategori: banjir/kekeringan/cuaca_ekstrem/seismik | `"banjir"` |
| severity | ENUM `status_level` | Level: hijau/kuning/oranye/merah (lihat index.md 4) | `"oranye"` |
| message | TEXT | Pesan alert | `"Curah hujan tinggi terdeteksi"` |
| source_rule | VARCHAR(100) | Rule yang memicu (traceability) | `"rule_curah_hujan_threshold_1"` |
| triggered_at | TIMESTAMPTZ | Waktu alert dibuat | `2026-07-09T08:05:00Z` |
