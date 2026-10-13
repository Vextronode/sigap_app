# Data Dictionary - Domain: Users

## Entity: `users`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | `a1b2c3d4-...` |
| name | VARCHAR(255) | Nama pengguna | `"Budi Santoso"` |
| email | VARCHAR(255) UNIQUE | Email/login | `"budi@cibenda.desa.id"` |
| password | TEXT | Hash kredensial bcrypt (bukan plaintext) - **nama kolom perlu diverifikasi**, lihat catatan `002_users.sql` | `"$2b$10$..."` |
| created_at | TIMESTAMPTZ | Waktu akun dibuat | `2026-07-09T08:00:00Z` |
| updated_at | TIMESTAMPTZ | Waktu terakhir diperbarui | `2026-07-09T08:00:00Z` |

**Catatan:** role pengguna **tidak lagi** disimpan di tabel ini - digantikan struktur RBAC penuh (`roles`, `permissions`, `role_permissions`, `user_roles`), lihat `DD_rbac.md`. Permission matrix yang sebelumnya berstatus TBD (PRD S7.1) sudah final dan ter-seed sejak ADR-006/ADR-007.