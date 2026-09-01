# FS-11 - Dashboard Admin

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | Area 1 (Data Contract) |
| Status | Draft - menunggu FS-06 untuk data konektivitas perangkat (section tetap didesain sekarang, implementasi penuh menyusul) |
| Referensi | PRD.md S3.1, S6 (External APIs), S5.4 (Offline Capability) |

## 1. Ringkasan

Halaman pertama admin setelah login. Isinya sebagian besar **identik dengan dashboard publik** (monitoring lingkungan & kesiapsiagaan), ditambah dua section khusus admin di bawahnya untuk kondisi operasional sistem. Seluruh aksi kelola (CRUD kontak, evakuasi, panduan, perangkat, dll.) **tidak** ada di halaman ini - tetap di halaman masing-masing (FS-03, FS-04, FS-05, dst.).

## 2. Actor & Akses

`admin`, `operator` (Protected, read-only sepenuhnya - tidak ada aksi tulis di halaman ini).

## 3. Struktur Halaman

**Section 1-2 (identik publik):**
- Monitoring Lingkungan - ringkasan cuaca, seismik, potensi tsunami (sama seperti yang warga lihat).
- Kesiapsiagaan - ringkasan jalur/titik evakuasi & kontak darurat (sama seperti publik).

**Section 3 (baru) - Kondisi Perangkat IoT:**
- Ringkasan angka: total perangkat, jumlah online, jumlah offline.
- Tabel per perangkat: nama, lokasi (nama titik), status konektivitas (Online/Offline), level saat ini (warna Hijau/Kuning/Merah), waktu terakhir terhubung (`last_seen_at`).

**Section 4 (baru) - Kondisi Sumber Data Eksternal:**
- Tabel per sumber (BMKG, USGS, OpenWeatherMap, AI API): status koneksi terakhir (Terhubung/Terputus/Data Basi), waktu update data terakhir berhasil ditarik.

## 4. Functional Requirements

- FR1: Section 1-2 menggunakan komponen/data yang sama persis dengan dashboard publik (tidak ada logika ganda).
- FR2: Section 3 menampilkan status seluruh perangkat terdaftar; klik satu baris **tidak** membuka aksi edit (murni informasi, sesuai batasan "manajemen di halaman lain").
- FR3: Section 4 menampilkan status seluruh sumber data eksternal aktif sesuai PRD S6.
- FR4: Setiap section menampilkan status errornya sendiri secara independen jika gagal dimuat - tidak membuat seluruh halaman gagal render.

## 5. Acceptance Criteria

- AC1: Data Section 1-2 identik nilainya dengan yang tampil di dashboard publik pada waktu yang sama.
- AC2: Perangkat yang `last_seen_at`-nya melewati ambang waktu tertentu tampil sebagai Offline di Section 3 (ambang pasti - lihat S8, menunggu FS-06).
- AC3: Sumber data yang gagal ditarik pada percobaan terakhir tampil sebagai "Terputus"/"Data Basi" di Section 4, disertai waktu update terakhir yang berhasil (bukan waktu percobaan gagal).
- AC4: Halaman tetap bisa dimuat meski Section 3 atau 4 gagal ambil data - section lain tetap tampil normal.

## 6. Edge Case & Error Handling

- Belum ada perangkat terdaftar sama sekali - Section 3 menampilkan status kosong yang jelas ("Belum ada perangkat terdaftar"), bukan tabel kosong tanpa keterangan.
- Semua sumber data down bersamaan - Section 4 tetap menampilkan seluruh baris dengan status Terputus, bukan menyembunyikan section.

## 7. Data Terkait

Baca-saja dari `iot_devices` (Section 3, lihat FS-06) dan metadata fetch sumber eksternal (Section 4) - struktur log/metadata sumber eksternal belum ada di Data Model, perlu ditambahkan (kandidat: tabel kecil `external_source_status` atau in-memory/cache saja - keputusan teknis ke Architecture Document).

## 8. Dependency & Catatan Terbuka

- Section 3 didesain sekarang, tapi datanya bergantung penuh pada FS-06 yang sedang ditunda - implementasi Section 3 realistisnya menyusul setelah FS-06 dikerjakan.
- Ambang waktu "offline" untuk Section 3 mengikuti keputusan yang sama yang masih terbuka di FS-06 (**Perlu Klarifikasi**, belum diputuskan).
- Ambang waktu "Data Basi" untuk Section 4 (berapa lama tanpa update dianggap basi, per sumber) - **Perlu Klarifikasi**, belum ada di dokumen manapun, kemungkinan berbeda-beda per sumber (cuaca vs seismik punya siklus update yang beda).