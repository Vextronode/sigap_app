# Product Requirement Document - SIGAP
### Sistem Informasi & Kesiapsiagaan Bencana Desa Cibenda

---

## Document Control

| Field | Detail |
|---|---|
| Versi | 4.0 |
| Tanggal | 09 Juli 2026 |
| Status | **Draft - Aktif** (lihat catatan status per bagian; belum seluruhnya final) |
| Pemilik Dokumen | Tech Lead SIGAP |
| Dokumen Terkait | Program Gate Guide (G1–G7) · G2 Business Workflow/DFD/Data Dictionary |
| Menggantikan | PRD v3.0 (06/07/2026) |

### Riwayat Revisi

| Versi | Tanggal | Perubahan Utama |
|---|---|---|
| 1.0 | 05/07/2026 | Draft awal oleh tim (fokus tunggal disaster-info) |
| 2.0 | 06/07/2026 | Digabung dengan main context program; scope monitoring lingkungan dikembalikan; Epic 5 (kesiapsiagaan bencana) ditambahkan |
| 3.0 | 06/07/2026 | Menambahkan Success Metrics, Non-Functional Requirements (level kebutuhan), perbaikan konsistensi Data Model, referensi eksplisit basis estimasi; format disesuaikan ke standar dokumen industri |
| 4.0 | 09/07/2026 | Menambahkan scope IoT sebagai penerima/aktuator (indikator level fisik 3-warna + tombol sirine human-triggered) hasil klarifikasi Tech Lead. Menegaskan IoT sebagai sumber data/sensor lapangan tetap Out of Scope (tidak berubah). Menambahkan isu governance baru: protokol komunikasi platform↔device, jalur tombol sirine, dan notifikasi operator (berpotensi berbenturan dengan larangan notifikasi WhatsApp yang sudah ada di 3.2). Memperbarui Data Model, NFR Security, dan Isu Governance Terbuka. |

## Executive Summary

SIGAP adalah platform web yang mengintegrasikan informasi monitoring lingkungan (cuaca, seismik, potensi tsunami) dari sumber resmi (BMKG, USGS, OpenWeatherMap) dengan informasi kesiapsiagaan bencana (jalur evakuasi, titik kumpul, kontak darurat) untuk Desa Cibenda, Kabupaten Pangandaran. Sejak v4.0, platform juga meneruskan level kesiapsiagaan ke **perangkat indikator fisik** (lampu Hijau/Kuning/Merah) di titik strategis desa, dengan aktivasi sirine yang tetap **dikendalikan manual oleh operator terlatih** - sistem tidak pernah mengaktifkan sirine secara otomatis. Dokumen ini adalah acuan tunggal level produk sebelum tim masuk ke gate perencanaan teknis berikutnya (G2: Business Workflow, Use Case, DFD, Data Dictionary; G3: Architecture Document, API Specification, ADR, Deployment Strategy).

Dokumen ini secara sengaja **tidak** memuat detail yang menjadi tanggung jawab deliverable G2/G3 (skema data lengkap, arsitektur teknis, keputusan implementasi) untuk menghindari duplikasi kerja bagian yang relevan merujuk eksplisit ke dokumen tersebut.

---

## 1. Project Overview

### 1.1 Produk

SIGAP adalah platform monitoring lingkungan & kesiapsiagaan bencana berbasis web untuk Desa Cibenda, Kecamatan Parigi, Kabupaten Pangandaran, yang mengolah data resmi BMKG, USGS, dan OpenWeatherMap menjadi informasi yang sederhana dan actionable, dilengkapi informasi kesiapsiagaan (jalur evakuasi, titik kumpul, kontak darurat) dalam satu antarmuka.

### 1.2 Latar Belakang

Desa Cibenda adalah wilayah pesisir dengan eksposur risiko gempa bumi, tsunami, cuaca ekstrem, dan banjir. Informasi resmi sudah tersedia melalui BMKG dan USGS, namun tersebar lintas platform, tidak berfokus pada level desa, dan tidak terhubung dengan informasi kesiapsiagaan operasional.

### 1.3 Problem Statement

Warga Desa Cibenda kesulitan memperoleh informasi lingkungan dan kebencanaan yang spesifik untuk wilayah mereka, karena data tersebar, belum terpusat, dan tidak disertai panduan kesiapsiagaan yang terhubung langsung dengan kondisi terkini.

