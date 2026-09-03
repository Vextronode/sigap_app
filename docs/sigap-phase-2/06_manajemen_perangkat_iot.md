# FS-06 - Manajemen Perangkat IoT

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | Area 1 (Data Contract), SEC-7 (Autentikasi Device Gateway) |
| Status | Final - direvisi pasca-audit kode (schema nyata jauh lebih sederhana dari asumsi) |
| Referensi | PRD.md S3.1, S7, Dokumentasi_Sistem_IoT_SIGAP.md, Laporan Audit Endpoint (lihat Peta Referensi Backlog) |

## 0. Catatan Revisi

Audit kode menemukan model `Device` nyata **jauh lebih sederhana** dari asumsi versi FS-06 sebelumnya:

```prisma
model Device {
  id         String       @id @default(uuid())
  deviceCode String       @unique
  name       String
  status     DeviceStatus @default(OFFLINE)  // enum ONLINE/OFFLINE saja
  lastSeen   DateTime?
  ...
}
```

Tidak ada `latitude`/`longitude`, tidak ada pembeda tipe perangkat (Unit Utama vs Sirine), tidak ada snapshot status Sirine. Identifikasi device di endpoint nyata pakai `deviceCode` di body (bukan `{id}` di path) - ini **sudah benar** dan konsisten dengan desain saya sebelumnya, tidak perlu diubah. Yang perlu ditambahkan adalah 3 hal yang sebelumnya diasumsikan sudah ada, ternyata belum:

## 1. Ringkasan

Registry perangkat indikator fisik. Selain CRUD dasar (yang sebagian polanya sudah ada - `register`/`heartbeat`/`status`), story ini sekarang **eksplisit mencakup migrasi schema** untuk lokasi, tipe perangkat, dan status Sirine - bukan asumsi field sudah tersedia.

## 2. Actor & Akses

`admin`, `operator` (Protected). Guard: `device.view` (baca), `device.manage` (tulis) - kode permission ini **sudah ada di seed**, tinggal dipakai.

## 3. Alur Fungsional

1. Unit Utama self-register via `POST /public/device/register` (body: `deviceCode`, `name`) - **endpoint ini sudah ada dan bekerja**, cuma belum ada middleware auth (lihat SEC-7).
2. Admin melengkapi metadata perangkat (lokasi, tipe) via panel admin - **field ini belum ada di schema, perlu migrasi**.
3. Unit Utama heartbeat setiap 60 detik (`POST /public/device/heartbeat`, body `deviceCode`) - **sudah ada**, akan diperluas membawa `sirensStatus[]` (lihat FR3).
4. Admin melihat daftar perangkat dengan status online/offline (`status`, `lastSeen` - **sudah ada**) plus lokasi & tipe (**baru**).

## 4. Functional Requirements

- FR1 *(baru)*: Migrasi schema - tambah kolom `latitude`, `longitude` (nullable, diisi admin manual karena device tidak mengirim GPS sendiri) ke `Device`.
- FR2 *(baru)*: Migrasi schema - tambah enum `DeviceType { UNIT_UTAMA, SIRINE }` + kolom `deviceType` di `Device`. Unit Utama self-register (FR-lama tetap berlaku); Sirine **tidak bisa self-register** (air-gapped, ESP-NOW only) - dibuat manual oleh admin via endpoint Protected baru.
- FR3 *(baru)*: Payload `POST /device/heartbeat` diperluas membawa field opsional `sirensStatus: [{deviceCode, connectivity, rssi?, powerStatus?}]` - Unit Utama melaporkan status Sirine yang terjangkau olehnya, backend meng-upsert snapshot per Sirine (kolom baru, lihat FR4).
- FR4 *(baru)*: Migrasi schema - tambah kolom snapshot status (mis. JSON `sirenStatusSnapshot` atau tabel kecil terpisah - keputusan teknis ke Architecture, bukan dipatok di sini) untuk menyimpan hasil FR3.
- FR5: Backend menolak (400/409) kalau `deviceCode` di `/register` atau `/heartbeat` terdaftar sebagai `deviceType=SIRINE` - safeguard karena Sirine secara fisik tidak mungkin memanggil endpoint ini sendiri.
- FR6: CRUD metadata (lokasi, nama) untuk kedua tipe perangkat oleh admin/operator (`device.manage`).
- FR7: Endpoint 3 device (register/heartbeat/status) wajib dilindungi `X-Device-Secret` per `deviceCode` - **lihat SEC-7**, bukan dikerjakan ulang di sini, cuma di-wire.

## 5. Acceptance Criteria

- AC1: Migrasi berhasil, `Device` existing (data yang sudah live) tidak rusak - `latitude`/`longitude`/`deviceType` nullable/default aman untuk baris lama.
- AC2: Unit Utama baru register → otomatis `deviceType=UNIT_UTAMA`.
- AC3: Admin membuat entri Sirine manual → `deviceType=SIRINE`, tidak bisa dipilih self-register.
- AC4: Heartbeat dengan `sirensStatus[]` terisi → snapshot status per Sirine ter-update, terlihat di panel admin.
- AC5: Percobaan `/register` atau `/heartbeat` dengan `deviceCode` milik Sirine → ditolak 409.
- AC6: Endpoint device tanpa `X-Device-Secret` valid → ditolak (setelah SEC-7 selesai; sebelum itu, endpoint tetap terbuka sebagai known gap, dicatat bukan disembunyikan).

## 6. Edge Case & Error Handling

- Sirine dibuat admin tapi belum pernah dapat laporan status dari Unit Utama manapun - tampilkan "Belum ada laporan status", bukan error.
- Field `latitude`/`longitude` kosong (device lama pra-migrasi belum diisi admin) - tampil "Lokasi belum diatur", bukan crash di peta manapun yang menampilkannya.

## 7. Data Terkait

`Device` (existing, ditambah kolom baru di FR1/FR2/FR4).

## 8. Dependency & Catatan Terbuka

- FR7 blocking terhadap SEC-7 - urutan pengerjaan: migrasi schema (FR1-4) dan CRUD (FR6) bisa jalan duluan, wiring auth device menyusul begitu SEC-7 selesai (lihat Sprint Plan: Sprint 1 migrasi, Sprint 3 wiring SEC-7).
- Struktur `sirenStatusSnapshot` (JSON vs tabel terpisah) **belum diputuskan** - keputusan teknis, perlu masuk Architecture Document sebelum FR4 diimplementasikan penuh.