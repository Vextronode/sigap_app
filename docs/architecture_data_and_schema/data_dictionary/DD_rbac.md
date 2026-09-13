# Data Dictionary - Domain: RBAC (Role-Based Access Control)

## Entity: `roles`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | - |
| name | VARCHAR(50) UNIQUE | Nama role | `"admin"`, `"operator"` |
| description | TEXT | Deskripsi singkat role | `"Mengelola konten desa"` |

## Entity: `permissions`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | UUID | Primary key | - |
| code | VARCHAR(100) UNIQUE | Kode permission, dipakai middleware | `"content.manage"`, `"alert.validate"` |
| description | TEXT | Deskripsi | `"Validasi alert yang masuk"` |

## Entity: `role_permissions` (junction table)

| Field | Tipe Data | Deskripsi |
|---|---|---|
| role_id | UUID (FK → roles.id) | - |
| permission_id | UUID (FK → permissions.id) | - |

## Entity: `user_roles` (junction table)

| Field | Tipe Data | Deskripsi |
|---|---|---|
| user_id | UUID (FK → users.id) | - |
| role_id | UUID (FK → roles.id) | - |

## Seed Data Awal

| Role | Permission |
|---|---|
| admin | content.manage, alert.validate, device.view, device.manage, siren.view, user.manage |
| operator | content.manage, alert.validate, device.view, siren.view, siren.trigger |

Permission `siren.trigger` saat penulisan dokumen ini masih *reserved* (route belum ada di kode). Protokol dan desain route-nya **sudah final** sejak sesi desain keamanan sirine (lihat FS-09, backlog Story `SIGAP-T2-E2-S9`) - cooldown 60 detik, eskalasi RED memotong cooldown, konfirmasi 2-langkah untuk level RED. Satu bagian yang masih terbuka murni di level firmware: mekanisme konfirmasi RED untuk tombol *fisik* (diusulkan tekan-tahan 2 detik, menunggu konfirmasi Tim IoT terhadap kelayakan firmware yang sudah tahap finishing).
Permission ini disiapkan supaya begitu keputusan closed, tinggal dipasang ke route, tanpa perlu migrasi skema tambahan.