### 1.4 Tujuan Produk

1. Menyediakan dashboard monitoring lingkungan (cuaca, seismik, tsunami) yang berfokus pada Desa Cibenda, lengkap dengan data historis.
2. Menyampaikan informasi bencana dari sumber data resmi tanpa melakukan prediksi mandiri.
3. Membantu masyarakat memahami kondisi lingkungan melalui ringkasan berbasis AI.
4. Menyediakan informasi kesiapsiagaan yang terhubung dengan kondisi lingkungan terkini.
5. Menyiapkan fondasi API bagi integrasi lintas sistem program (Village Dashboard) pada fase berikutnya.
6. **(Baru, v4.0)** Meneruskan level kesiapsiagaan ke perangkat indikator fisik di titik strategis desa sebagai lapisan peringatan tambahan yang tidak bergantung pada warga membuka dashboard, dengan aktivasi sirine tetap berbasis keputusan operator terlatih (human-in-the-loop), bukan otomatis oleh sistem.

### 1.5 Target Pengguna

| Segmen | Deskripsi |
|---|---|
| **Primary** | Warga Desa Cibenda, nelayan, petani, wisatawan (opsional) |
| **Secondary (Admin)** *Draft* | Kandidat: Kepala Desa, Perangkat Desa, Relawan Desa, BPBD (opsional), Pemerintah Daerah (opsional). *Permission matrix aktual pada Bagian 7.* |

### 1.6 Value Proposition

Mengintegrasikan monitoring lingkungan resmi dengan informasi kesiapsiagaan bencana dalam satu dashboard sederhana, membantu masyarakat mengambil keputusan lebih cepat dan lebih siap menghadapi risiko bencana.

---

## 2. Success Metrics *Draft*

> **Perbaikan v3.** Target di bawah adalah **kriteria level produk**, bukan SLA teknis presisi (SLA teknis mis. target latency spesifik didefinisikan di Architecture Document G3 berdasarkan constraint yang ditetapkan di Bagian 5).

### 2.1 Kriteria Keberhasilan MVP

| Area | Target | Metode Verifikasi |
|---|---|---|
| Adopsi kesiapsiagaan | Minimal 70% peserta uji coba (UAT warga) dapat menemukan jalur evakuasi terdekat tanpa bantuan admin dalam < 2 menit | Skenario UAT terstruktur |
| Keterandalan informasi | Data cuaca/seismik yang ditampilkan konsisten dengan sumber resmi (BMKG/USGS) pada sampling acak selama masa pilot | Spot-check manual mingguan selama pilot |
| Adopsi operasional | Admin (perangkat desa yang ditunjuk) menggunakan dashboard admin minimal 1x/minggu selama masa pilot (4 minggu pasca-deployment) | Log aktivitas sistem |
| Penerimaan mitra | Sign-off UAT diperoleh dari mitra desa pada Checkpoint 4 tanpa temuan blocking issue | Berita acara UAT |
| Aksesibilitas informasi | Warga dengan literasi digital terbatas (termasuk lansia, dalam sesi uji terbatas) dapat memahami status kesiapsiagaan tanpa penjelasan tambahan | Sesi uji kualitatif dengan minimal 3 responden non-teknis |

### 2.2 Definisi "Berhasil" untuk Program Capstone

MVP dianggap berhasil jika seluruh kriteria di atas tercapai **dan** sistem telah melalui serah terima operasional ke mitra desa (Gate G7) tanpa isu keamanan/data kritis yang belum ditangani.

---

## 3. Product Scope

### 3.1 In Scope (MVP)

**Monitoring Lingkungan**
- Monitoring cuaca (BMKG, OpenWeatherMap)
- Monitoring aktivitas seismik (USGS)
- Informasi potensi tsunami
- Data historis lingkungan (grafik, filter waktu)
- Sistem alert berbasis rule (banjir, kekeringan, cuaca ekstrem)
- Riwayat/log alert

**Kesiapsiagaan Bencana**
- Jalur evakuasi & titik evakuasi (peta)
- Kontak darurat
- Panduan menghadapi gempa & tsunami

