# Product Requirement Document(PRD) SIGAP (Sistem Informasi dan Kesiapsiagaan Bencana Desa Cibenda)

> Versi: 1.0  
> Tanggal: 05/07/2026  
> Status: Draft

---

# 1. Project Overview

## Product

**SIGAP (Sistem Informasi dan Kesiapsiagaan Bencana Desa Cibenda)** merupakan platform berbasis web yang menyediakan informasi cuaca, gempa bumi, potensi tsunami, serta informasi kesiapsiagaan bencana yang berfokus pada wilayah Desa Cibenda, Kabupaten Pangandaran.

SIGAP memanfaatkan data resmi dari BMKG dan sumber terpercaya lainnya, kemudian mengolahnya menjadi informasi yang sederhana, mudah dipahami, dan relevan bagi masyarakat maupun perangkat desa.

---

## Background

Desa Cibenda merupakan salah satu wilayah pesisir di Kabupaten Pangandaran yang memiliki potensi terdampak berbagai bencana alam seperti gempa bumi, tsunami, cuaca ekstrem, serta banjir.

Informasi mengenai kondisi cuaca maupun kebencanaan sebenarnya telah tersedia melalui BMKG, namun informasi tersebut tersebar di berbagai platform, kurang berfokus pada wilayah desa, serta masih sulit dipahami oleh sebagian masyarakat.

Diperlukan sebuah platform yang mampu mengintegrasikan informasi resmi tersebut menjadi dashboard yang sederhana, mudah digunakan, informatif, dan mudah diakses.

---

## Problem Statement

Warga Desa Cibenda mengalami kesulitan memperoleh informasi cuaca dan potensi bencana yang spesifik untuk wilayah mereka karena informasi berasal dari berbagai sumber, belum terpusat, dan belum disajikan dalam bentuk yang mudah dipahami.

---

## Goals

- Menyediakan dashboard monitoring cuaca yang berfokus pada Desa Cibenda.
- Menyampaikan informasi bencana alam (gempa/tsunami) dari sumber data resmi.
- Membantu masyarakat memahami kondisi cuaca melalui ringkasan dan rekomendasi dari AI yang sederhana.
- Menyediakan peta informasi jalur evakuasi, titik kumpul, dan kontak darurat dalam satu platform.

---

## Target Users

### Primary Users

- Warga Desa Cibenda
- Nelayan
- Petani
- Wisatawan yang sedang berada di wilayah Desa Cibenda (opsional)

### Secondary Users (Admin)

- Kepala Desa
- Perangkat Desa
- Relawan Desa
- BPBD (opsional)
- Pemerintah daerah (opsional)

---

## Value Proposition

Mengintegrasikan informasi cuaca dan kebencanaan resmi menjadi dashboard kesiapsiagaan desa yang sederhana, mudah dipahami, dan membantu masyarakat mengambil keputusan lebih cepat.

---

# 2. Product Scope

## In Scope (MVP)

### Dashboard Monitoring

- Monitoring cuaca Desa Cibenda
- Monitoring gempa bumi terbaru
- Informasi potensi tsunami
- Status kesiapsiagaan desa

### Informasi Kesiapsiagaan

- Jalur evakuasi
- Titik evakuasi
- Kontak darurat
- Panduan menghadapi gempa
- Panduan menghadapi tsunami

### Decision Support

- Ringkasan kondisi cuaca
- Rekomendasi aktivitas berdasarkan kondisi cuaca
- Ringkasan informasi gempa

### Dashboard Admin

- Mengelola pengumuman
- Mengelola kontak darurat
- Mengelola titik evakuasi
- Mengelola jalur evakuasi

---

## Out of Scope

Fitur berikut tidak termasuk pada pengembangan MVP:

- Prediksi gempa bumi
- Prediksi tsunami
- Sistem Early Warning mandiri
- Integrasi sensor IoT
- Machine Learning
- Chatbot AI
- Mobile Application
- Login warga
- Forum diskusi
- Notifikasi WhatsApp
- Sistem pelaporan warga
- Live tracking kendaraan evakuasi

Fitur-fitur tersebut diluar tujuan projek atau beberapa fitur dapat dipertimbangkan sebagai pengembangan pada versi berikutnya.

---

# 3. Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

## Backend

- Node.Js (REST API)

## Database

- PostgreSQL

## Maps

- Leaflet
- OpenStreetMap

## AI

AI digunakan hanya untuk menghasilkan ringkasan informasi cuaca dan rekomendasi sederhana berdasarkan data resmi yang diterima.

> Note: AI tidak digunakan untuk melakukan prediksi bencana.

## Hosting

Frontend

- Vercel

Backend

- Railway / VPS

Database

- PostgreSQL

---

# 4. External APIs

## BMKG API

Digunakan untuk memperoleh:

- Informasi cuaca
- Prakiraan cuaca
- Update Bencana alam terbaru
- Informasi potensi tsunami (jika tersedia)

Status

> Wajib

---

