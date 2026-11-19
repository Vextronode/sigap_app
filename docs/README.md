# Dokumentasi SIGAP

## 1. Jenis Dokumen

| Jenis | Isi | Dokumen |
|---|---|---|
| Kondisi aktual | Mencatat sistem yang berjalan | `Rules_Alerts.md`, `architecture/`, `api_spec/`, `architecture_data_and_schema/`, `security_and_access_control/`, `business/` |
| Spesifikasi fitur berjalan | Kontrak perilaku fitur yang sudah berjalan | `features/` |
| Kebutuhan produk | Cakupan dan status kebutuhan | `PRD.md` |
| Catatan keputusan | Alasan dan alternatif keputusan, termasuk yang menunggu implementasi | `architecture_decision_record/` |
| Rencana | Fitur dan rancangan yang belum berjalan | `sigap-phase-2/` |
| Pedoman kerja | Alur kerja tim dan desain | `GIT_WORKFLOW.md`, `Team Development Workflow.md`, `Environment Standardization.md`, `PANDUAN_DEVELOPMENT_ADMIN_SIGAP.md`, `DESIGN.md`, `DESIGN_ADMIN.md` |

## 2. Urutan Acuan

| Pertanyaan | Acuan |
|---|---|
| Apa yang sedang berjalan? | Kode, lalu dokumen kondisi aktual |
| Apa yang harus dibangun? | `PRD.md` |
| Bagaimana aturan level dan notifikasi? | `Rules_Alerts.md` |
| Mengapa sebuah keputusan diambil? | ADR |
| Bagaimana perilaku sebuah fitur? | `features/` |
| Apa yang direncanakan? | `sigap-phase-2/ROADMAP_TAHAP_2.md` |

Perubahan kode pada endpoint, skema, atau aturan alert disertai pembaruan dokumen kondisi aktual pada pull request yang sama.

## 3. Standar Penulisan

- Dokumen ditulis formal dan tanpa emoji.
- Dokumen kondisi aktual hanya mencatat keadaan yang berlaku, tanpa catatan revisi atau rencana.
- Alasan dan konteks keputusan ditulis pada ADR.
- Rencana ditulis pada `sigap-phase-2/`. Spesifikasi fitur yang sudah berjalan dipindahkan ke `features/`.