**Decision Support**
- Ringkasan kondisi cuaca & gempa berbasis AI
- Rekomendasi aktivitas berdasarkan kondisi cuaca

**Dashboard Admin**
- Pengelolaan pengumuman, kontak darurat, titik & jalur evakuasi
- Hak akses per role *TBD*

**Fondasi Platform**
- Autentikasi berbasis kategori akses (Public/Protected)
- REST API v1 sebagai kontrak stabil untuk konsumen eksternal (Village Dashboard)

**Kesiapsiagaan Fisik - IoT Indikator & Sirine**
- Perangkat indikator visual 3-level (Hijau/Waspada, Kuning/Siaga, Merah/Awas) terpasang di titik strategis desa, menampilkan level yang diteruskan oleh platform berdasarkan rule threshold yang sama dengan alert dashboard.
- Mekanisme aktivasi sirine yang **dikendalikan manual oleh operator terlatih** (human-confirmed action) - bukan aktivasi otomatis oleh sistem.
- **Safeguard by design:** level Hijau tidak dapat memicu sirine; hanya level Kuning/Merah yang membuka opsi aktivasi, dengan kategori bunyi berbeda per level.
- Perilaku fail-safe saat perangkat kehilangan koneksi ke platform: indikator masuk ke mode terpisah yang jelas berbeda dari Hijau (tidak boleh disalahartikan sebagai "aman"). *Status: Final (diputuskan 09/07/2026).*
- Status: **prototipe perangkat sudah ada, tahap finishing** - bukan riset dari nol.
- Catatan batasan: ini **bukan** "Sistem Early Warning mandiri" yang disebut Out of Scope di bawah - sistem tetap murni meneruskan level rule-based yang sama dengan alert dashboard, tidak melakukan deteksi/prediksi mandiri di level device.

### 3.2 Out of Scope (MVP)

- Prediksi gempa bumi/tsunami mandiri
- Sistem Early Warning mandiri (di luar rule-based threshold) - *catatan: indikator fisik pada bagian In Scope di atas bukan pengecualian dari batasan ini, karena tetap berbasis rule threshold yang sama, bukan logika deteksi/prediksi terpisah di device*
- Integrasi sensor IoT **sebagai sumber data** (pembacaan sensor lapangan: kelembaban tanah, dsb.) - **status: tetap roadmap**, menunggu validasi problem owner dan finalisasi arsitektur node. *(Tidak berubah dari v3.0 - lihat catatan pembeda dengan IoT-sebagai-aktuator di atas.)*
- Machine Learning (di luar penggunaan AI API untuk peringkasan teks)
- Chatbot AI, aplikasi mobile native, login warga, forum diskusi, sistem pelaporan warga, live tracking kendaraan evakuasi
- Notifikasi WhatsApp **untuk warga** *(diperjelas v4.0 - lihat isu governance 7.1 soal notifikasi ke operator, yang statusnya berbeda dan belum diputuskan)*

---

## 4. Tech Stack

| Layer | Pilihan | Status |
|---|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS | Final |
| Backend | Node.js (REST API), struktur modular sesuai AWG Convention | Final |
| Database | PostgreSQL | Final |
| Realtime Layer | Firebase RTDB | Final - dipertahankan untuk prasyarat integrasi IoT & kebutuhan near-real-time. |
| Maps | Leaflet + OpenStreetMap | Final |
| AI | Peringkasan teks cuaca/gempa & rekomendasi sederhana. **Tidak digunakan untuk prediksi bencana.** | Final (fungsi) / *Draft* Fallback plan |
| Hosting | Production: server desa (arah program)  **TBD, menunggu konfirmasi Tim DevOps** | TBD |
| Komunikasi Platform ↔ Perangkat IoT (indikator+sirine) *(Baru, v4.0)* | Protokol belum ditentukan (kandidat: MQTT, REST polling, atau lainnya); termasuk apakah tombol sirine bersifat network-connected atau switch lokal murni | **TBD**, menunggu diskusi Tech Lead + Tim IoT - lihat 7.1 |

---

## 5. Non-Functional Requirements *Draft*

> **Perbaikan v3.** Bagian ini mendefinisikan **kebutuhan/constraint di level produk**. Solusi teknis implementasinya (algoritma caching, skema enkripsi, dsb.) adalah tanggung jawab Architecture Document (G3) - PRD ini hanya menetapkan apa yang harus benar, bukan bagaimana caranya.

