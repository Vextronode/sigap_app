# Architecture Decision Record (ADR) - SIGAP

## 1. Tujuan

Folder ini mencatat keputusan arsitektur SIGAP beserta alasannya. Setiap ADR memuat:

- Latar Belakang Keputusan
- Alternatif yang Dipertimbangkan
- Keputusan yang Dipilih
- Alasan Pemilihan
- Dampak Terhadap Sistem

ADR adalah catatan historis. Kondisi yang berjalan dicatat pada dokumen arsitektur dan kontrak.

## 2. Konvensi

ADR dikelompokkan per domain dalam satu file. Nomor ADR sekuensial lintas file dan tidak pernah dipakai ulang.

## 3. Daftar File

| File | Domain | Rentang ADR |
|---|---|---|
| `ADR_data_architecture.md` | Arsitektur Data dan Skema | ADR-001, 002, 003, 004, 030 |
| `ADR_security_access_control.md` | Keamanan dan Kontrol Akses | ADR-005, 006, 007, 008, 009, 010, 026, 039 |
| `ADR_iot_siren_architecture.md` | Arsitektur IoT dan Sirine | ADR-011, 012, 013, 014, 015, 029 |
| `ADR_api_design.md` | Desain API | ADR-016, 017, 018, 019, 020, 021, 027, 028 |
| `ADR_sigap_sid_integration.md` | Integrasi SIGAP dan SID | ADR-022, 023, 024, 025 |
| `ADR_scope_and_alert_policy.md` | Cakupan Produk dan Kebijakan Alert | ADR-031, 032, 033, 034, 035, 036, 037, 038, 040, 041, 042, 043, 044, 045 |

Domain integrasi SID disetujui dari sisi SIGAP dan menunggu sign-off Tim SID serta Architecture Working Group.

## 4. Indeks

