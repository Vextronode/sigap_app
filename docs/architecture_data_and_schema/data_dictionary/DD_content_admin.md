# Data Dictionary - Domain: Konten Admin

## Entity: `announcements` *(DEPRECATED)*

CRUD lokal tidak aktif sejak Roadmap Tahap 2 - sumber data pindah jadi proxy read-only dari SID. Struktur tabel dipertahankan sebagai catatan historis, tidak menerima tulisan baru.

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | UUID | Primary key |
| title | VARCHAR(255) | Judul pengumuman |
| content | TEXT | Isi pengumuman |
| created_by | UUID (FK → users.id) | Admin pembuat |
| created_at / updated_at | TIMESTAMPTZ | - |

## Entity: `evacuation_points` *(desain, belum live)*

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | - |
| name | VARCHAR(255) | Nama titik evakuasi | `"Balai Desa Cibenda"` |
| latitude | NUMERIC(9,6) | Koordinat lintang | `-7.691000` |
| longitude | NUMERIC(9,6) | Koordinat bujur | `108.470000` |
| description | TEXT | Deskripsi tambahan | `"Kapasitas 200 orang"` |
| created_at / updated_at | TIMESTAMPTZ | - | - |

## Entity: `evacuation_routes` *(desain, belum live)*

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | - |
| route_name | VARCHAR(255) | Nama jalur evakuasi | `"Jalur A - Pesisir ke Balai Desa"` |
| geometry | JSONB | Array koordinat jalur | `[{"lat":-7.69,"lng":108.47}, ...]` |
| created_at / updated_at | TIMESTAMPTZ | - | - |

## Entity: `emergency_contacts` *(live)*

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | - |
| institution | VARCHAR(255) | Nama institusi | `"Puskesmas Cibenda"` |
| phone_number | VARCHAR(30) | Nomor telepon | `"+62-266-xxxxxxx"` |
| is_core | BOOLEAN | `true` untuk 6 kontak inti (FS-03), tidak dapat dihapus lewat API manapun | `true` |
| created_at / updated_at | TIMESTAMPTZ | - | - |

## Entity: `preparedness_guides` *(live, baru ditambahkan ke domain ini)*

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | - |
| title | VARCHAR(255) | Judul panduan | `"Langkah Evakuasi Saat Gempa"` |
| content | TEXT, NULLABLE | Isi artikel (mode 1) | - |
| external_url | TEXT, NULLABLE | Tautan eksternal (mode 2) | - |
| source_type | ENUM `guide_source_type` | `RESMI` / `MITRA` | `"RESMI"` |
| published_at | TIMESTAMPTZ | Waktu publikasi | - |
| created_at / updated_at | TIMESTAMPTZ | - | - |

**Constraint:** minimal salah satu `content`/`external_url` wajib terisi (FS-05), ditegakkan lewat `CHECK` di database.