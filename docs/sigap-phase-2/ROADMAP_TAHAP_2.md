# SIGAP - Rencana Pengembangan Tahap 2

| | |
|---|---|
| **Document Type** | Development Roadmap |
| **Status** | Aktif |
| **Version** | 2.0 |
| **Date** | 7 November 2026 |
| **Author** | Tech Lead, SIGAP |
| **Dokumen Terkait** | `PRD.md`, `architecture_decision_record/`, `planned_data_model.md`, `planned_api/` |

## 1. Status Area

| Area | Cakupan | Status |
|---|---|---|
| Area 1 - Data Contract | Forecast, gempa per wilayah, `preparedness_guides` | Selesai |
| Area 2 - Otomasi Notifikasi | Web Push otomatis dari scheduler | Selesai untuk Web Push (ADR-034) |
| Area 3 - Peta Evakuasi | Peta Leaflet, titik dari API, urutan terdekat, navigasi Google Maps | Selesai (ADR-032) |
| Area 4 - Integrasi SID | Notifikasi SIGAP ke SID dan pengumuman SID ke SIGAP | Belum dimulai; menunggu kontrak API SID |
| Area 5 - Admin-Side | Fitur pada Bagian 2 | Sebagian selesai |
| Area 6 - Data Historis dan Alert Cuaca | Bagian 3 | Belum dimulai |
| Area 7 - Perangkat dan Sirine | Manajemen perangkat, riwayat, trigger sirine | Belum dimulai; menunggu ketetapan kontrak perangkat |
| Area 8 - Ringkasan AI | Ringkasan cuaca dan gempa, rekomendasi aktivitas | Belum dimulai; kontrak di `planned_api/` |
| Area 9 - Pembaruan Real-Time | Bagian 4 | Belum dimulai |

## 2. Fitur Admin-Side

| ID | Fitur | Status | Area |
|---|---|---|---|
| FS-01 | Login dan Sesi | Berjalan | 5 |
| FS-02 | Verifikasi Alert | Berjalan | 5 |
| FS-03 | Kelola Kontak Darurat | Berjalan | 5 |
| FS-04 | Kelola Titik Evakuasi | Berjalan | 5 |
| FS-05 | Kelola Panduan Kesiapsiagaan | Berjalan | 5 |
| FS-06 | Manajemen Perangkat IoT | Belum | 7 |
| FS-07 | Riwayat Status Device | Belum | 7 |
| FS-08 | Riwayat Aktivasi Sirine | Belum | 7 |
| FS-09 | Trigger Sirine Remote | Belum | 7 |
| FS-10 | Manajemen Akun dan Role | Berjalan | 5 |
| FS-11 | Dashboard Admin | Berjalan; bagian perangkat per unit menunggu FS-06 | 5, 7 |
| FS-12 | Monitoring Integrasi SID | Belum | 4 |
| FS-13 | Peta Evakuasi Interaktif | Berjalan | 3 |

## 3. Area 6 - Data Historis dan Alert Cuaca

Area ini dipindahkan dari cakupan MVP (ADR-033).

### 3.1 Kondisi Awal

| Kebutuhan | Yang Sudah Ada | Yang Belum Ada |
|---|---|---|
| Riwayat gempa | Tabel `earthquake_records`, endpoint riwayat Pangandaran dan Jawa Barat | Grafik dan filter waktu |
| Riwayat alert | Tabel `alerts`, filter dan paginasi pada panel admin | Tampilan publik dengan filter waktu |
| Riwayat cuaca | Cuaca terkini dan prakiraan tanpa penyimpanan | Tabel, proses pengambilan berkala, endpoint, grafik |
| Alert cuaca | Decision Engine hanya mengevaluasi gempa dan tsunami | Sumber klasifikasi resmi dan aturan level |

### 3.2 Rancangan

1. **Penyimpanan cuaca.** Tabel `environmental_data` pada `planned_data_model.md`, diisi berkala dari BMKG dan Open-Meteo. Data seismik tetap memakai `earthquake_records`.
2. **Endpoint riwayat.** `GET /api/public/environmental-data` dengan filter jenis data, rentang waktu, dan paginasi.
3. **Tampilan.** Grafik riwayat cuaca dan gempa pada dashboard warga.
4. **Alert cuaca ekstrem, banjir, dan kekeringan.** Level diambil dari klasifikasi resmi BMKG, tanpa ambang yang dihitung SIGAP. Sumber klasifikasi per jenis bahaya ditetapkan sebelum pengerjaan dimulai. Open-Meteo tidak dipakai sebagai dasar level.
5. **Retensi.** Masa simpan data ditetapkan bersama pengelola server, mengikuti kapasitas database staging.

### 3.3 Urutan

| Tahap | Pekerjaan | Prasyarat |
|---|---|---|
| 1 | Penyimpanan cuaca dan endpoint riwayat | - |
| 2 | Grafik riwayat | Tahap 1 |
| 3 | Penetapan sumber klasifikasi alert cuaca | - |
| 4 | Aturan alert cuaca pada Decision Engine dan `Rules_Alerts.md` | Tahap 3 |

## 4. Area 9 - Pembaruan Real-Time

Dashboard saat ini memakai polling (`architecture/09_cross_cutting_concerns.md`). Server-Sent Events direncanakan untuk komunikasi backend ke dashboard karena kebutuhannya satu arah.

| Prasyarat | Keterangan |
|---|---|
| Reverse proxy | `proxy_buffering off` dan penyesuaian timeout pada server staging |
| Event internal | Scheduler menerbitkan event setelah menyimpan alert |
| Heartbeat | Mencegah koneksi idle diputus infrastruktur |
| Resync | Mengambil ulang data saat koneksi tersambung kembali |
| Fallback | Kembali ke polling saat koneksi SSE gagal |
| Batas koneksi | Jumlah koneksi bersamaan ditetapkan sebagai NFR |

## 5. Urutan Pengerjaan

| Urutan | Pekerjaan |
|---|---|
| 1 | Implementasi ADR-036 dan ADR-037 |
| 2 | Area 4 - Integrasi SID |
| 3 | Area 7 - Perangkat dan Sirine, setelah kontrak perangkat ditetapkan |
| 4 | Area 8 - Ringkasan AI |
| 5 | Area 6 - Data Historis dan Alert Cuaca |
| 6 | Area 9 - Pembaruan Real-Time |

## 6. Isu Terbuka

| Isu | Area | Pemilik |
|---|---|---|
| Kontrak perangkat: autentikasi, endpoint, interval | 7 | Tech Lead |
| Kontrak API SID | 4 | Tech Lead SIGAP dan SID |
| Sumber klasifikasi alert cuaca | 6 | Tech Lead |
| Hosting production | 9 | Tim DevOps |
