# FS-05 - Kelola Panduan Kesiapsiagaan

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | Area 1 (Data Contract) |
| Status | Draft - entitas baru di Tahap 2 |
| Referensi | Roadmap S2.2 #1-2 |

## 1. Ringkasan

Fitur baru di Tahap 2. Admin mengelola panduan kesiapsiagaan dalam dua mode input: artikel langsung (konten ditulis di sistem) atau tautan eksternal.

## 2. Actor & Akses

`admin`, `operator` (Protected).

## 3. Alur Fungsional

1. Admin membuat entri panduan baru, memilih salah satu mode: tulis artikel (`content`) atau tempel tautan eksternal (`external_url`).
2. Admin mengisi metadata: `source_type` (resmi/mitra), waktu publikasi.
3. Panduan tersimpan dan muncul di endpoint publik (list/detail).

## 4. Functional Requirements

- FR1: Create/update/delete entri panduan.
- FR2: Constraint: minimal salah satu dari `content` atau `external_url` harus terisi (keduanya boleh kosong bersamaan **tidak** valid).
- FR3: Field `source_type` wajib dipilih dari nilai tetap: resmi / mitra.
- FR4: `published_at` diisi otomatis saat publish atau dapat dijadwalkan (**Perlu Klarifikasi** - lihat bagian 8).

## 5. Acceptance Criteria

- AC1: Simpan entri dengan hanya `content` terisi → valid, tersimpan.
- AC2: Simpan entri dengan hanya `external_url` terisi → valid, tersimpan.
- AC3: Simpan entri dengan keduanya kosong → ditolak dengan pesan error jelas.
- AC4: Entri dengan `external_url` menampilkan tautan yang dapat diklik di sisi publik, bukan mencoba merender konten eksternal secara langsung.

## 6. Edge Case & Error Handling

- `external_url` mengarah ke tautan mati/tidak valid - tidak divalidasi ketersediaannya secara realtime di MVP (validasi format URL saja).
- Kedua field terisi bersamaan (content + external_url) - diizinkan; UI publik menampilkan prioritas ke `content` (**Perlu Klarifikasi**: urutan prioritas tampilan belum ditentukan di sumber dokumen).

## 7. Data Terkait

`preparedness_guides (id, content, external_url, source_type, published_at)` - struktur field mengikuti Roadmap S2.2 #1, field-level constraint detail tetap tanggung jawab Data Dictionary.

## 8. Dependency & Catatan Terbuka

**Perlu Klarifikasi:**
- Apakah `published_at` mendukung penjadwalan (publish di masa depan) atau selalu langsung publish saat disimpan - tidak disebutkan di Roadmap.
- Prioritas tampilan saat `content` dan `external_url` sama-sama terisi.
