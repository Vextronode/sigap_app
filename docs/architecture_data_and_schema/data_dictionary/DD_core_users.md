# Data Dictionary - Domain: Users

## Entity: `users`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | `a1b2c3d4-...` |
| name | VARCHAR(255) | Nama pengguna | `"Budi Santoso"` |
| email | VARCHAR(255) UNIQUE | Email/login | `"budi@cibenda.desa.id"` |
| password_hash | TEXT | Hash kredensial (bukan plaintext) | `"$2b$12$..."` |
| role | VARCHAR(50) | Peran pengguna - permission matrix lengkap masih TBD (PRD 7.1), sementara hanya satu nilai aktif | `"admin_operator"` |
| created_at | TIMESTAMPTZ | Waktu akun dibuat | `2026-07-09T08:00:00Z` |
| updated_at | TIMESTAMPTZ | Waktu terakhir diperbarui | `2026-07-09T08:00:00Z` |
