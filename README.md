# SIGAP - Sistem Informasi & Kesiapsiagaan Bencana Desa Cibenda

Platform monitoring lingkungan (cuaca, seismik, potensi tsunami) dan kesiapsiagaan bencana untuk Desa Cibenda, Kecamatan Parigi, Kabupaten Pangandaran. SIGAP mengolah data resmi dari **BMKG**, **USGS**, dan **OpenWeatherMap** menjadi informasi yang sederhana dan actionable, dilengkapi informasi kesiapsiagaan (jalur evakuasi, titik kumpul, kontak darurat), serta meneruskan level kesiapsiagaan ke perangkat indikator fisik (IoT) di titik strategis desa.

> Dokumen produk lengkap: lihat [`PRD.md`](./docs/business/PRD.md)

---

## Status Program

| Info | Detail |
|---|---|
| Versi PRD acuan | 4.0 |
| Status | Draft - Aktif (beberapa bagian masih *TBD*, lihat [Isu Governance Terbuka](./docs/business/PRD.md#71-isu-governance-terbuka)) |
| Positioning | Platform monitoring lingkungan & kesiapsiagaan bencana. **Bukan** sistem prediksi/deteksi bencana mandiri. |
| Role dalam ekosistem program | Supporting intelligence / early warning domain (independen dari SID dan Cibenda Mart, disiapkan untuk interoperabilitas API di fase berikutnya) |

SIGAP dikembangkan sebagai bagian dari program capstone multi-sistem (bersama **SID** dan **Cibenda Mart**) dengan arsitektur independen per sistem - domain, database, dan deployment terpisah - namun mengikuti standar lintas sistem (ID convention, API style, auth pattern, logging, naming) yang disepakati di tingkat program.

---

## Tech Stack

| Layer | Pilihan | Status |
|---|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS | Final |
| Backend | Node.js (REST API), struktur modular sesuai AWG Convention | Final |
| Database | PostgreSQL | Final |
| Maps | Leaflet + OpenStreetMap | Final |
| AI | Peringkasan cuaca/gempa & rekomendasi sederhana (bukan untuk prediksi bencana) | Final (fungsi) / Fallback plan masih *Draft* |
| Komunikasi Platform ↔ IoT | REST Polling backend | Final |
| Hosting produksi | Server desa (arah program) | **TBD** - menunggu konfirmasi Tim DevOps |

## External APIs

| Sumber | Kegunaan | Status |
|---|---|---|
| BMKG | Cuaca, prakiraan, info bencana, potensi tsunami | Wajib |
| USGS | Data seismik | Wajib |
| OpenWeatherMap | Cuaca real-time, komplementer BMKG | Should |
| OpenStreetMap | Lokasi desa, jalur & titik evakuasi | Wajib |
| AI API | Ringkasan cuaca/gempa & rekomendasi sederhana | Wajib |

---

## Fitur Utama (In Scope MVP)

- **Monitoring Lingkungan** - dashboard cuaca, seismik, potensi tsunami, data historis (grafik & filter waktu), alert berbasis rule, riwayat alert.
- **Kesiapsiagaan Bencana** - jalur & titik evakuasi (peta), kontak darurat, panduan gempa & tsunami.
- **Decision Support** - ringkasan kondisi cuaca/gempa berbasis AI, rekomendasi aktivitas.
- **Dashboard Admin** - kelola pengumuman, kontak darurat, titik & jalur evakuasi (permission matrix: role `admin`/`operator`, lihat `DD_rbac.md`).
- **Fondasi Platform** - autentikasi berbasis kategori akses (Public/Protected), REST API v1 sebagai kontrak stabil untuk konsumen eksternal (Village Dashboard).
- **Kesiapsiagaan Fisik - IoT Indikator & Sirine** *(baru sejak v4.0)*:
  - Indikator visual 3-level (Hijau/Waspada, Kuning/Siaga, Merah/Awas) di titik strategis desa.
  - Aktivasi sirine **selalu human-triggered** oleh operator terlatih - sistem tidak pernah mengaktifkan sirine secara otomatis.
  - Safeguard: level Hijau tidak dapat memicu sirine.
  - Fail-safe: kehilangan koneksi perangkat menghasilkan status yang jelas berbeda dari "aman".
  - Detail arsitektur perangkat: lihat [`05_iot_architecture.md`](./docs/architecture/05_iot_architecture.md).

### Out of Scope (MVP)

- Prediksi gempa/tsunami mandiri.
- Sistem Early Warning mandiri di luar rule-based threshold (indikator fisik tetap murni meneruskan rule yang sama dengan dashboard).
- Integrasi sensor IoT sebagai **sumber data** (roadmap, menunggu validasi problem owner).
- Machine Learning di luar penggunaan AI API untuk peringkasan teks.
- Chatbot AI, aplikasi mobile native, login warga, forum diskusi, sistem pelaporan warga, live tracking evakuasi.
- Notifikasi WhatsApp untuk warga.

Detail lengkap ada di [`PRD.md`](./docs/business/PRD.md).

---

## Arsitektur Singkat

```
                  BMKG / USGS / OpenWeatherMap / OSM / AI API
                                   │
                                   ▼
                     Backend SIGAP (Node.js REST API)
                                   │
                        ┌──────────┴──────────┐
                        ▼                     ▼
                 PostgreSQL DB        Perangkat IoT (ESP32-C3)
                                       │ HTTP Polling 15s
                                       │ Heartbeat 60s
                                       ▼
                          Perangkat 1: Indikator & Kontrol
                          (LED, Buzzer, Tombol darurat)
                                       │ ESP-NOW (Channel 10)
                                       ▼
                          Perangkat 2: Sirine Jarak Jauh
                                   │
                                   ▼
                     Frontend (React + Vite + Tailwind)
                     Dashboard publik & Dashboard Admin
```

Detail komunikasi IoT (protokol, parameter, troubleshooting) ada di [`Dokumentasi_Sistem_IoT_SIGAP.md`](./Dokumentasi_Sistem_IoT_SIGAP.md).

> Catatan: Struktur data lengkap (skema, constraint, relasi) adalah tanggung jawab **Data Dictionary (Gate G2)** dan **Database Schema Final (Gate G3)**

---

## Getting Started

> Bagian ini adalah kerangka standar berdasarkan tech stack di atas. Sesuaikan dengan struktur folder & script aktual repo begitu tersedia (mis. jika menggunakan monorepo `frontend/` + `backend/`, update path di bawah).

### Prasyarat

- Node.js (LTS terbaru)
- PostgreSQL
- npm
- API key untuk: OpenWeatherMap, AI API (BMKG & USGS umumnya tidak memerlukan key untuk endpoint publik - cek dokumentasi masing-masing)

### Instalasi

```bash
git clone <repo-url>
cd sigap

# Backend
cd backend
npm install
cp .env.example .env   # isi kredensial DB & API key eksternal
npm run migrate        # jika menggunakan migration tool
npm run dev

# Frontend (di terminal terpisah)
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Environment Variables (indikatif)

```
DATABASE_URL=
BMKG_API_URL=
USGS_API_URL=
OPENWEATHERMAP_API_KEY=
AI_API_KEY=
AI_API_FALLBACK_ENABLED=      # lihat PRD 5.1, masih Draft
IOT_DEVICE_AUTH_SECRET=       # lihat PRD 5.5, mekanisme TBD di G3
```

> ⚠️ Kredensial pihak ketiga **tidak boleh** terekspos di sisi klien (lihat NFR Security, `PRD.md  5.2`).

---

## Governance & Alur Kontribusi

Mengikuti quality flow standar program:

```
Developer → Internal Review → Tech Lead Review → QA Validation → Merge
```

Setiap task wajib memiliki **PIC**, **Reviewer**, **Deadline**, dan **Definition of Done**. Backlog & estimasi (Story Point, prioritas MoSCoW) dikelola di **SIGAP Backlog Jira-Ready v2**, tidak diduplikasi di repo ini.

## Roadmap & Gate Mapping

| Gate | Deliverable |
|---|---|
| G2 | Business Workflow, Use Case Diagram, DFD, Data Dictionary |
| G3 | Architecture Document, API Specification, ADR, Deployment Strategy |
| G4–G7 | Development, UAT, Deployment |

## Dokumentasi Terkait

- [`PRD.md`](./PRD.md) - Product Requirement Document (acuan tunggal level produk)
- [`Dokumentasi_Sistem_IoT_SIGAP.md`](./Dokumentasi_Sistem_IoT_SIGAP.md) - arsitektur & protokol perangkat IoT
- `SIGAP_Backlog_Jira_Ready_v2.xlsx` - backlog, Story Point, sprint plan
- `integration/SID_INTEGRATION_PROPOSAL.md` - proposal integrasi notifikasi operator via SID *(referensi PRD 7.1, status Draft)*

## Isu Terbuka yang Perlu Diperhatikan Kontributor

- Hosting produksi masih **TBD** (menunggu Tim DevOps).
- Fallback AI API masih **Draft**, perlu konfirmasi PM sebelum masuk backlog final.
- Mekanisme konfirmasi tambahan sebelum aktivasi sirine level Merah (mitigasi human-factor) masih **TBD**.
- Backlog (9 PRD) belum mencakup beban kerja scope IoT indikator+sirine - akan direvisi.

Lihat tabel lengkap di [`PRD.md  7.1`](./PRD.md).

---

## Lisensi

Luaran program dapat diajukan sebagai luaran institusi sesuai ketentuan program capstone yang berlaku. *(Sesuaikan dengan lisensi resmi repo bila sudah ditentukan.)*