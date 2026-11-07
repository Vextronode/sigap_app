# FS-01 - Login & Sesi

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | Rate limiting, lockout, dan logout pada backend |

## 1. Ringkasan

Frontend login + route guard berbasis permission (bukan role tunggal - lihat FS-10 untuk model RBAC nyata), dikonsumsi dari backend yang sudah mengembalikan JWT berisi `roles` dan `permissions`.

## 2. Actor & Akses

`admin`, `operator` - dibedakan lewat permission yang dibawa token (lihat FS-10), bukan field `role` tunggal.

## 3. Alur Fungsional

1. Pengguna membuka halaman login, lalu mengisi email dan password.
2. Backend memvalidasi kredensial dan menerbitkan JWT berisi `roles` dan `permissions`.
3. Frontend menyimpan token dan mengarahkan pengguna ke dashboard admin.
4. Token disertakan pada setiap request Protected.
5. Logout mencabut token di server melalui `POST /api/protected/auth/logout`.
6. Token tidak valid atau kedaluwarsa mengarahkan pengguna ke halaman login.

## 4. Functional Requirements

- FR1: Frontend mengikuti kontrak response login pada `api_spec/`.
- FR2: Route guard memeriksa sesi login. Menu admin mengikuti role pada token, dan backend menegakkan permission.
- FR3: Frontend memanggil endpoint logout saat pengguna logout.
- FR4: Frontend menampilkan pesan saat request ditolak karena rate limit atau akun terkunci.

## 5. Acceptance Criteria

- AC1: Kredensial benar mengarahkan ke dashboard, dan menu mengikuti role pada token.
- AC2: Kredensial salah menghasilkan pesan generik yang tidak membedakan email atau password.
- AC3: Request Protected tanpa token atau dengan token tidak valid menghasilkan 401 dan pengalihan ke login.
- AC4: Menu Manajemen Akun hanya tampil untuk role `admin`, dan backend menolak pengguna tanpa `user.manage` dengan 403.
- AC5: Logout mencabut token di server.

## 6. Edge Case dan Error Handling

- Rate limit dan lockout: frontend menampilkan pesan dari backend.
- Reset password dilakukan melalui FS-10.

## 7. Data Terkait

`users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `revoked_tokens`.
