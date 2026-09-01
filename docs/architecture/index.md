# Architecture Document - SIGAP
## Panduan Folder

---

### 1. Tujuan Dokumen

Architecture Document menjelaskan **bentuk sistem SIGAP saat ini** secara utuh - building blocks, arsitektur data, keamanan, IoT, API, integrasi, dan deployment. Dokumen ini **tidak menduplikasi** isi Architecture Decision Record (ADR) di folder `architecture_decision_record/` - setiap bagian merujuk nomor ADR terkait untuk alasan dan alternatif yang dipertimbangkan. Bila ada perbedaan antara narasi di sini dengan ADR, ADR adalah rujukan yang berlaku (ADR bersifat historical record, dokumen ini adalah snapshot kondisi terkini yang mengikuti ADR).

Kerangka yang dipakai mengadaptasi pola **arc42/C4 Model** - standar umum untuk dokumentasi arsitektur perangkat lunak - disesuaikan dengan kebutuhan program (bukan diikuti kaku seluruh templatenya).

### 2. Struktur File

| File | Isi | ADR Terkait |
|---|---|---|
| `01_introduction_and_scope.md` | Tujuan sistem, stakeholder, System Context Diagram, batasan program | - |
| `02_building_block_view.md` | Component diagram internal, deskripsi tiap building block | ADR-016, ADR-021 |
| `03_data_architecture.md` | Ringkasan entity, ER diagram | ADR-001 - ADR-004 |
| `04_security_architecture.md` | Kategorisasi akses, RBAC, rate limiting | ADR-005 - ADR-010 |
| `05_iot_architecture.md` | Arsitektur hybrid sirine, sequence diagram, Device Gateway | ADR-011 - ADR-015 |
| `06_api_architecture.md` | Prinsip desain API, envelope, segmentasi | ADR-016 - ADR-021 |
| `07_integration_architecture.md` | Integrasi SIGAP↔SID | ADR-022 - ADR-025 |
| `08_deployment_view.md` | Topologi deployment (production/staging/perangkat lapangan) | - |
| `09_cross_cutting_concerns.md` | NFR lintas domain: fail-safe, performa, aksesibilitas | ADR-004, ADR-025 |
| `10_risks_and_open_issues.md` | Konsolidasi seluruh isu terbuka lintas dokumen | Seluruh domain |

### 3. Cara Membaca

Urutan file (01 → 10) mengikuti alur logis: mulai dari konteks besar (siapa pengguna, apa batasannya), turun ke building blocks, lalu ke tiap domain teknis (data, security, IoT, API, integrasi), lalu ke deployment, dan ditutup dengan cross-cutting concerns serta risiko. Tidak wajib dibaca berurutan - tiap file cukup mandiri untuk domain yang relevan.

### 4. Status

Dokumen ini mengikuti status ADR yang mendasarinya. Bagian yang merujuk ADR berstatus `yellow` (Integrasi SIGAP↔SID) ikut membawa catatan yang sama: bagian tersebut menggambarkan desain yang **diusulkan dari sisi SIGAP**, belum final lintas program.