| ADR | Judul | Status | Digantikan Oleh |
|---|---|---|---|
| ADR-001 | Primary Key Menggunakan UUID di Seluruh Tabel | Berlaku | - |
| ADR-002 | PostgreSQL Sebagai Database Engine | Berlaku | - |
| ADR-003 | Status Kesiapsiagaan Menggunakan 4 Level | Berlaku sebagian | ADR-030 (nilai enum) |
| ADR-004 | Fail-Safe pada Status Konektivitas Perangkat IoT | Berlaku sebagian | ADR-030 (nilai enum) |
| ADR-005 | Kategorisasi Akses Dua Tingkat (Public/Protected) | Berlaku | - |
| ADR-006 | RBAC Penuh Menggantikan Kolom Role Tunggal | Berlaku | - |
| ADR-007 | Seed Role Default - Admin dan Operator | Berlaku sebagian | ADR-026 |
| ADR-008 | Algoritma Rate Limiting - Token Bucket | Digantikan | ADR-039 |
| ADR-009 | Rate Limiting Diterapkan pada Dua Lapis | Digantikan | ADR-039 |
| ADR-010 | Batas Rate Limit per Endpoint | Digantikan | ADR-039 |
| ADR-011 | Safeguard Level Aktivasi Sirine - Hanya Oranye dan Merah | Berlaku, belum diimplementasikan | - |
| ADR-012 | Arsitektur Hybrid Aktivasi Sirine | Berlaku, jalur aplikasi belum diimplementasikan | - |
| ADR-013 | Protokol Komunikasi Platform dan Perangkat - REST Polling | Berlaku | - |
| ADR-014 | Integrity Constraint pada Audit Trail Aktivasi Sirine | Berlaku, belum diimplementasikan | - |
| ADR-015 | Representasi Visual LED - Penggabungan Level Hijau dan Kuning | Berlaku | - |
| ADR-016 | Format OpenAPI 3.0 Sebagai Kontrak API | Berlaku | - |
| ADR-017 | Struktur Envelope Response Standar | Digantikan | ADR-027 |
| ADR-018 | Model Data Alert Konsisten dengan `alert_log` | Berlaku sebagai prinsip | - |
| ADR-019 | Struktur URL Berbasis Kategori Akses | Berlaku | - |
| ADR-020 | Endpoint Agregasi Dashboard dan Domain Cuaca Granular | Berlaku sebagian; endpoint agregasi tidak dibangun | - |
| ADR-021 | Segmentasi Spesifikasi API per Domain | Berlaku | - |
| ADR-022 | Arah Integrasi - SIGAP sebagai Event Producer | Usulan, belum diimplementasikan | - |
| ADR-023 | Deep-Link Notifikasi ke Dashboard SIGAP | Usulan, belum diimplementasikan | - |
| ADR-024 | Autentikasi Lintas Sistem - API Key Statis | Usulan, belum diimplementasikan | - |
| ADR-025 | Dashboard dan Indikator Fisik Sumber Kebenaran Utama | Berlaku | - |
| ADR-026 | Revisi Permission Operator - Menambahkan `content.manage` | Berlaku | - |
| ADR-027 | Reversal Envelope Response ke `{success, message, data}` | Berlaku | - |
| ADR-028 | Kategori Akses Ketiga - Device Gateway di Bawah Prefix Public | Berlaku; skema autentikasi menunggu ketetapan kontrak perangkat | - |
| ADR-029 | Granularitas `siren_action_log` - Satu Baris per Sirine | Berlaku, belum diimplementasikan | - |
| ADR-030 | Rekonsiliasi Nilai ENUM terhadap Implementasi | Berlaku | - |
| ADR-031 | Sumber Data Eksternal BMKG dan Open-Meteo | Berlaku | - |
| ADR-032 | Cakupan Evakuasi - Titik dan Navigasi Google Maps | Berlaku | - |
| ADR-033 | Data Historis dan Alert Cuaca Dipindahkan ke Roadmap | Berlaku | - |
| ADR-034 | Web Push Langsung ke Seluruh Subscriber | Berlaku | - |
| ADR-035 | Filter Relevansi 100 km dan 7 Hari, Masa Aktif Alert 24 Jam | Berlaku | - |
| ADR-036 | Review Ditolak Tidak Menurunkan Status Tsunami Resmi | Digantikan | ADR-041 |
| ADR-037 | Status UNKNOWN Saat Data Tidak Tersedia | Berlaku | - |
| ADR-038 | Hosting Staging di Server Organisasi | Berlaku | - |
| ADR-039 | Rate Limiting Sesuai Implementasi | Berlaku | - |
| ADR-040 | Level Akhir Mengambil yang Tertinggi antara Tsunami dan Gempa | Berlaku | - |
| ADR-041 | Review Alert Sebagai Catatan Pasca-Kejadian | Berlaku | - |
| ADR-042 | Estimasi Tsunami Mengikuti Masa Aktif Alert 24 Jam | Berlaku | - |
| ADR-043 | Status UNKNOWN Saat BMKG Tidak Dapat Dijangkau | Berlaku | - |
| ADR-044 | Respons Alert Publik Tanpa Data Peninjau dan Riwayat 30 Hari | Berlaku | - |
| ADR-045 | Masa Berlaku Alert Status Tsunami Resmi Mengikuti BMKG_TSUNAMI_STATUS | Berlaku | - |

## 5. Menambah ADR Baru

1. Tambahkan pada file domain yang sesuai, atau buat file baru `ADR_<nama_domain>.md`, lalu perbarui Bagian 3 dan 4.
2. Lanjutkan nomor dari ADR tertinggi.
3. Keputusan yang direvisi dicatat sebagai ADR baru yang menyatakan ADR mana yang digantikan. ADR lama tidak diedit.

## 6. Artefak Terkait

| Domain ADR | Artefak |
|---|---|
| Arsitektur Data dan Skema | `apps/backend/prisma/schema.prisma`, `architecture_data_and_schema/` |
| Keamanan dan Kontrol Akses | `security_and_access_control/ROUTE_ACCESS_DESIGN.md`, `apps/backend/src/middleware/` |
| Arsitektur IoT dan Sirine | `architecture/05_iot_architecture.md`, `sigap-phase-2/planned_data_model.md` |
| Desain API | `api_spec/` |
| Cakupan dan Kebijakan Alert | `PRD.md`, `Rules_Alerts.md` |