### 5.1 Performance
- Dashboard utama harus menampilkan data cuaca/gempa terkini dalam kondisi normal tanpa jeda yang mengganggu pengalaman pengguna non-teknis.
- Sistem harus tetap dapat diakses dan menampilkan data terakhir yang tersimpan saat koneksi internet lambat/terputus sementara (lihat 5.4, Offline Capability).
- **Rencana fallback AI API** *Draft* : apabila layanan AI tidak tersedia atau melewati batas kuota, sistem menampilkan data mentah cuaca/gempa disertai indikator "ringkasan otomatis sedang tidak tersedia". *Perlu dikonfirmasi PM sebelum masuk backlog sebagai keputusan final.*

### 5.2 Security & Privasi Data
- Data kontak darurat dan lokasi titik/jalur evakuasi wajib terlindungi dari modifikasi tidak sah (akses tulis terbatas pada kategori Protected).
- Kredensial pihak ketiga (API key BMKG/USGS/OWM/AI) tidak boleh terekspos di sisi klien.
- Detail implementasi (enkripsi at-rest, manajemen secret, dsb.) didefinisikan di Architecture Document & Security Review (G3/G4).

### 5.3 Aksesibilitas
- Antarmuka harus dapat digunakan oleh warga dengan literasi digital terbatas, termasuk lansia, tanpa memerlukan pelatihan.
- Kontras warna dan ukuran teks mengikuti prinsip keterbacaan dasar untuk kondisi pencahayaan luar ruangan (relevan untuk penggunaan saat kondisi darurat/evakuasi).
- Informasi kritis (status bencana, jalur evakuasi) tidak boleh bergantung hanya pada warna sebagai satu-satunya penanda (mempertimbangkan potensi buta warna pada sebagian pengguna).

### 5.4 Offline Capability
- Sistem harus tetap menampilkan data terakhir yang berhasil dimuat saat koneksi hilang, dengan indikator eksplisit "data terakhir diperbarui pada [waktu]".
- Strategi teknis (caching, service worker, dsb.) didefinisikan di Architecture Document (G3).

### 5.5 Keamanan Jalur Aktuasi Fisik (Platform ↔ IoT) *Draft - Baru, v4.0*
> Bagian ini muncul karena scope indikator+sirine (3.1) membawa konsekuensi berbeda dari fitur informasional lain: outputnya adalah aksi fisik di dunia nyata. Requirement di bawah adalah **kebutuhan level produk**; mekanisme teknis (protokol autentikasi device, enkripsi channel, dsb.) adalah tanggung jawab Architecture Document & Security Review (G3/G4), sesuai pola bagian NFR lain di dokumen ini.

- **Autentisitas perintah ke device:** perangkat IoT harus dapat memastikan sinyal level yang diterima benar-benar berasal dari platform SIGAP resmi, bukan sumber yang dipalsukan di jaringan lokal. Mekanisme spesifik (mis. signed payload, device auth token) - **TBD di G3**.
- **Fail-safe tetap berlaku saat gangguan:** kehilangan koneksi harus menghasilkan status yang jelas berbeda dari "aman" (lihat 3.1) - sudah final, dipertahankan di sini sebagai requirement keamanan sekaligus keselamatan.
- **Notifikasi ke operator** *(isu terbuka, lihat 7.1)*: mekanisme untuk memastikan operator mengetahui perubahan level tanpa harus terus-menerus memantau dashboard. Kanal spesifik belum ditentukan, dan berpotensi bersinggungan dengan larangan notifikasi WhatsApp di 3.2 (yang dimaksudkan untuk warga, bukan operator) - perlu klarifikasi eksplisit sebelum masuk backlog.
- **Safeguard terhadap kesalahan aktivasi oleh operator (human factor):** mengingat aktivasi sirine bergantung pada penilaian manusia dalam kondisi berpotensi tegang, sistem/prosedur perlu mempertimbangkan langkah konfirmasi tambahan (mis. dua tahap konfirmasi) untuk level Merah agar menekan risiko aktivasi tidak sengaja - **desain spesifik TBD**, ini requirement bahwa risiko human-factor perlu ditangani, bukan resep solusinya.

