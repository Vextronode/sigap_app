# FS-01 - Login & Sesi

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | Area 1 (Data Contract) |
| Status | Fondasi - blocking semua fitur admin lain |
| Referensi | PRD.md S7 (tabel `users`), S7.1 (Permission Matrix - Closed), DD_rbac.md |

## 1. Ringkasan

Autentikasi berbasis JWT untuk role `admin` dan `operator`, dengan proteksi rate limiting dan single-session enforcement. Gerbang akses ke seluruh endpoint kategori Protected.

## 2. Actor & Akses

`admin`, `operator`. Kedua role memiliki akses fungsional yang sama di seluruh fitur admin, **kecuali** Manajemen Akun & Role (FS-10) yang khusus untuk `admin` - ini satu-satunya pembeda antara kedua role saat ini (keputusan final; menyederhanakan cakupan matrix di DD_rbac.md, perlu diselaraskan - lihat S8). Penentuan siapa memegang role apa tetap kebijakan operasional mitra desa; sistem tidak boleh hardcode/merujuk individu spesifik.

## 3. Alur Fungsional

1. Titik masuk halaman login: route `/login`, diakses via tautan kecil berlabel "Admin" di footer - **bukan** logo utama (logo utama tetap menuju halaman beranda publik, tidak diubah fungsinya). Route tidak disembunyikan secara sengaja - obscurity URL bukan lapisan keamanan; proteksi sepenuhnya bergantung pada autentikasi di langkah berikutnya.
2. User membuka halaman login, input email + password.
3. Backend memeriksa status rate limit akun sebelum validasi kredensial (lihat FR5).
4. Backend validasi kredensial, terbitkan JWT berisi identitas + role + session id, dan menandai session id ini sebagai satu-satunya sesi aktif user tersebut (menggugurkan sesi aktif sebelumnya jika ada).
5. Frontend menyimpan token untuk sesi berjalan, redirect ke dashboard admin.
6. Token disertakan di setiap request Protected (header Authorization), divalidasi termasuk kecocokan session id.
7. Token invalid/expired/tergugurkan oleh login dari device lain → request ditolak, user diarahkan ulang ke login dengan pesan yang sesuai.

## 4. Functional Requirements

- FR1: Endpoint login menerima email + password, mengembalikan JWT + role jika valid.
- FR2: Setiap endpoint Protected memvalidasi JWT (termasuk kecocokan session id) sebelum eksekusi request.
- FR3: Tersedia mekanisme logout yang menginvalidasi sesi di server (bukan hanya hapus token di klien).
- FR4: UI menyembunyikan/menonaktifkan menu Manajemen Akun & Role (FS-10) untuk role `operator`; seluruh menu lain identik untuk kedua role.
- FR5: Rate limiting - maksimal 5 percobaan login gagal berturut-turut dalam 15 menit per akun (dihitung di sisi backend berbasis akun, bukan hanya IP) mengunci akun dari percobaan login baru selama 15 menit.
- FR6: Single active session - login baru untuk user yang sama otomatis menggugurkan sesi aktif sebelumnya di device lain.
- FR7: Reset password dilakukan oleh `admin` lain melalui FS-10 (Manajemen Akun & Role). Tidak ada alur self-service "lupa password" berbasis email di MVP ini.

## 5. Acceptance Criteria

- AC1: Kredensial benar & akun tidak terkunci → redirect ke dashboard admin, token tersimpan, sesi lain (jika ada) otomatis berakhir.
- AC2: Kredensial salah → pesan error generik ("Email atau kata sandi salah"), tidak membedakan mana yang salah.
- AC3: Request ke endpoint Protected tanpa token / token invalid → 401, FE redirect ke login.
- AC4: Role `operator` tidak dapat melihat maupun mengakses menu Manajemen Akun & Role; seluruh menu lain identik dengan `admin`.
- AC5: Token expired saat ada form terbuka dengan perubahan belum tersimpan → FE menampilkan peringatan sebelum redirect paksa ke login.
- AC6: Percobaan login gagal ke-6 dalam 15 menit terakhir → akun terkunci; UI menampilkan pesan eksplisit "Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit."; backend tetap menolak percobaan login meski request dikirim langsung ke API (bypass UI).
- AC7: User login dari device baru saat sesi di device lama masih terbuka → device lama menerima 401 pada request berikutnya dengan pesan "Sesi Anda berakhir karena login dari perangkat lain." (deteksi saat request berikutnya, tidak perlu push realtime - cukup untuk MVP).
- AC8: Reset password oleh admin lain (via FS-10) langsung berlaku pada login berikutnya; sesi aktif akun yang password-nya direset otomatis tergugurkan.

## 6. Edge Case & Error Handling

- Akun terkunci karena rate limit, lalu password-nya direset admin sebelum 15 menit berakhir - kunci rate limit **tetap berlaku**; reset password tidak membuka kunci (mencegah rate-limit-bypass via reset).
- Satu-satunya akun `admin` lupa password tanpa ada admin lain aktif - di luar jangkauan aplikasi; ditangani lewat prosedur operasional manual (akses langsung database oleh Tech Lead), didokumentasikan sebagai runbook terpisah, bukan fitur aplikasi. FS-10 akan mewajibkan minimal satu admin aktif setiap saat untuk meminimalkan skenario ini.
- Dua device login bersamaan dalam window sangat singkat - sesi yang tercatat terakhir di server yang menang; tidak perlu penanganan khusus lain untuk MVP.

## 7. Data Terkait

`users (id, name, email, password, role)` - perlu penambahan kolom berikut (belum ada di Data Model PRD S7, masuk ke Data Dictionary G2):
- `failed_login_count`, `locked_until` - untuk FR5
- `active_session_id` - untuk FR6

## 8. Dependency & Catatan Terbuka

- Penyederhanaan pembeda role (hanya FS-10 yang admin-exclusive) perlu dicocokkan/diselaraskan dengan DD_rbac.md agar tidak ada dua sumber kebenaran yang berbeda soal matrix role.
- Reset password: diputuskan admin-assisted (bukan self-service email) untuk MVP, sesuai prinsip Delivery > Complexity.