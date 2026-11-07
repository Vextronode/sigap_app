# FS-10 - Manajemen Akun & Role

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Keputusan Terkait | ADR-006, ADR-007, ADR-026 |

## 1. Ringkasan

Admin mengelola akun dan menetapkan satu role (`admin` atau `operator`) untuk setiap pengguna melalui `user_roles`. Satu role per pengguna ditegakkan pada lapisan aplikasi. Admin juga dapat mereset password dan membuka kunci akun.

## 2. Actor & Akses

`admin`, melalui permission `user.manage`.

## 3. Alur Fungsional

1. Admin membuka daftar akun - nama, email, nama Role (via `userRoles[0].role.name`), status aktif.
2. Admin membuat akun baru: input nama, email, password awal, pilih **satu** Role dari daftar `Role` yang ada (bukan input bebas).
3. Backend membuat `User` + satu baris `UserRole` yang menghubungkannya ke `Role` terpilih.
4. Admin dapat mengubah Role akun (hapus `UserRole` lama, buat baru - bukan update field), menonaktifkan/aktifkan, atau reset password.

## 4. Functional Requirements

- FR1: Daftar akun dengan nama role dan status aktif.
- FR2: Membuat akun baru dengan tepat satu role.
- FR3: Mengubah role dengan mengganti baris `user_roles`.
- FR4: Mengaktifkan atau menonaktifkan akun melalui `isActive`.
- FR5: Mereset password akun lain.
- FR6: Minimal satu akun `admin` aktif harus selalu ada.
- FR7: Seluruh endpoint memakai `requirePermission("user.manage")`.
- FR8: Membuka kunci akun yang terkena lockout.

## 5. Acceptance Criteria

- AC1: Akun baru dengan Role terpilih → langsung dapat izin akses sesuai permission yang ter-attach ke Role itu di `RolePermission` (data sudah di-seed, tidak perlu konfigurasi tambahan).
- AC2: Akun `isActive=false` tidak bisa login (pesan error generik sama seperti kredensial salah - tidak membocorkan status nonaktif).
- AC3: Ubah Role akun → baris `UserRole` lama terhapus, baris baru dengan Role baru muncul; token yang terbit sebelumnya tidak berlaku lagi.
- AC4: Percobaan menonaktifkan admin `isActive=true` terakhir → ditolak 409, pesan jelas.
- AC5: Reset password → password baru langsung berlaku, dan token yang terbit sebelumnya tidak berlaku lagi.
- AC6: Seluruh endpoint di story ini menolak request dari user tanpa permission `user.manage` (403).

## 6. Edge Case & Error Handling

- Email duplikat saat create - ditolak, pesan jelas.

## 7. Data Terkait

`users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `revoked_tokens`.
