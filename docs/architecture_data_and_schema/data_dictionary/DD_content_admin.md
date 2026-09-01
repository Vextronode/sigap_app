# Data Dictionary - Domain: Konten Admin

## Entity: `announcements`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | - |
| title | VARCHAR(255) | Judul pengumuman | `"Perbaikan Jalan Desa"` |
| content | TEXT | Isi pengumuman | `"Perbaikan jalan akan dimulai..."` |
| created_by | UUID (FK → users.id) | Admin pembuat pengumuman | - |
| created_at | TIMESTAMPTZ | - | - |
| updated_at | TIMESTAMPTZ | - | - |

## Entity: `evacuation_points`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | - |
| name | VARCHAR(255) | Nama titik evakuasi | `"Balai Desa Cibenda"` |
| latitude | NUMERIC(9,6) | Koordinat lintang | `-7.691000` |
| longitude | NUMERIC(9,6) | Koordinat bujur | `108.470000` |
| description | TEXT | Deskripsi tambahan | `"Kapasitas 200 orang"` |
| created_at | TIMESTAMPTZ | - | - |
| updated_at | TIMESTAMPTZ | - | - |

## Entity: `evacuation_routes`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | - |
| route_name | VARCHAR(255) | Nama jalur evakuasi | `"Jalur A - Pesisir ke Balai Desa"` |
| geometry | JSONB | Array koordinat jalur (asumsi: bukan tipe spasial PostGIS) | `[{"lat":-7.69,"lng":108.47}, ...]` |
| created_at | TIMESTAMPTZ | - | - |
| updated_at | TIMESTAMPTZ | - | - |

## Entity: `emergency_contacts`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | - |
| institution | VARCHAR(255) | Nama institusi/pihak kontak | `"Puskesmas Cibenda"` |
| phone_number | VARCHAR(30) | Nomor telepon | `"+62-266-xxxxxxx"` |
| created_at | TIMESTAMPTZ | - | - |
| updated_at | TIMESTAMPTZ | - | - |
