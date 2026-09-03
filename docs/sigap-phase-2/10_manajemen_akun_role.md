# FS-10 - Manajemen Akun & Role

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | Area 1 (Data Contract), SEC-1 (RBAC Enforcement Middleware) |
| Status | Final - direvisi total pasca-audit kode (skema RBAC nyata sudah jauh lebih matang dari asumsi field tunggal) |
| Referensi | PRD.md S7.1, Laporan Audit Endpoint (lihat Peta Referensi Backlog) |

## 0. Catatan Revisi

Versi awal FS-10 mengasumsikan `users.role` sebagai satu kolom enum (`admin`/`operator`). Audit menemukan skema nyata jauh lebih matang - sudah ada tabel `Role`, `Permission`, `RolePermission` (many-to-many role↔permission), dan `UserRole` (many-to-many user↔role), lengkap dengan **seed data permission** yang granular (`content.manage`, `alert.validate`, `device.view`, `device.manage`, `siren.view`, `siren.trigger`, `user.manage`). Story ini didesain ulang total mengikuti skema ini - bukan menambah field baru ke asumsi lama.

**Keputusan yang saya ambil**: meski `UserRole` secara teknis mendukung multi-role per user, kita **tetap menegakkan satu role per user sebagai aturan bisnis** (guard di level aplikasi, bukan constraint database) - konsisten dengan seluruh keputusan sebelumnya (admin/operator, mutually exclusive). Fleksibilitas multi-role yang sudah dibangun developer sebelumnya kita simpan sebagai *future-ready*, tidak dipakai sekarang, sama seperti prinsip "future-ready architecture" di Konteks Umum Program.

## 1. Ringkasan

Admin mengelola akun dan meng-assign **satu Role** (dari tabel `Role` yang sudah di-seed: `admin`/`operator`) ke tiap user via `UserRole`. Reset password admin-assisted (dipindah dari FS-01) juga masuk story ini.

## 2. Actor & Akses

`admin` saja. Guard: `user.manage` - kode permission ini **sudah ada di seed**, hanya untuk role `admin`.

## 3. Alur Fungsional

1. Admin membuka daftar akun - nama, email, nama Role (via `userRoles[0].role.name`), status aktif.
2. Admin membuat akun baru: input nama, email, password awal, pilih **satu** Role dari daftar `Role` yang ada (bukan input bebas).
3. Backend membuat `User` + satu baris `UserRole` yang menghubungkannya ke `Role` terpilih.
4. Admin dapat mengubah Role akun (hapus `UserRole` lama, buat baru - bukan update field), menonaktifkan/aktifkan, atau reset password.

## 4. Functional Requirements

- FR1: List akun dengan nama Role (join `userRoles.role.name`) dan status aktif.
- FR2: Create akun baru + assign tepat satu `UserRole` ke Role yang dipilih dari tabel `Role` yang ada (tidak hardcode string, ambil dari DB - kalau nanti ada Role ketiga, form otomatis menyesuaikan tanpa deploy ulang).
- FR3: Ubah Role akun - implementasi sebagai *replace* `UserRole` (hapus baris lama, insert baru), bukan update in-place, untuk menjaga histori tetap valid kalau `UserRole` punya audit trail di masa depan.
- FR4: Toggle `isActive` *(kolom baru, migrasi - belum ada di schema nyata)*.
- FR5: Reset password akun lain - admin set password baru langsung (dipindah dari FS-01 FR7 versi lama), pakai `hashPassword()` yang **sudah ada** (`password.util.ts`, bcrypt).
- FR6: Guard minimal satu akun dengan Role `admin` yang `isActive=true` harus selalu ada.
- FR7: Endpoint ini dan seluruhnya wajib melalui middleware `requirePermission("user.manage")` dari **SEC-1** - bukan dibangun ulang di sini.

## 5. Acceptance Criteria

- AC1: Akun baru dengan Role terpilih → langsung dapat izin akses sesuai permission yang ter-attach ke Role itu di `RolePermission` (data sudah di-seed, tidak perlu konfigurasi tambahan).
- AC2: Akun `isActive=false` tidak bisa login (pesan error generik sama seperti kredensial salah - tidak membocorkan status nonaktif).
- AC3: Ubah Role akun → baris `UserRole` lama terhapus, baris baru dengan Role baru muncul; token yang sudah terbit sebelumnya (kalau ada sesi aktif) idealnya langsung tidak valid lagi - bergantung SEC-3 (session hardening) untuk invalidasi paksa.
- AC4: Percobaan menonaktifkan admin `isActive=true` terakhir → ditolak 409, pesan jelas.
- AC5: Reset password → password baru langsung berlaku, sesi aktif akun tsb tergugurkan (via SEC-3).
- AC6: Seluruh endpoint di story ini menolak request dari user tanpa permission `user.manage` (403, ditegakkan `SEC-1`, bukan sekadar disembunyikan di UI).

## 6. Edge Case & Error Handling

- Email duplikat saat create - ditolak, pesan jelas.
- Ubah Role saat user yang bersangkutan sedang login - sesi lama idealnya langsung invalid (tergantung implementasi SEC-3, dicatat sebagai dependency, bukan dijamin di story ini sendiri).

## 7. Data Terkait

`User`, `Role`, `Permission`, `RolePermission`, `UserRole` - **seluruhnya sudah ada di schema nyata**, kecuali kolom `isActive` di `User` (migrasi baru, FR4).

## 8. Dependency & Catatan Terbuka

- **Blocking dari SEC-1**: guard `user.manage` di FR7/AC6 tidak bisa ditegakkan sebelum middleware RBAC generik (SEC-1) selesai - urutan di Sprint Plan sudah benar (SEC-1 di Sprint 1, FS-10 di Sprint 2-3).
- **Blocking dari SEC-3**: AC3/AC5 (invalidasi sesi saat Role berubah/password direset) butuh `activeSessionId` yang dibangun SEC-3.
- Kolom `isActive` perlu masuk migrasi resmi sebelum FR4 dikerjakan - bukan asumsi field sudah ada seperti draft lama.