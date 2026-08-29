# FS-10 - Manajemen Akun & Role

| | |
|---|---|
| Area Roadmap | Area 5 (Admin-Side) |
| Bergantung Pada | Area 1 (Data Contract), DD_rbac.md, FS-01 |
| Status | Final |
| Referensi | PRD.md S7.1 (Permission Matrix - Closed di sisi sistem), FS-01 S2 & S4 (FR7) |

## 1. Ringkasan

Admin mengelola akun (create/edit/nonaktifkan/reset password) dan menetapkan role (`admin`/`operator`). Fitur ini eksklusif untuk role `admin` - satu-satunya pembeda fungsional antara `admin` dan `operator` di seluruh sistem (keputusan final, FS-01 S2). Penempatan personel adalah kebijakan operasional mitra desa, bukan keputusan sistem.

## 2. Actor & Akses

`admin` saja. `operator` tidak memiliki akses sama sekali ke fitur ini - baik baca maupun tulis (final, tidak lagi terbuka untuk diskusi).

## 3. Alur Fungsional

1. Admin membuka daftar akun (nama, email, role, status aktif/nonaktif).
2. Admin membuat akun baru: input nama, email, password awal, pilih role.
3. Admin dapat mengubah role, menonaktifkan/mengaktifkan kembali akun, atau mereset password akun lain - masing-masing aksi eksplisit, bukan turunan otomatis dari apa pun.
4. Reset password menghasilkan password sementara/baru yang disampaikan admin ke pemilik akun secara off-system (mis. lisan/tertulis langsung) - sistem tidak mengirim email/SMS otomatis (konsisten dengan keputusan admin-assisted reset di FS-01).

## 4. Functional Requirements

- FR1: List akun dengan role dan status aktif - status ditampilkan apa adanya dari flag `is_active`, bukan dihitung dari aktivitas login.
- FR2: Create akun baru dengan role sesuai matrix DD_rbac.md, `is_active` default `true`.
- FR3: Ubah role akun yang sudah ada.
- FR4: Toggle `is_active` (nonaktifkan / aktifkan kembali) - aksi manual eksplisit oleh admin, dua arah (bukan hanya nonaktifkan).
- FR5: Reset password akun lain - admin set password baru langsung, tanpa alur verifikasi email.
- FR6: Sistem mencegah aksi yang akan membuat jumlah akun `admin` aktif menjadi nol (lihat AC4).

## 5. Acceptance Criteria

- AC1: Akun baru dengan role tertentu langsung mendapat izin akses sesuai matrix di DD_rbac.md tanpa konfigurasi tambahan manual.
- AC2: Akun dengan `is_active = false` tidak bisa login (FS-01 AC2 berlaku: pesan error generik, tidak membocorkan status nonaktif secara spesifik).
- AC3: Riwayat aksi akun yang sudah dinonaktifkan (mis. di `siren_action_log`) tetap utuh, tidak terhapus/rusak.
- AC4: Percobaan menonaktifkan akun `admin` terakhir yang aktif → ditolak dengan pesan error jelas ("Tidak dapat menonaktifkan admin terakhir yang aktif").
- AC5: Reset password oleh admin lain → password baru langsung berlaku pada login berikutnya; sesi aktif akun yang direset otomatis tergugurkan (selaras FS-01 AC8).
- AC6: Mengaktifkan kembali akun yang sebelumnya `is_active = false` → akun langsung bisa login normal, tanpa proses reset password wajib (dua aksi independen).

## 6. Edge Case & Error Handling

- Email duplikat saat create akun - ditolak dengan pesan error jelas.
- Admin menonaktifkan akunnya sendiri saat sedang login - diizinkan secara teknis (bukan akun admin terakhir), tapi sesi berjalan langsung berakhir setelah aksi tersimpan.

## 7. Data Terkait

`users (id, name, email, password, role)` + kolom baru (masuk Data Dictionary G2, selaras FS-01 S7):
- `is_active` - boolean, default `true`, diubah manual via FR4.
- `failed_login_count`, `locked_until`, `active_session_id` - sudah didefinisikan di FS-01 S7, direferensikan di sini karena aksi reset password (FR5) berdampak ke `active_session_id`.

## 8. Dependency & Catatan Terbuka

Tidak ada isu terbuka - seluruh poin yang sebelumnya "Perlu Klarifikasi" sudah diputuskan dan diselaraskan dengan FS-01.