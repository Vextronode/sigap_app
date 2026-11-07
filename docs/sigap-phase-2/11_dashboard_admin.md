# FS-11 - Dashboard Admin

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | FS-02, FS-06 untuk rincian per perangkat |

## 1. Ringkasan

Halaman pertama admin setelah login, berisi kondisi alert, data lingkungan, dan akses cepat ke halaman pengelolaan. Aksi kelola berada pada halaman masing-masing.

## 2. Actor dan Akses

`admin`, `operator` (Protected).

## 3. Struktur Halaman

- **Insiden aktif:** alert yang berlaku.
- **Metrik operasional:** level, jumlah subscriber Web Push, jumlah riwayat alert, dan status perangkat.
- **Gempa dan tsunami:** kartu yang sama dengan dashboard warga.
- **Konektivitas sistem:** status BMKG, Open-Meteo, Web Push, SID, dan database.
- **Aksi cepat:** tautan ke halaman pengelolaan; Manajemen Akun hanya untuk role `admin`.
- **Cuaca:** bagian yang sama dengan dashboard warga.

## 4. Functional Requirements

- FR1: Setiap bagian memakai komponen dan data yang sama dengan sumbernya, tanpa logika ganda.
- FR2: Setiap bagian menampilkan status errornya sendiri tanpa menggagalkan seluruh halaman.
- FR3: Konektivitas sistem menampilkan seluruh layanan pada `/api/public/system-health`.

## 5. Acceptance Criteria

- AC1: Alert yang tampil sama dengan alert yang berlaku pada dashboard publik.
- AC2: Halaman tetap termuat meski salah satu bagian gagal mengambil data.
- AC3: Layanan yang gagal tampil dengan status `OFFLINE` atau `STANDBY`.

## 6. Edge Case dan Error Handling

- Belum ada perangkat: status perangkat ditampilkan terputus.
- Semua layanan gagal: seluruh baris tetap tampil dengan statusnya.

## 7. Data Terkait

`alerts`, `devices`, `push_subscriptions`, serta hasil pemeriksaan `/api/public/system-health`.
