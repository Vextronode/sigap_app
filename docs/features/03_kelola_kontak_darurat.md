# FS-03 - Kelola Kontak Darurat

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | Area 1 (Data Contract) |

## 1. Ringkasan

CRUD kontak darurat dengan skema hybrid: 6 kontak inti (Ambulans, Damkar, Polisi, Puskesmas, BPBD, Kantor Desa Cibenda) dapat diedit tapi tidak dapat dihapus dari admin panel; kontak tambahan di luar itu dapat dikelola penuh (create/update/delete) sesuai kebutuhan lapangan.

## 2. Actor & Akses

`admin`, `operator` (Protected - akses tulis terbatas pada kategori ini, PRD S5.2). Tidak ada pembeda hak akses antara admin dan operator di fitur ini.

## 3. Alur Fungsional

1. Admin/operator membuka daftar kontak darurat - 6 kontak inti ditandai visual berbeda (mis. badge "Inti") dari kontak tambahan.
2. Untuk kontak inti: hanya opsi edit (nama institusi, nomor) yang tersedia; opsi hapus disembunyikan/dinonaktifkan.
3. Untuk kontak tambahan: opsi create, edit, delete tersedia penuh.
4. Perubahan langsung tercermin di endpoint publik yang dikonsumsi dashboard warga.

## 4. Functional Requirements

- FR1: List seluruh kontak darurat, kontak inti ditampilkan dengan penanda visual berbeda.
- FR2: Update institusi, nomor telepon, dan ikon berlaku untuk kontak inti maupun tambahan.
- FR3: Create & delete hanya berlaku untuk kontak non-inti (`is_core = false`).
- FR4: Backend menolak request delete terhadap entri dengan `is_core = true` dengan status 400.
- FR5: Field `institution` dan `phone_number` **wajib diisi (NOT NULL)** untuk seluruh entri, tanpa pengecualian - entri dengan nomor belum tersedia tidak dibuat, bukan dibuat dengan field kosong.

## 5. Acceptance Criteria

- AC1: Tambah kontak baru (non-inti) dengan data valid → muncul di daftar publik, `is_core = false`.
- AC2: Ubah nama/nomor kontak inti → perubahan tersimpan, entri tetap `is_core = true`.
- AC3: Percobaan hapus kontak inti dari UI → opsi tidak tersedia; percobaan hapus langsung via API → ditolak dengan error eksplisit, bukan silent-fail.
- AC4: Submit dengan `institution` atau `phone_number` kosong (kontak jenis apa pun) → ditolak dengan pesan error jelas, tidak tersimpan.
- AC5: Hapus kontak non-inti → perubahan tercermin di publik tanpa perlu deploy ulang.

## 6. Edge Case & Error Handling

- Hapus kontak non-inti yang sedang ditampilkan di halaman publik saat diakses bersamaan - tidak menyebabkan error di sisi warga, cukup hilang dari list berikutnya (soft consistency cukup, tidak perlu locking).
- Duplikasi entri (institusi sama) - tidak divalidasi khusus; bukan constraint database.
- Seluruh 6 kontak inti sudah ditentukan sejak awal (seed data saat setup, bukan dibuat manual oleh admin pertama kali) - memastikan `is_core` set benar sejak awal, tidak bergantung admin menandainya secara manual.

## 7. Data Terkait

`emergency_contacts`, lihat `DD_content_admin.md`.

## 8. Dependency

Seed awal menyediakan 6 kontak inti.