## OpenStreetMap

Digunakan untuk

- Menampilkan lokasi desa
- Jalur evakuasi
- Titik evakuasi

Status

> Wajib

---

## AI API

Digunakan untuk

- Membuat ringkasan kondisi cuaca
- Memberikan rekomendasi kegiatan sesuai dengan cuaca kepada masyarakat

Status

> Opsional

---

# 5. MVP Features

## Dashboard

### ★ Dashboard Ringkasan

Menampilkan:

- Status cuaca hari ini
- Status kesiapsiagaan
- Ringkasan cuaca
- Ringkasan gempa terbaru
- Status tsunami

---

## Monitoring Cuaca

### ★ Monitoring Cuaca

User/Warga dapat:

- Melihat cuaca saat ini
- Melihat suhu
- Melihat kelembapan
- Melihat kecepatan angin
- Melihat peluang hujan

---

### ★ Forecast

User dapat melihat prakiraan cuaca beberapa hari ke depan.

---

## Monitoring Gempa

### ★ Gempa Terbaru

User dapat melihat

- Magnitudo
- Lokasi
- Kedalaman
- Waktu kejadian

---

## Monitoring Tsunami

### ★ Status Tsunami

User dapat mengetahui apakah terdapat informasi potensi tsunami berdasarkan sumber resmi.

---

## Peta Evakuasi

### ★ Jalur Evakuasi

Menampilkan jalur evakuasi menuju titik aman.

---

### ★ Titik Evakuasi

Menampilkan lokasi titik kumpul.

---

## Kontak Darurat

### ★ Emergency Contact

Menampilkan nomor penting seperti

- Kepala Desa
- BPBD
- Puskesmas
- Ambulans
- Polisi
- Damkar

---

## AI Summary

### ★ Smart Weather Summary

Mengubah data cuaca menjadi informasi yang mudah dipahami.

Contoh:

"Hari ini diperkirakan hujan lebat pada sore hari. Warga disarankan mengurangi aktivitas di area pantai."

---

### ☆ Daily Safety Recommendation

Memberikan rekomendasi aktivitas harian berdasarkan kondisi cuaca.

---

# 6. User Flow

## Warga Desa

Warga dapat:

- Melihat kondisi cuaca terkini.
- Melihat prakiraan cuaca beberapa hari ke depan.
- Melihat informasi gempa bumi terbaru.
- Melihat status potensi tsunami.
- Membaca ringkasan cuaca yang mudah dipahami.
- Mendapatkan rekomendasi kesiapsiagaan.
- Melihat jalur evakuasi.
- Melihat titik evakuasi.
- Melihat kontak darurat.
- Membaca panduan menghadapi gempa dan tsunami.

---

## Admin

Admin dapat:

- Login ke Dashboard Admin.
- Mengelola pengumuman desa.
- Memperbarui informasi yang ditampilkan kepada masyarakat.

---

# 7. Data Model

## users

- id
- name
- email
- password
- role

---

## announcements

- id
- title
- content
- created_by

---

## evacuation_points

- id
- name
- latitude
- longitude
- description

---

## evacuation_routes

- id
- route_name
- geometry

---

## emergency_contacts

- id
- institution
- phone_number

---

# 8. Development Roadmap

## Phase 1 — Research & Planning

- Finalisasi kebutuhan sistem.
- Menentukan ruang lingkup MVP.
- Melakukan riset API.
- Menyusun PRD.
- Mendesain wireframe.

---

## Phase 2 — Core Development

- Membangun backend.
- Integrasi BMKG API.
- Membangun dashboard utama.
- Membangun halaman monitoring cuaca.
- Membangun halaman gempa.
- Membangun halaman tsunami.

---

## Phase 3 — Feature Completion

- Jalur evakuasi.
- Titik evakuasi.
- Dashboard Admin.
- Pengumuman.
- AI Summary.

---

## Phase 4 — Testing & Deployment

- Manual Testing dan Eksploratory Testing.
- Perbaikan bug.
- Optimasi UI.
- Deployment.
- Presentasi Capstone.

---

# 9. Timeline

| Minggu | Aktivitas |
|---------|-----------|
| 1 | Research & PRD |
| 2 | Wireframe & UI Design |
| 3 | Backend Development |
| 4 | Frontend Dashboard |
| 5 | Integrasi API |
| 6 | Dashboard Admin |
| 7 | AI Summary & Testing |
| 8 | Deployment & Final Presentation |

---

# Catatan Tambahan

Dashboard SIGAP berperan sebagai **Decision Support Dashboard** yang mengintegrasikan informasi resmi dari BMKG dan sumber terpercaya lainnya menjadi informasi yang sederhana, mudah dipahami, dan relevan bagi masyarakat Desa Cibenda.

SIGAP bukan sistem pendeteksi maupun prediksi bencana.

Seluruh keputusan penting terkait mitigasi bencana tetap mengacu pada informasi resmi dari BMKG, BPBD, dan instansi pemerintah yang berwenang.