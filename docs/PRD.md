# Product Requirement Document (PRD)

# SIGAP (Sistem Informasi dan Kesiapsiagaan Bencana Desa Cibenda)

> Versi: 3.0 
> Tanggal: 09/07/2026  
> By: Naufal Fadhiil

---

# 1. Project Overview

## A. Product

**SIGAP (Sistem Informasi dan Kesiapsiagaan Bencana Desa Cibenda)** merupakan platform berbasis web yang berfungsi sebagai **Decision Support Dashboard** dan **Emergency Information Distribution Platform** untuk membantu pemerintah desa dan masyarakat memperoleh informasi kebencanaan secara cepat, sederhana, dan terstruktur.

SIGAP mengintegrasikan data resmi dari BMKG serta sumber data pendukung lainnya menjadi informasi yang mudah dipahami oleh masyarakat. Selain menampilkan informasi cuaca dan kebencanaan, SIGAP juga memiliki mekanisme **Decision Engine** yang menerjemahkan data resmi menjadi status kesiapsiagaan desa serta mendukung proses penyebaran informasi kepada perangkat desa dan masyarakat.

> Note: SIGAP **bukan sistem pendeteksi maupun prediksi bencana**, melainkan sistem yang membantu proses distribusi informasi resmi dari instansi yang berwenang.

---

## B. Background

Desa Cibenda merupakan salah satu wilayah pesisir di Kabupaten Pangandaran yang memiliki potensi terdampak berbagai bencana alam seperti gempa bumi, tsunami, cuaca ekstrem, serta banjir.

Informasi mengenai kondisi cuaca maupun kebencanaan sebenarnya telah tersedia melalui BMKG. Namun informasi tersebut masih tersebar pada berbagai platform, kurang berfokus terhadap kebutuhan masyarakat desa, serta belum disajikan dalam bentuk yang sederhana dan mudah dipahami.

Di sisi lain, penyampaian informasi kepada masyarakat masih mengandalkan komunikasi manual sehingga berpotensi menimbulkan keterlambatan dalam penyebaran informasi.

Oleh karena itu, diperlukan sebuah platform yang mampu mengintegrasikan informasi resmi dari BMKG menjadi dashboard yang sederhana, mudah digunakan, serta mendukung proses penyebaran informasi kebencanaan kepada masyarakat Desa Cibenda.

---

## C. Problem Statement

Warga Desa Cibenda mengalami kesulitan memperoleh informasi cuaca dan potensi bencana yang spesifik untuk wilayah mereka karena informasi berasal dari berbagai sumber, belum terpusat, belum disajikan dalam bentuk yang mudah dipahami, serta belum memiliki mekanisme distribusi informasi yang terstruktur hingga tingkat desa.

---

## D. Goals

- Menyediakan dashboard monitoring cuaca yang berfokus pada Desa Cibenda.
- Menyediakan informasi gempa bumi terbaru dari BMKG.
- Menyediakan informasi status potensi tsunami berdasarkan data resmi BMKG.
- Menyediakan peta jalur evakuasi dan titik evakuasi desa.
- Menyediakan kontak darurat dalam satu platform.
- Membantu masyarakat memahami kondisi cuaca melalui ringkasan informasi berbasis AI.
- Membantu pemerintah desa dalam mengambil keputusan awal melalui **Decision Engine** berbasis aturan (Rule-Based Decision Engine).
- Mempercepat penyebaran informasi kebencanaan kepada perangkat desa maupun masyarakat.

---

## E. Target Users

### Primary Users

- Warga Desa Cibenda
- Nelayan
- Petani
- Wisatawan (Opsional)

---

### F. Secondary Users

- Kepala Desa
- Perangkat Desa
- RT/RW
- Relawan Desa
- BPBD (Opsional)
- Pemerintah Daerah (Opsional)

---

# User Roles

## Public User

Pengguna umum tidak memerlukan login untuk mengakses dashboard.