---

## 6. External APIs

| Sumber | Kegunaan | Status |
|---|---|---|
| BMKG | Cuaca, prakiraan, info bencana, potensi tsunami | Wajib |
| USGS | Data seismik | Wajib |
| OpenWeatherMap | Cuaca real-time, komplementer BMKG | *Draft* Should |
| OpenStreetMap | Lokasi desa, jalur & titik evakuasi | Wajib |
| AI API | Ringkasan cuaca/gempa & rekomendasi sederhana | Wajib |

---

## 7. Data Model *Draft*

> **Perbaikan v3.** Struktur di bawah adalah **gambaran tingkat tinggi untuk konteks**, bukan spesifikasi lengkap. Tipe data, constraint, relasi, dan indexing adalah tanggung jawab **Data Dictionary (G2)** dan **Database Schema Final (G3-05)** dicantumkan detail di sini akan menduplikasi pekerjaan gate tersebut.

```
users                (id, name, email, password, role*)
announcements        (id, title, content, created_by)
evacuation_points     (id, name, latitude, longitude, description)
evacuation_routes     (id, route_name, geometry)
emergency_contacts    (id, institution, phone_number)
environmental_data    (id, source, type, value, unit, recorded_at)
alert_log             (id, alert_type, severity, message, triggered_at)
iot_devices           (id, device_name, latitude, longitude, status, current_level, last_seen_at)   -- Baru, v4.0
device_status_log     (id, device_id, level_sent, sent_at, ack_status**)                            -- Baru, v4.0
```

**\*\*Catatan (v4.0):** kolom `ack_status` pada `device_status_log`, dan kemungkinan tabel `siren_action_log` terpisah (untuk mencatat siapa memicu sirine dan kapan), **hanya relevan jika hasil diskusi Tech Lead + Tim IoT menetapkan jalur tombol sirine bersifat network-connected**. Jika jalurnya murni switch lokal/offline, tidak ada audit trail digital untuk aksi sirine - ini konsekuensi yang perlu disadari sadar sebelum keputusan protokol diambil (lihat 7.1), bukan sekadar detail implementasi.

**\*Catatan konsistensi (perbaikan v3):** kolom `role` pada tabel `users` bersifat *(TBD)* **placeholder** struktur akhirnya bergantung pada hasil **Permission Matrix Admin** (lihat Bagian 7.1, dikerjakan di Gate G2/E0). Versi PRD sebelumnya menampilkan kolom ini seolah final, padahal bertentangan dengan status governance yang sama-sama tercantum di dokumen ini dikoreksi di versi ini agar tidak ada kontradiksi internal.

### 7.1 Isu Governance Terbuka

| Isu | Status | Pemilik |
|---|---|---|
| Permission matrix admin - **struktur sistem sudah final** (role `admin`/`operator`, lihat Route/Access Design + `DD_rbac.md`). Penentuan siapa memegang role apa adalah kebijakan operasional mitra desa, bukan TBD arsitektur - ditutup dari daftar governance terbuka. | Closed (sistem) | Mitra desa menentukan penempatan personel secara internal |
| Fallback AI API | Draft, perlu konfirmasi | Tech Lead |
| Hosting produksi | TBD | Tim DevOps |
| Jalur tombol sirine | **Final** - arsitektur hybrid: lokal fisik (selalu tersedia) + remote aplikasi (menyusul setelah komunikasi platform↔device rampung). Detail: `sigap_app\docs\sigap_architecture\data_dictionary\DD_iot_kesiapsiagaan.md` | - |
| Protokol komunikasi platform → perangkat IoT | **Final** - Firebase Realtime Database | - |
| Kanal notifikasi ke operator saat level berubah - kebijakan terpisah dari larangan "notifikasi WhatsApp" 3.2 (yang berlaku untuk warga) | Draft - mekanisme diusulkan via integrasi SID (memanfaatkan PWA SID sebagai kanal pengiriman), menunggu sign-off Tim SID. Detail: `integration/SID_INTEGRATION_PROPOSAL.md` | Tech Lead SIGAP + Tech Lead SID |
| **(Baru, v4.0)** Mekanisme konfirmasi tambahan sebelum aktivasi sirine (mitigasi human-factor/kepanikan operator) | TBD | Tech Lead + Tim IoT, idealnya divalidasi dengan operator terlatih |
| **(Baru, v4.0)** Update dokumen: scope IoT-sebagai-aktuator ini perlu disinkronkan ke SIGAP Backlog Jira-Ready v2 (Epic/Story baru + estimasi SP belum masuk hitungan 9) | TBD | Tech Lead |

