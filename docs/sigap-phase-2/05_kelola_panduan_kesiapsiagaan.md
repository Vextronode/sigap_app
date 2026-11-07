# FS-05 - Kelola Panduan Kesiapsiagaan

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | Area 1 (Data Contract) |

## 1. Ringkasan

Admin mengelola panduan kesiapsiagaan dalam dua mode input: artikel langsung (konten ditulis di sistem) atau tautan eksternal.

## 2. Actor & Akses

`admin`, `operator` (Protected).

## 3. Alur Fungsional

1. Admin membuat entri panduan baru, memilih salah satu mode: tulis artikel (`content`) atau tempel tautan eksternal (`external_url`).
2. Admin mengisi metadata: `source_type` (resmi/mitra), waktu publikasi.
3. Panduan tersimpan dan muncul di endpoint publik (list/detail).

## 4. Functional Requirements

- FR1: Create/update/delete entri panduan.
- FR2: Constraint: minimal salah satu dari `content` atau `external_url` harus terisi (keduanya boleh kosong bersamaan **tidak** valid).
- FR3: Field `source_type` bernilai `RESMI` atau `MITRA`, dengan default `RESMI`.
- FR4: `published_at` diisi waktu penyimpanan bila tidak dikirim.
- FR5: Gambar panduan wajib diunggah saat pembuatan.

## 5. Acceptance Criteria

- AC1: Simpan entri dengan hanya `content` terisi → valid, tersimpan.
- AC2: Simpan entri dengan hanya `external_url` terisi → valid, tersimpan.
- AC3: Simpan entri dengan keduanya kosong → ditolak dengan pesan error jelas.
- AC4: Entri dengan `external_url` menampilkan tautan yang dapat diklik di sisi publik, bukan mencoba merender konten eksternal secara langsung.

## 6. Edge Case & Error Handling

- `external_url` mengarah ke tautan mati/tidak valid - tidak divalidasi ketersediaannya secara realtime di MVP (validasi format URL saja).
- Kedua field terisi bersamaan diizinkan.

## 7. Data Terkait

`preparedness_guides`, lihat `DD_content_admin.md`.
