# FS-04 - Kelola Titik & Jalur Evakuasi

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | Area 1 (Data Contract), Area 3 (Peta Evakuasi Interaktif) |
| Status | Draft - menyusul Area 3 selesai |
| Referensi | PRD.md S3.1, Roadmap S3 (Area 3), S5 (item A.5) |

## 1. Ringkasan

CRUD titik evakuasi dan jalur evakuasi yang sebelumnya hardcode di client, dimigrasikan ke data model + Leaflet (Area 3). Admin mengelola data yang sama yang dikonsumsi peta interaktif publik.

## 2. Actor & Akses

`admin`, `operator` (Protected).

## 3. Alur Fungsional

1. Admin membuka manajemen titik evakuasi: list + peta (Leaflet) untuk menambah/memindah pin.
2. Admin input nama, koordinat (via klik peta atau input manual), deskripsi.
3. Admin mengelola jalur evakuasi terpisah (mengaitkan geometry rute ke titik-titik terkait).
4. Data tersimpan dikonsumsi ulang oleh endpoint publik `evacuation_points` / `evacuation_routes`.

## 4. Functional Requirements

- FR1: CRUD titik evakuasi (nama, lat/lng, deskripsi).
- FR2: CRUD jalur evakuasi (nama rute, geometry).
- FR3: Input koordinat titik dapat dilakukan via pin-drop di peta, bukan hanya input angka manual.
- FR4: Validasi koordinat berada dalam rentang valid (lat -90..90, lng -180..180) minimal di level FE/BE.

## 5. Acceptance Criteria

- AC1: Titik baru tersimpan dan langsung muncul di peta publik.
- AC2: Jalur evakuasi baru tervisualisasi sebagai polyline di peta admin sebelum disimpan (preview).
- AC3: Hapus titik yang masih direferensikan oleh suatu jalur → sistem memberi peringatan, tidak menghapus diam-diam tanpa konfirmasi.
- AC4: Input koordinat di luar rentang valid → ditolak dengan pesan error.

## 6. Edge Case & Error Handling

- Titik/jalur duplikat secara lokasi - tidak divalidasi khusus, tanggung jawab operator.
- Geometry jalur kompleks (self-intersecting) - tidak divalidasi secara topologi di MVP, hanya divisualisasikan apa adanya.

## 7. Data Terkait

`evacuation_points (id, name, latitude, longitude, description)`
`evacuation_routes (id, route_name, geometry)`

## 8. Dependency & Catatan Terbuka

Fitur ini secara teknis menunggu Area 3 (integrasi Leaflet) selesai di sisi publik sebelum tooling admin bisa reuse komponen peta yang sama - lihat Roadmap S3 (Area 3 → Area 5 sebagian bergantung Area 3 untuk data model evakuasi).
