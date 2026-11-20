# Feature Spec - Fitur Berjalan

| | |
|---|---|
| Dokumen Terkait | `PRD.md`, `Rules_Alerts.md`, `api_spec/`, `architecture_data_and_schema/data_dictionary/` |
| Status | Aktif |

## Posisi Dokumen

Feature Spec (FS) adalah kontrak perilaku per fitur: apa yang harus benar dan bagaimana sistem berperilaku pada kondisi edge. Folder ini memuat fitur yang sudah berjalan. Fitur yang belum berjalan berada di `sigap-phase-2/`.

## Daftar Fitur

| ID | Fitur | File |
|---|---|---|
| FS-01 | Login dan Sesi | `01_login_sesi.md` |
| FS-02 | Catatan Tinjauan Alert | `02_verifikasi_validasi_alert.md` |
| FS-03 | Kelola Kontak Darurat | `03_kelola_kontak_darurat.md` |
| FS-04 | Kelola Titik Evakuasi | `04_kelola_titik_jalur_evakuasi.md` |
| FS-05 | Kelola Panduan Kesiapsiagaan | `05_kelola_panduan_kesiapsiagaan.md` |
| FS-10 | Manajemen Akun dan Role | `10_manajemen_akun_role.md` |
| FS-11 | Dashboard Admin | `11_dashboard_admin.md` |
| FS-13 | Peta Evakuasi Interaktif | `13_map_evakuasi.md` |

Bagian perangkat per unit pada FS-11 menunggu FS-06.

## Konvensi

- Fitur admin berada pada kategori akses Protected.
- Role disebut generik: `admin` dan `operator`.
- Skema data mengikuti `architecture_data_and_schema/data_dictionary/`.
