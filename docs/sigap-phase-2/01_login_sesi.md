# FS-01 - Login & Sesi

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | SEC-2 (Rate Limiting & Lockout), SEC-3 (Session Hardening & Logout) |
| Status | Final - direvisi pasca-audit kode (backend login sudah lebih matang dari asumsi awal) |
| Referensi | PRD.md S7 (tabel `users`), S7.1, DD_rbac.md, Laporan Audit Endpoint & Security (lihat Peta Referensi Backlog) |

## 0. Catatan Revisi

Versi awal FS-01 menulis rate limiting, single-session enforcement, dan reset password sebagai bagian dari story ini - audit kode menemukan backend login (JWT, bcrypt, roles+permissions di token) **sudah terimplementasi lebih matang** dari asumsi awal, sementara rate limiting/lockout, session hardening, dan logout **sama sekali belum ada**. Ketiga hal terakhir dipindahkan jadi Story tersendiri di Epic E0 (Security) - `SEC-2`, `SEC-3` - supaya dikerjakan dedicated oleh SEC, bukan numpang di FS-01. Reset password admin-assisted (FR7 versi lama) juga dipindah ke FS-10, karena secara alami itu aksi *terhadap akun lain*, bukan bagian dari alur login akun sendiri.

FS-01 sekarang **hanya** mencakup: kontrak response login yang sudah sesuai redesign, dan sisi frontend (halaman, route guard, menu gating berbasis permission).

## 1. Ringkasan

Frontend login + route guard berbasis permission (bukan role tunggal - lihat FS-10 untuk model RBAC nyata), dikonsumsi dari backend yang sudah mengembalikan JWT berisi `roles` dan `permissions`.

## 2. Actor & Akses

`admin`, `operator` - dibedakan lewat permission yang dibawa token (lihat FS-10), bukan field `role` tunggal.

## 3. Alur Fungsional

1. User membuka halaman login, input email + password.
2. Backend (sudah ada) validasi kredensial (bcrypt compare), terbitkan JWT berisi `roles` + `permissions` dari tabel `Role`/`Permission`/`UserRole`.
3. Frontend menyimpan token, redirect ke dashboard admin.
4. Token disertakan di setiap request Protected.
5. Logout (SEC-3) menginvalidasi sesi di server - frontend memanggil endpoint ini, bukan sekadar hapus token lokal.
6. Token invalid/expired/tergugurkan oleh login device lain (SEC-3) → redirect ke login.

## 4. Functional Requirements

- FR1: Frontend memverifikasi shape response login sesuai kontrak redesign (`token`, `expiresIn`, `user.{id,name,email}` + roles/permissions) - **backend sudah ada, ini tugas verifikasi/wiring, bukan bangun baru**.
- FR2: Route guard & menu gating di frontend berdasarkan `permissions` dari token (mis. sembunyikan menu Manajemen Akun kalau tidak ada `user.manage`) - bukan lagi berdasarkan single role string.
- FR3: Frontend memanggil endpoint logout (`SEC-3`) saat user logout - tidak cukup hapus token di localStorage saja.
- FR4: Frontend menampilkan pesan eksplisit saat request ditolak karena rate limit (`SEC-2`) atau sesi tergugurkan oleh device lain (`SEC-3`) - pesan-pesan ini sudah didesain di FS lama, sekarang tinggal di-wire ke response error backend yang sebenarnya.

## 5. Acceptance Criteria

- AC1: Kredensial benar → redirect dashboard, token tersimpan, menu yang tampil sesuai `permissions` di token (bukan hardcode per role).
- AC2: Kredensial salah → pesan error generik (backend sudah mengembalikan ini dengan benar - `"Email atau password salah."`, tidak membedakan mana yang salah).
- AC3: Request ke endpoint Protected tanpa token/invalid → 401, redirect ke login.
- AC4: User tanpa `user.manage` tidak melihat/mengakses menu Manajemen Akun (FS-10) - permission spesifik, bukan cek role generik.
- AC5: Klik logout → token diinvalidasi di server (via SEC-3), bukan hanya hilang dari klien.

## 6. Edge Case & Error Handling

- Rate limiting/lockout - **dipindah ke SEC-2**, FS-01 hanya perlu menampilkan pesan yang backend kirim.
- Sesi ganda dari device berbeda - **dipindah ke SEC-3**, FS-01 hanya perlu menangani redirect saat token ditolak karena ini.
- Reset password - **dipindah ke FS-10** (aksi admin lain terhadap akun, bukan alur login sendiri).

## 7. Data Terkait

`User`, `Role`, `Permission`, `RolePermission`, `UserRole` (skema nyata sudah ada, lihat FS-10 untuk detail).

## 8. Dependency & Catatan Terbuka

- **Blocking dari FS-01 ke SEC-3**: frontend logout (FR3) tidak bisa selesai sebelum endpoint logout backend (SEC-3) ada.
- **Blocking dari FS-01 ke SEC-2**: pesan lockout (FR4) tidak bisa diuji end-to-end sebelum SEC-2 selesai.
- Tidak ada lagi item "Perlu Klarifikasi" tersisa di story ini - semua yang dulu belum jelas (reset password, rate limit, single-session) sudah py punya rumah story yang jelas di Epic E0/FS-10.