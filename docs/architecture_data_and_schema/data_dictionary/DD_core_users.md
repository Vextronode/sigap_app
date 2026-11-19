# Data Dictionary - Domain: Users

## Entity: `users`

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | TEXT | Primary key |
| name | TEXT | Nama pengguna |
| email | TEXT, UNIQUE | Email login |
| password | TEXT | Hash bcrypt |
| failed_login_count | INTEGER, default 0 | Jumlah gagal login berturut-turut |
| last_failed_login_at | TIMESTAMP, NULLABLE | Waktu gagal login terakhir |
| locked_until | TIMESTAMP, NULLABLE | Akun terkunci sampai waktu ini |
| is_active | BOOLEAN, default true | Status aktif akun |
| last_login_at | TIMESTAMP, NULLABLE | Waktu login terakhir |
| last_login_ip | TEXT, NULLABLE | IP login terakhir |
| token_version | INTEGER, default 0 | Versi sesi; dinaikkan saat akun dinonaktifkan, role berubah, atau password diganti |
| createdAt | TIMESTAMP | Waktu dibuat |
| updatedAt | TIMESTAMP | Waktu diperbarui |

Role pengguna disimpan pada `user_roles`, lihat `DD_rbac.md`.

## Entity: `revoked_tokens`

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | TEXT | Primary key |
| jti | TEXT, UNIQUE | Identifier token yang dicabut |
| user_id | TEXT, FK ke `users.id`, cascade | Pemilik token |
| revoked_at | TIMESTAMP | Waktu pencabutan |
| expires_at | TIMESTAMP | Waktu kedaluwarsa token |

Baris yang sudah kedaluwarsa dihapus saat logout.
