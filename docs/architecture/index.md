# Architecture Document - SIGAP

## 1. Tujuan

Dokumen ini mencatat bentuk sistem SIGAP yang berjalan saat ini: building block, data, keamanan, IoT, API, integrasi, dan deployment. Alasan dan alternatif setiap keputusan berada di `architecture_decision_record/`. Kerangka dokumen mengadaptasi pola arc42 dan C4 Model.

## 2. Struktur File

| File | Isi | ADR Terkait |
|---|---|---|
| `01_introduction_and_scope.md` | Tujuan sistem, stakeholder, konteks sistem, batasan | ADR-031 |
| `02_building_block_view.md` | Komponen internal dan tanggung jawabnya | ADR-005, ADR-028 |
| `03_data_architecture.md` | Ringkasan entity dan ER diagram | ADR-001, ADR-002, ADR-003, ADR-030 |
| `04_security_architecture.md` | Kategori akses, RBAC, rate limiting, sesi | ADR-005, ADR-006, ADR-007, ADR-026, ADR-039 |
| `05_iot_architecture.md` | Device Gateway dan komunikasi perangkat | ADR-013, ADR-028 |
| `06_api_architecture.md` | Prinsip API dan pembagian domain | ADR-016, ADR-019, ADR-021, ADR-027 |
| `07_integration_architecture.md` | Integrasi eksternal | ADR-022, ADR-031, ADR-034 |
| `08_deployment_view.md` | Topologi deployment dan konfigurasi | ADR-038 |
| `09_cross_cutting_concerns.md` | Perilaku lintas domain | ADR-034, ADR-035 |
| `10_risks_and_open_issues.md` | Risiko dan isu terbuka | Seluruh domain |
