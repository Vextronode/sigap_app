# Data Dictionary - Domain: Konten Admin

## Entity: `emergency_contacts`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | TEXT | Primary key | - |
| institution | TEXT | Nama institusi | `Puskesmas Parigi` |
| phone_number | TEXT | Nomor telepon | `0265-639345` |
| is_core | BOOLEAN, default false | Kontak inti hasil seed; tidak dapat dihapus lewat API | `true` |
| icon | TEXT, NULLABLE | Nama preset ikon | - |
| created_at / updated_at | TIMESTAMP | Waktu dibuat dan diperbarui | - |

## Entity: `preparedness_guides`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | TEXT | Primary key | - |
| title | TEXT | Judul panduan | `Langkah Evakuasi Saat Gempa` |
| content | TEXT, NULLABLE | Isi artikel | - |
| external_url | TEXT, NULLABLE | Tautan eksternal | - |
| image_url | TEXT, NULLABLE | Gambar panduan | - |
| source_type | ENUM `GuideSourceType`, default `RESMI` | Jenis sumber | `MITRA` |
| source_label | TEXT, NULLABLE, default `Pemerintah Desa Cibenda` | Label sumber | - |
| published_at | TIMESTAMP | Waktu publikasi | - |
| created_at / updated_at | TIMESTAMP | Waktu dibuat dan diperbarui | - |

Aplikasi mewajibkan salah satu dari `content` atau `external_url` terisi.

## Entity: `evacuation_points`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | TEXT | Primary key | - |
| name | TEXT | Nama titik | `Balai Desa Cibenda` |
| address | TEXT, NULLABLE | Alamat | - |
| latitude | DOUBLE PRECISION | Koordinat lintang | `-7.691` |
| longitude | DOUBLE PRECISION | Koordinat bujur | `108.47` |
| elevation | DOUBLE PRECISION, NULLABLE | Elevasi dalam mdpl | - |
| capacity | INTEGER, NULLABLE | Kapasitas orang | `200` |
| description | TEXT, NULLABLE | Deskripsi | - |
| facilities | TEXT[], default kosong | Daftar fasilitas | - |
| is_core | BOOLEAN, default false | Titik inti; tidak dapat diubah lewat API | - |
| created_at / updated_at | TIMESTAMP | Waktu dibuat dan diperbarui | - |