Public User dapat:

- Melihat dashboard monitoring.
- Melihat informasi cuaca.
- Melihat informasi gempa bumi.
- Melihat status tsunami.
- Melihat jalur evakuasi.
- Melihat titik evakuasi.
- Melihat kontak darurat.
- Melihat pengumuman desa.

---

## Admin

Admin merupakan perangkat desa yang memiliki akses ke Dashboard Admin.

Admin dapat:

- Login ke Dashboard Admin.
- Melakukan validasi alert.
- Mengelola broadcast.
- Mengelola pengumuman.
- Mengelola jalur evakuasi.
- Mengelola titik evakuasi.
- Mengelola kontak darurat.

---

## Value Proposition

Mengintegrasikan informasi resmi BMKG menjadi dashboard kesiapsiagaan desa yang sederhana, mudah dipahami, serta mendukung pemerintah desa dalam mendistribusikan informasi kebencanaan kepada masyarakat secara lebih cepat dan terstruktur.

---

# 2. Product Scope

## In Scope (MVP)

### 1) Dashboard Monitoring

- Monitoring cuaca Desa Cibenda
- Monitoring gempa bumi terbaru
- Monitoring status tsunami
- Monitoring status kesiapsiagaan desa

### 2) Decision Support

- Decision Engine berbasis Rule-Based
- Status kesiapsiagaan desa
- Ringkasan kondisi cuaca
- Ringkasan informasi gempa
- Rekomendasi aktivitas berdasarkan kondisi cuaca

### 3) Emergency Alert

- Menerima data resmi BMKG
- Melakukan evaluasi berdasarkan aturan sistem
- Menentukan status kesiapsiagaan
- Menampilkan riwayat alert

### 4) Emergency Broadcast

- Broadcast Alert kepada Admin Desa
- Validasi Alert oleh Admin
- Broadcast kepada masyarakat
- Riwayat Broadcast

### 5) Informasi Kesiapsiagaan

- Jalur evakuasi
- Titik evakuasi
- Kontak darurat
- Panduan menghadapi gempa
- Panduan menghadapi tsunami

### 6) Dashboard Admin

Admin dapat:

- Mengelola pengumuman
- Mengelola kontak darurat
- Mengelola jalur evakuasi
- Mengelola titik evakuasi
- Melihat alert
- Memvalidasi alert
- Mengelola broadcast

---

## Out of Scope

Fitur berikut tidak termasuk pada pengembangan MVP:

- Prediksi gempa bumi
- Prediksi tsunami
- Sistem Early Warning mandiri
- Integrasi sensor IoT
- Integrasi buoy laut
- Machine Learning Prediction
- AI Prediksi Bencana
- Mobile Application
- Forum Diskusi
- Login Warga
- Live Tracking Kendaraan Evakuasi
- Sistem Pelaporan Warga
- Integrasi Sirine Otomatis (Opsional)

Fitur-fitur tersebut dapat dipertimbangkan sebagai pengembangan pada versi berikutnya.

---

# 3. System Workflow

Alur utama sistem SIGAP adalah sebagai berikut:

1. BMKG mengirimkan data resmi (gempa, tsunami, cuaca).
2. Scheduler melakukan sinkronisasi data secara berkala.
3. Decision Engine mengevaluasi data berdasarkan Rule Threshold.
4. Sistem menentukan Status Kesiapsiagaan Desa.
5. Jika memenuhi kondisi alert, sistem mengirimkan notifikasi kepada Admin Desa.
6. Admin melakukan validasi terhadap alert.
7. Setelah divalidasi, sistem melakukan broadcast kepada masyarakat melalui media yang tersedia.

---

# 4. Rule-Based Decision Engine

SIGAP menggunakan Rule-Based Decision Engine untuk menerjemahkan data resmi BMKG menjadi status kesiapsiagaan desa.

Rule Engine tidak melakukan prediksi bencana.

