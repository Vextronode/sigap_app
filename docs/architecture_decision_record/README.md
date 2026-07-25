# Architecture Decision Record (ADR) - SIGAP
## Panduan Folder

---

### 1. Tujuan

Folder ini mencatat keputusan arsitektur yang telah diambil selama pengembangan SIGAP, beserta alasannya - memenuhi kewajiban Decision Log/ADR pada dokumen governance program (Konteks Umum Program: Dokumen Minimum yang Wajib Ada per Sistem).

Setiap ADR mengikuti struktur yang sama, sesuai panduan governance:

- **Latar Belakang Keputusan** - konteks yang memunculkan kebutuhan keputusan ini
- **Alternatif yang Dipertimbangkan** - opsi lain yang dievaluasi, termasuk yang tidak dipilih
- **Keputusan yang Dipilih**
- **Alasan Pemilihan**
- **Dampak Terhadap Sistem**

### 2. Konvensi Pengelompokan

ADR **dikelompokkan per domain dalam satu file**, bukan satu file per keputusan. Alasannya: banyak keputusan di domain yang sama saling berkaitan erat (mis. seluruh keputusan RBAC saling bergantung), dan membaca satu domain sebagai satu narasi utuh lebih mudah dibanding membuka puluhan file terpisah. Ini konsisten dengan pola segmentasi yang sama dipakai di `db/schema/`, `db/data-dictionary/`, dan `api/`.

Nomor ADR bersifat **sekuensial lintas file** (tidak reset per file) - ADR-001 dan ADR-025 sama-sama identifier unik program-wide, terlepas file mana yang memuatnya.

### 3. Daftar File

| File | Domain | Rentang ADR | Status |
|---|---|---|---|
| `ADR_data_architecture.md` | Arsitektur Data & Skema | ADR-001 – ADR-004 | light_green |
| `ADR_security_access_control.md` | Keamanan & Kontrol Akses | ADR-005 – ADR-010 | light_green |
| `ADR_iot_siren_architecture.md` | Arsitektur IoT & Sirine | ADR-011 – ADR-015 | light_green |
| `ADR_api_design.md` | Desain API | ADR-016 – ADR-021 | light_green |
| `ADR_sigap_sid_integration.md` | Integrasi Lintas Sistem (SIGAP ↔ SID) | ADR-022 – ADR-025 | yellow |

Status `yellow` pada domain integrasi SID menandai bahwa keputusan di dalamnya baru disetujui dari sisi SIGAP - masih menunggu sign-off Tim SID dan Architecture Working Group sebelum dianggap final lintas program.

### 4. Indeks Lengkap per Nomor

