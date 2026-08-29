# FS-06 — Manajemen Perangkat IoT

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | Area 1 (Data Contract) |
| Status | Draft |
| Referensi | PRD.md S3.1 (Kesiapsiagaan Fisik), S7 (`iot_devices`), Dokumentasi_Sistem_IoT_SIGAP.md |

## 1. Ringkasan

Registry perangkat indikator fisik (ESP32-C3) yang terpasang di titik strategis desa. Admin mendaftarkan, memantau status, dan mengelola metadata tiap perangkat.

## 2. Actor & Akses

`admin`, `operator` (Protected).

## 3. Alur Fungsional

1. Admin mendaftarkan perangkat baru: nama, lokasi (lat/lng).
2. Perangkat mengirim heartbeat setiap 60 detik ke backend (lihat Dokumentasi_Sistem_IoT_SIGAP.md S3); backend memperbarui `last_seen_at`.
3. Admin melihat daftar perangkat dengan status turunan (online/offline) dan `current_level` yang sedang ditampilkan perangkat.
4. Admin dapat mengubah metadata perangkat (nama, lokasi) atau menonaktifkan perangkat.

## 4. Functional Requirements

- FR1: CRUD metadata perangkat (nama, lokasi).
- FR2: Status online/offline diturunkan dari `last_seen_at` dibanding ambang waktu (mis. > 2× interval heartbeat 60 detik dianggap offline — **Perlu Klarifikasi**, ambang pastinya belum ditentukan di dokumen sumber, sebaiknya disamakan dengan logika fail-safe yang sama dengan indikator fisik di PRD S3.1).
- FR3: List perangkat menampilkan `current_level` terkini per perangkat.
- FR4: Admin dapat menonaktifkan (bukan hapus permanen) perangkat yang sedang tidak digunakan.

## 5. Acceptance Criteria

- AC1: Perangkat baru terdaftar → muncul di daftar dengan status "belum pernah terhubung" sampai heartbeat pertama diterima.
- AC2: Perangkat berhenti mengirim heartbeat melewati ambang waktu → status berubah otomatis ke offline di daftar admin.
- AC3: `current_level` di daftar admin konsisten dengan level yang dikirim melalui alur REST Polling (lihat FS-07).
- AC4: Menonaktifkan perangkat menghentikan pengiriman level baru ke perangkat tersebut, tanpa menghapus riwayat (`device_status_log`).

## 6. Edge Case & Error Handling

- Perangkat offline namun level fisiknya (LED) masih menyala di kondisi terakhir — bukan tanggung jawab admin panel untuk mengoreksi, hanya menampilkan status apa adanya (fail-safe di level perangkat sendiri, lihat PRD S3.1 & S5.5).
- Dua perangkat terdaftar di koordinat identik — diizinkan, tidak divalidasi sebagai constraint.

## 7. Data Terkait

`iot_devices (id, device_name, latitude, longitude, status, current_level, last_seen_at)`

## 8. Dependency & Catatan Terbuka

**Perlu Klarifikasi:** ambang waktu pasti untuk status offline (kelipatan interval heartbeat) belum ditentukan — perlu masuk ke Architecture Document (G3) atau NFR eksplisit sebelum FR2 difinalisasi.