Seluruh keputusan dihasilkan berdasarkan threshold yang telah ditentukan, seperti:

- Magnitudo gempa.
- Radius gempa terhadap Kabupaten Pangandaran.
- Status tsunami resmi BMKG.
- Parameter kebencanaan lainnya yang tersedia dari BMKG.

Output Decision Engine berupa:

🟢 Normal

🟡 Waspada

🟠 Siaga

🔴 Awas

Status tersebut menjadi dasar proses validasi alert serta broadcast kepada masyarakat.

---

# 5. Tech Stack


| Layer | Pilihan | Status |
|---|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS | Final |
| Backend | Node.js (REST API), struktur modular sesuai AWG Convention | Final |
| Database | PostgreSQL | Final |
| Realtime Layer | Firebase RTDB | Final  dipertahankan untuk prasyarat integrasi IoT & kebutuhan near-real-time |
| Maps | Leaflet + OpenStreetMap | Final |
| AI | Peringkasan teks cuaca/gempa & rekomendasi sederhana. **Tidak digunakan untuk prediksi bencana.** | Final (fungsi) / *Draft* Fallback plan |
| Hosting | Production: server desa (arah program)  **TBD, menunggu konfirmasi Tim DevOps** | TBD |

---

## Scheduler

Cron Job digunakan untuk:

- Sinkronisasi data BMKG
- Update data cuaca
- Update data gempa
- Update status tsunami

---

## AI

AI hanya digunakan untuk:

AI digunakan hanya sebagai Smart Summary Generator untuk mengubah data cuaca dan informasi gempa menjadi ringkasan yang lebih mudah dipahami masyarakat.
AI tidak digunakan untuk melakukan prediksi, klasifikasi, maupun analisis kebencanaan.

> AI tidak digunakan untuk melakukan prediksi bencana maupun analisis kebencanaan.

---

## Hosting

Frontend:

- Vercel (belum pasti)

Backend:

- Railway / VPS

Database:

- PostgreSQL

---

# 6. External APIs

| Sumber | Kegunaan | Status |
|---|---|---|
| BMKG | Cuaca, prakiraan, info bencana, potensi tsunami | Wajib |
| USGS | Data seismik | Wajib |
| OpenWeatherMap | Cuaca real-time, komplementer BMKG | *Draft* Should |
| OpenStreetMap | Lokasi desa, jalur & titik evakuasi | Wajib |
| AI API | Ringkasan cuaca/gempa & rekomendasi sederhana | Wajib |

---

# 7. Success Criteria

SIGAP dianggap berhasil apabila:

- Dashboard berhasil menampilkan data resmi BMKG.
- Sistem dapat melakukan sinkronisasi data secara otomatis.
- Decision Engine berhasil menghasilkan status kesiapsiagaan desa.
- Admin dapat melakukan validasi alert.
- Sistem dapat mengirimkan broadcast kepada penerima yang ditentukan.
- Warga dapat mengakses dashboard tanpa login.
- Informasi kesiapsiagaan mudah dipahami oleh masyarakat.

---

# 8. Non-Functional Requirements

- Dashboard harus responsif pada desktop dan perangkat mobile.
- Dashboard menggunakan Bahasa Indonesia sebagai bahasa utama.
- Informasi utama dapat dipahami dalam waktu kurang dari 3 detik setelah halaman dibuka.
- Tampilan ramah bagi pengguna lanjut usia dengan ukuran teks yang cukup besar dan kontras warna yang jelas.
- Sistem hanya menggunakan data resmi dari BMKG dan sumber terpercaya lainnya.
- Seluruh informasi yang ditampilkan harus mencantumkan waktu pembaruan data (Last Updated).

---

## Next Development 
### Integrasi dengan Data SID (Sistem Informasi Desa)

Digunakan untuk:

- Data warga
- Data RT/RW
- Data Kepala Desa
- Data kontak penerima broadcast

Status

> Integrasi Internal Capstone