| ADR | Judul | File |
|---|---|---|
| ADR-001 | Primary Key Menggunakan UUID di Seluruh Tabel | `ADR_data_architecture.md` |
| ADR-002 | PostgreSQL Sebagai Database Engine | `ADR_data_architecture.md` |
| ADR-003 | Status Kesiapsiagaan Menggunakan 4 Level | `ADR_data_architecture.md` |
| ADR-004 | Fail-Safe pada Status Konektivitas Perangkat IoT | `ADR_data_architecture.md` |
| ADR-005 | Kategorisasi Akses Dua Tingkat (Public/Protected) | `ADR_security_access_control.md` |
| ADR-006 | RBAC Penuh Menggantikan Kolom Role Tunggal | `ADR_security_access_control.md` |
| ADR-007 | Seed Role Default - Admin dan Operator | `ADR_security_access_control.md` |
| ADR-008 | Algoritma Rate Limiting - Token Bucket | `ADR_security_access_control.md` |
| ADR-009 | Rate Limiting Diterapkan pada Dua Lapis | `ADR_security_access_control.md` |
| ADR-010 | Batas Rate Limit per Endpoint | `ADR_security_access_control.md` |
| ADR-011 | Safeguard Level Aktivasi Sirine - Hanya Oranye dan Merah | `ADR_iot_siren_architecture.md` |
| ADR-012 | Arsitektur Hybrid Aktivasi Sirine - Lokal Fisik dan Remote Aplikasi | `ADR_iot_siren_architecture.md` |
| ADR-013 | Protokol Komunikasi Platform ↔ Perangkat - REST Polling Langsung ke Backend | `ADR_iot_siren_architecture.md` |
| ADR-014 | Integrity Constraint pada Audit Trail Aktivasi Sirine | `ADR_iot_siren_architecture.md` |
| ADR-015 | Representasi Visual LED - Penggabungan Level Hijau dan Kuning | `ADR_iot_siren_architecture.md` |
| ADR-016 | Format OpenAPI 3.0 Sebagai Kontrak API | `ADR_api_design.md` |
| ADR-017 | Struktur Envelope Response Standar | `ADR_api_design.md` |
| ADR-018 | Model Data Alert Konsisten dengan `alert_log` | `ADR_api_design.md` |
| ADR-019 | Struktur URL Berbasis Kategori Akses, Bukan Path Versioning | `ADR_api_design.md` |
| ADR-020 | Penambahan Endpoint Agregasi Dashboard dan Domain Cuaca Granular | `ADR_api_design.md` |
| ADR-021 | Segmentasi Spesifikasi API per Domain | `ADR_api_design.md` |
| ADR-022 | Arah Integrasi - SIGAP sebagai Event Producer, SID sebagai Delivery Channel | `ADR_sigap_sid_integration.md` |
| ADR-023 | Deep-Link Notifikasi Selalu Mengarah ke Dashboard SIGAP | `ADR_sigap_sid_integration.md` |
| ADR-024 | Autentikasi Lintas Sistem - API Key Statis (Interim) | `ADR_sigap_sid_integration.md` |
| ADR-025 | Dashboard SIGAP dan Indikator Fisik Tetap Sumber Kebenaran Utama | `ADR_sigap_sid_integration.md` |

### 5. Menambah ADR Baru

1. Tentukan domain keputusan baru termasuk ke salah satu file yang sudah ada, atau memerlukan file domain baru.
2. Jika masuk domain yang sudah ada - tambahkan sebagai section baru (`## ADR-0XX: Judul`) di file tersebut, lanjutkan nomor secara sekuensial dari ADR tertinggi saat ini.
3. Jika domain baru - buat file baru mengikuti pola penamaan `ADR_<nama_domain>.md`, dengan Document Control table yang sama seperti file lain, dan update tabel di Bagian 3 dan 4 dokumen ini.
4. Nomor ADR **tidak pernah dipakai ulang** - jika sebuah keputusan direvisi total (bukan sekadar diperbarui), buat ADR baru yang secara eksplisit menyatakan menggantikan ADR sebelumnya (lihat ADR-013 sebagai contoh pola ini), daripada mengedit ADR lama.

### 6. Keterkaitan dengan Artefak Lain

ADR bukan dokumen yang berdiri sendiri - setiap keputusan di sini punya jejak konkret di artefak teknis:

| Domain ADR | Artefak Terkait |
|---|---|
| Arsitektur Data & Skema | `db/schema/`, `db/data-dictionary/` |
| Keamanan & Kontrol Akses | `api/components/shared.yaml`, `db/schema/006_rbac.sql` |
| Arsitektur IoT & Sirine | `db/schema/005_iot_kesiapsiagaan.sql`, dokumentasi hardware Tim IoT |
| Desain API | `api/openapi.yaml`, `api/paths/`, `api/components/` |
| Integrasi SIGAP ↔ SID | `integration/SID_INTEGRATION_PROPOSAL.md` |

Kalau sebuah artefak direvisi dengan cara yang bertentangan dengan ADR yang sudah tercatat, itu pertanda salah satu dari dua hal perlu terjadi: revisi artefak dibatalkan, atau ADR baru dibuat untuk mencatat perubahan keputusan secara eksplisit - bukan dibiarkan diam-diam tidak sinkron.
