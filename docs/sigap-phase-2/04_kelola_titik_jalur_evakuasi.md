# FS-04 - Kelola Titik Evakuasi

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Keputusan Terkait | ADR-032 |

## 1. Ringkasan

Admin dan operator mengelola titik evakuasi yang ditampilkan pada peta publik.

## 2. Actor dan Akses

`admin`, `operator` (Protected, permission `content.manage`).

## 3. Alur Fungsional

1. Admin membuka daftar titik evakuasi beserta peta.
2. Admin mengisi nama, koordinat melalui klik peta atau input manual, alamat, elevasi, kapasitas, deskripsi, dan fasilitas.
3. Data tersimpan langsung tersedia pada endpoint publik `evacuation-points`.

## 4. Functional Requirements

- FR1: CRUD titik evakuasi.
- FR2: Koordinat dapat diinput melalui peta atau angka.
- FR3: Latitude berada pada -90 sampai 90, dan longitude pada -180 sampai 180.
- FR4: Field `isCore` tidak dapat diubah melalui API.

## 5. Acceptance Criteria

- AC1: Titik baru tersimpan dan langsung muncul di peta publik.
- AC2: Koordinat di luar rentang ditolak dengan pesan error.
- AC3: Nama kurang dari 3 karakter ditolak.

## 6. Edge Case dan Error Handling

- Titik duplikat secara lokasi tidak divalidasi khusus dan menjadi tanggung jawab operator.

## 7. Data Terkait

`evacuation_points`, lihat `DD_content_admin.md`.
