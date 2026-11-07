# Feature Spec - SIGAP Tahap 2

| | |
|---|---|
| Dokumen Terkait | `PRD.md`, `ROADMAP_TAHAP_2.md`, `planned_data_model.md`, `planned_api/` |
| Status | Aktif |

## Posisi Dokumen

Feature Spec (FS) adalah kontrak perilaku per fitur: apa yang harus benar dan bagaimana sistem berperilaku pada kondisi edge. Status implementasi tiap fitur berada di `ROADMAP_TAHAP_2.md`. Kondisi sistem yang berjalan dicatat pada dokumen arsitektur dan kontrak API.

## Daftar Fitur

| ID | Fitur | File |
|---|---|---|
| FS-01 | Login dan Sesi | `01_login_sesi.md` |
| FS-02 | Catatan Tinjauan Alert | `02_verifikasi_validasi_alert.md` |
| FS-03 | Kelola Kontak Darurat | `03_kelola_kontak_darurat.md` |
| FS-04 | Kelola Titik Evakuasi | `04_kelola_titik_jalur_evakuasi.md` |
| FS-05 | Kelola Panduan Kesiapsiagaan | `05_kelola_panduan_kesiapsiagaan.md` |
| FS-06 | Manajemen Perangkat IoT | `06_manajemen_perangkat_iot.md` |
| FS-07 | Riwayat Status Device | `07_riwayat_status_device.md` |
| FS-08 | Riwayat Aktivasi Sirine | `08_riwayat_aktivasi_sirine.md` |
| FS-09 | Trigger Sirine Remote | `09_trigger_sirine_remote.md` |
| FS-10 | Manajemen Akun dan Role | `10_manajemen_akun_role.md` |
| FS-11 | Dashboard Admin | `11_dashboard_admin.md` |
| FS-12 | Monitoring Integrasi SID | `12_monitoring_integrasi_sid.md` |
| FS-13 | Peta Evakuasi Interaktif | `13_map_evakuasi.md` |

## Konvensi

- Fitur admin berada pada kategori akses Protected.
- Role disebut generik: `admin` dan `operator`.
- Skema data mengikuti `architecture_data_and_schema/data_dictionary/` untuk tabel yang berjalan dan `planned_data_model.md` untuk rancangan.
