# Feature Spec - Admin Side (SIGAP Tahap 2)

| | |
|---|---|
| Dokumen Terkait | PRD SIGAP v4.0 · ROADMAP_TAHAP_2.md · ADR-001 s.d. ADR-025 · DD_rbac.md |
| Cakupan | 12 fitur admin-side, Bagian 5 Roadmap Tahap 2 |
| Status | Draft - Aktif |

## Posisi Dokumen Ini

Ini **bukan PRD** dan **bukan tiket Jira**. PRD (lihat PRD.md Executive Summary) secara sengaja tidak memuat detail implementasi untuk menghindari duplikasi dengan G2/G3. Tiket Jira nanti berisi breakdown kerja + estimasi SP, bukan kontrak perilaku fitur.

Dokumen FS (Feature Spec) ini mengisi celah di antara keduanya: **kontrak perilaku per fitur** - apa yang harus benar, bagaimana sistem berperilaku di kondisi edge - supaya developer bisa membangun tanpa menebak, dan reviewer/QA punya acuan validasi. Tiket Jira per fitur sebaiknya mereferensikan file FS terkait, bukan menduplikasi isinya.

Beberapa fitur di sumber dokumen (PRD/Roadmap) belum dirinci sampai level perilaku - di file tersebut, bagian yang tidak bisa dipastikan dari dokumen sumber ditandai **"Perlu Klarifikasi"**, bukan diasumsikan.

## Daftar Fitur

| ID | Fitur | Area Roadmap | Bergantung Pada | Status |
|---|---|---|---|---|
| FS-01 | Login & Sesi | Area 5 | Area 1 | Ready to develop |
| FS-02 | Verifikasi & Validasi Alert | Area 5 | Area 1, Area 2 | Ready to develop |
| FS-03 | Kelola Kontak Darurat | Area 5 | Area 1 | Ready to develop |
| FS-04 | Kelola Titik & Jalur Evakuasi | Area 5 | Area 1, Area 3 | Ready to develop |
| FS-05 | Kelola Panduan Kesiapsiagaan | Area 5 | Area 1 | Ready to develop |
| FS-06 | Manajemen Perangkat IoT | Area 5 | Area 1 | Draft |
| FS-07 | Riwayat Status Device | Area 5 | Area 1, FS-06 | Draft |
| FS-08 | Riwayat Aktivasi Sirine | Area 5 | Area 1, FS-09 | Draft |
| FS-09 | Trigger Sirine Remote | Area 5 | ADR-012, FS-06 | Draft |
| FS-10 | Manajemen Akun & Role | Area 5 | Area 1, DD_rbac.md | Ready to develop |
| FS-11 | Dashboard Admin (ringkasan statistik) | Area 5 | FS-02, FS-06, FS-12 | Ready to develop |
| FS-12 | Monitoring Integrasi SID | Area 5 | Area 4 | Draft |

Catatan: "Kelola Pengumuman" (item #3 asli di Roadmap Bagian 5) tidak masuk daftar - dicoret dari cakupan karena sumber data pindah ke SID (lihat Roadmap S2.1 #3-4).

## Konvensi

- Semua fitur di sini berada di kategori akses **Protected** (butuh login, lihat FS-01).
- Role disebut generik: `admin` / `operator`. Jangan sebut nama/individu spesifik pada dokumen turunan mana pun (prinsip program, lihat Konteks Umum Program).
- Skema data yang dirujuk mengikuti PRD.md S7 (Data Model) - field-level detail lengkap tetap tanggung jawab Data Dictionary (G2), tidak diduplikasi di sini kecuali relevan langsung dengan AC.
- Urutan pengerjaan mengikuti Timeline Roadmap Tahap 2 S6 (Area 1 fondasi, Area 3/4/5 paralel setelahnya).
