# Product Requirement Document (PRD)

# SIGAP (Sistem Informasi dan Kesiapsiagaan Bencana Desa Cibenda)

> Versi: 2.0  
> Tanggal: 08/07/2026  
> By: Naufal Fadhiil

---

# 1. Project Overview

## Product

**SIGAP (Sistem Informasi dan Kesiapsiagaan Bencana Desa Cibenda)** merupakan platform berbasis web yang berfungsi sebagai **Decision Support Dashboard** dan **Emergency Information Distribution Platform** untuk membantu pemerintah desa dan masyarakat memperoleh informasi kebencanaan secara cepat, sederhana, dan terstruktur.

SIGAP mengintegrasikan data resmi dari BMKG serta sumber data pendukung lainnya menjadi informasi yang mudah dipahami oleh masyarakat. Selain menampilkan informasi cuaca dan kebencanaan, SIGAP juga memiliki mekanisme **Decision Engine** yang menerjemahkan data resmi menjadi status kesiapsiagaan desa serta mendukung proses penyebaran informasi kepada perangkat desa dan masyarakat.

> Note: SIGAP **bukan sistem pendeteksi maupun prediksi bencana**, melainkan sistem yang membantu proses distribusi informasi resmi dari instansi yang berwenang.

---

## Background

Desa Cibenda merupakan salah satu wilayah pesisir di Kabupaten Pangandaran yang memiliki potensi terdampak berbagai bencana alam seperti gempa bumi, tsunami, cuaca ekstrem, serta banjir.

Informasi mengenai kondisi cuaca maupun kebencanaan sebenarnya telah tersedia melalui BMKG. Namun informasi tersebut masih tersebar pada berbagai platform, kurang berfokus terhadap kebutuhan masyarakat desa, serta belum disajikan dalam bentuk yang sederhana dan mudah dipahami.

Di sisi lain, penyampaian informasi kepada masyarakat masih mengandalkan komunikasi manual sehingga berpotensi menimbulkan keterlambatan dalam penyebaran informasi.

Oleh karena itu, diperlukan sebuah platform yang mampu mengintegrasikan informasi resmi dari BMKG menjadi dashboard yang sederhana, mudah digunakan, serta mendukung proses penyebaran informasi kebencanaan kepada masyarakat Desa Cibenda.

---

## Problem Statement

Warga Desa Cibenda mengalami kesulitan memperoleh informasi cuaca dan potensi bencana yang spesifik untuk wilayah mereka karena informasi berasal dari berbagai sumber, belum terpusat, belum disajikan dalam bentuk yang mudah dipahami, serta belum memiliki mekanisme distribusi informasi yang terstruktur hingga tingkat desa.

---

## Goals

- Menyediakan dashboard monitoring cuaca yang berfokus pada Desa Cibenda.
- Menyediakan informasi gempa bumi terbaru dari BMKG.
- Menyediakan informasi status potensi tsunami berdasarkan data resmi BMKG.
- Menyediakan peta jalur evakuasi dan titik evakuasi desa.
- Menyediakan kontak darurat dalam satu platform.
- Membantu masyarakat memahami kondisi cuaca melalui ringkasan informasi berbasis AI.
- Membantu pemerintah desa dalam mengambil keputusan awal melalui **Decision Engine** berbasis aturan (Rule-Based Decision Engine).
- Mempercepat penyebaran informasi kebencanaan kepada perangkat desa maupun masyarakat.

---

## Target Users

### Primary Users

- Warga Desa Cibenda
- Nelayan
- Petani
- Wisatawan (Opsional)

---

### Secondary Users

- Kepala Desa
- Perangkat Desa
- RT/RW
- Relawan Desa
- BPBD (Opsional)
- Pemerintah Daerah (Opsional)

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

- Broadcast kepada Kepala Desa
- Broadcast kepada RT/RW
- Broadcast kepada Relawan
- Broadcast kepada masyarakat
- Riwayat broadcast

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

# 3. Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

---

## Backend

- Node.js
- Express.js
- REST API

---

## Database

- PostgreSQL

---

## Maps

- Leaflet
- OpenStreetMap

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

- Ringkasan kondisi cuaca
- Ringkasan informasi gempa
- Rekomendasi aktivitas sederhana

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

# 4. External APIs

## BMKG API

Digunakan untuk memperoleh:

- Informasi cuaca
- Prakiraan cuaca
- Informasi gempa bumi terbaru
- Parameter gempa
- Informasi potensi tsunami
- Status peringatan tsunami

Status

> Wajib

---

## OpenStreetMap

Digunakan untuk:

- Menampilkan lokasi Desa Cibenda
- Jalur evakuasi
- Titik evakuasi

Status

> Wajib

---

## AI API

Digunakan untuk:

- Smart Weather Summary
- Daily Recommendation

Status

> Opsional

---

## Broadcast Gateway

Digunakan untuk:

- WhatsApp Broadcast
- SMS Broadcast

Status

> Phase Pengembangan Berikutnya

---

## Data SID (Sistem Informasi Desa)

Digunakan untuk:

- Data warga
- Data RT/RW
- Data Kepala Desa
- Data kontak penerima broadcast

Status

> Integrasi Internal Capstone
