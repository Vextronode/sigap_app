# FS-06 - Manajemen Perangkat IoT

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | Ketetapan kontrak perangkat |

## 1. Ringkasan

Registry perangkat indikator fisik, mencakup CRUD metadata serta migrasi skema untuk lokasi, tipe perangkat, dan status Sirine.

## 2. Actor & Akses

`admin`, `operator` (Protected). Guard: `device.view` untuk baca dan `device.manage` untuk tulis.

## 3. Alur Fungsional

1. Unit Utama melakukan registrasi melalui `POST /api/public/device/register` dengan `deviceCode` dan `name`.
2. Admin melengkapi metadata perangkat (lokasi, tipe) melalui panel admin.
3. Unit Utama mengirim heartbeat berkala melalui `POST /api/public/device/heartbeat`, dengan status Sirine yang terjangkau.
4. Admin melihat daftar perangkat beserta status, waktu terakhir aktif, lokasi, dan tipe.

## 4. Functional Requirements

- FR1: Migrasi schema - tambah kolom `latitude`, `longitude` (nullable, diisi admin manual karena device tidak mengirim GPS sendiri) ke `Device`.
- FR2: Migrasi schema - tambah enum `DeviceType { UNIT_UTAMA, SIRINE }` + kolom `deviceType` di `Device`. Unit Utama self-register (FR-lama tetap berlaku); Sirine **tidak bisa self-register** (air-gapped, ESP-NOW only) - dibuat manual oleh admin via endpoint Protected baru.
- FR3: Payload `POST /device/heartbeat` diperluas membawa field opsional `sirensStatus: [{deviceCode, connectivity, rssi?, powerStatus?}]` - Unit Utama melaporkan status Sirine yang terjangkau olehnya, backend meng-upsert snapshot per Sirine (kolom baru, lihat FR4).
- FR4: Migrasi schema - tambah kolom snapshot status (mis. JSON `sirenStatusSnapshot` atau tabel kecil terpisah - keputusan teknis ke Architecture, bukan dipatok di sini) untuk menyimpan hasil FR3.
- FR5: Backend menolak (400/409) kalau `deviceCode` di `/register` atau `/heartbeat` terdaftar sebagai `deviceType=SIRINE` - safeguard karena Sirine secara fisik tidak mungkin memanggil endpoint ini sendiri.
- FR6: CRUD metadata (lokasi, nama) untuk kedua tipe perangkat oleh admin/operator (`device.manage`).
- FR7: Skema autentikasi perangkat mengikuti ketetapan kontrak perangkat.

## 5. Acceptance Criteria

- AC1: Migrasi berhasil, `Device` existing (data yang sudah live) tidak rusak - `latitude`/`longitude`/`deviceType` nullable/default aman untuk baris lama.
- AC2: Unit Utama baru register → otomatis `deviceType=UNIT_UTAMA`.
- AC3: Admin membuat entri Sirine manual → `deviceType=SIRINE`, tidak bisa dipilih self-register.
- AC4: Heartbeat dengan `sirensStatus[]` terisi → snapshot status per Sirine ter-update, terlihat di panel admin.
- AC5: Percobaan `/register` atau `/heartbeat` dengan `deviceCode` milik Sirine → ditolak 409.
- AC6: Request perangkat tanpa kredensial valid ditolak.

## 6. Edge Case & Error Handling

- Sirine dibuat admin tapi belum pernah dapat laporan status dari Unit Utama manapun - tampilkan "Belum ada laporan status", bukan error.
- Field `latitude`/`longitude` kosong (device lama pra-migrasi belum diisi admin) - tampil "Lokasi belum diatur", bukan crash di peta manapun yang menampilkannya.

## 7. Data Terkait

`devices` dan perluasannya pada `planned_data_model.md`.

## 8. Dependency

Struktur snapshot status Sirine (JSON atau tabel terpisah) ditetapkan sebelum FR4 diimplementasikan.
