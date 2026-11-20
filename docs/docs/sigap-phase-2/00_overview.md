# Feature Spec - SIGAP Tahap 2

| | |
|---|---|
| Dokumen Terkait | `PRD.md`, `ROADMAP_TAHAP_2.md`, `planned_data_model.md`, `planned_api/` |
| Status | Aktif |

## Posisi Dokumen

Feature Spec (FS) adalah kontrak perilaku per fitur: apa yang harus benar dan bagaimana sistem berperilaku pada kondisi edge. Folder ini memuat fitur yang belum berjalan. Fitur yang sudah berjalan berada di `features/`. Status implementasi tiap fitur berada di `ROADMAP_TAHAP_2.md`. Kondisi sistem yang berjalan dicatat pada dokumen arsitektur dan kontrak API.

## Daftar Fitur

| ID | Fitur | File |
|---|---|---|
| FS-06 | Manajemen Perangkat IoT | `06_manajemen_perangkat_iot.md` |
| FS-07 | Riwayat Status Device | `07_riwayat_status_device.md` |
| FS-08 | Riwayat Aktivasi Sirine | `08_riwayat_aktivasi_sirine.md` |
| FS-09 | Trigger Sirine Remote | `09_trigger_sirine_remote.md` |
| FS-12 | Monitoring Integrasi SID | `12_monitoring_integrasi_sid.md` |

## Konvensi

- Fitur admin berada pada kategori akses Protected.
- Role disebut generik: `admin` dan `operator`.
- Skema data mengikuti `architecture_data_and_schema/data_dictionary/` untuk tabel yang berjalan dan `planned_data_model.md` untuk rancangan.