---

## 8. MVP Features (ringkas)

Rincian Epic/Story/Task/Subtask beserta Story Point, prioritas MoSCoW, dan model kepemilikan (ownership) ada di **SIGAP Backlog Jira-Ready v2** tidak diduplikasi di sini.

| Modul | Fitur Utama |
|---|---|
| Monitoring Lingkungan | Dashboard ringkasan, cuaca, forecast, gempa, tsunami, grafik & riwayat historis, riwayat alert |
| Kesiapsiagaan Bencana | Jalur & titik evakuasi, kontak darurat, panduan gempa/tsunami |
| Decision Support | Smart Weather Summary (AI), Daily Safety Recommendation (AI), ringkasan gempa (AI) |
| Dashboard Admin | Kelola pengumuman, kontak darurat, titik & jalur evakuasi |

---

## 9. Feasibility & Basis Estimasi

> **Perbaikan v3.** Estimasi durasi dan beban kerja **tidak diturunkan ulang di sini** basis lengkapnya (breakdown Story Point per Epic, alokasi Sprint, dan analisis beban per minggu) telah disusun secara terperinci dan dapat diaudit langsung di **SIGAP Backlog Jira-Ready v2**, khusus sheet *Sprint Plan* dan *Recap SP per Epic*.

Ringkasan tingkat tinggi:
- Durasi total: **12 minggu**, mengikuti struktur Gate G1-G7.
- Total beban backlog: **225 Story Point** lintas 7 Epic (termasuk Epic Kesiapsiagaan Bencana yang baru).
- **Catatan v4.0:** angka di atas **belum mencakup** beban kerja scope IoT indikator+sirine (3.1) yang baru dikonfirmasi. Backlog perlu direvisi (Epic/Story baru + estimasi SP) sebelum angka total durasi/SP di atas dianggap akurat kembali - lihat 7.1.
- **Catatan risiko yang tercatat eksplisit di Backlog:** distribusi beban per minggu tidak merata, beberapa sprint (khususnya menjelang UAT & deployment) berada signifikan di atas kapasitas historis tim. Ini adalah keputusan sadar Tech Lead (kompresi durasi tanpa pemotongan scope) dengan titik evaluasi ulang di Checkpoint 1 (Minggu ke-4).

---

## 10. User Flow

**Warga Desa:** melihat kondisi lingkungan terkini & prakiraan → membaca ringkasan AI → melihat status kesiapsiagaan → mengakses jalur/titik evakuasi & kontak darurat sesuai kebutuhan.

**Admin (operator yang ditunjuk):** login → mengelola pengumuman, kontak darurat, titik & jalur evakuasi → memperbarui informasi yang ditampilkan ke warga.

---

## 11. Roadmap & Gate Mapping

| Gate | Deliverable | Cakupan |
|---|---|---|
| G2 | Business Workflow, Use Case Diagram, DFD, Data Dictionary | Detail alur & struktur data melengkapi Bagian 7 |
| G3 | Architecture Document, API Specification, ADR, Deployment Strategy | Detail teknis implementasi melengkapi Bagian 4 & 5 |
| G4-G7 | Development, UAT, Deployment | Eksekusi sesuai Backlog Jira-Ready v2 |

---

## 12. Catatan Penutup

SIGAP bukan sistem pendeteksi maupun prediksi bencana mandiri. Seluruh keputusan mitigasi bencana tetap mengacu pada informasi resmi dari BMKG, USGS, BPBD, dan instansi berwenang. Peran AI dibatasi pada penyederhanaan penyampaian informasi, bukan pengambilan keputusan otomatis. **(v4.0)** Prinsip yang sama berlaku untuk indikator fisik dan sirine: sistem hanya meneruskan level berbasis rule yang sudah ada, dan aktivasi sirine tetap sepenuhnya keputusan operator manusia terlatih - sistem tidak pernah mengaktifkan sirine secara otomatis.
