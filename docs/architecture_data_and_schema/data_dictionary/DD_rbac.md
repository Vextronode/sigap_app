# Data Dictionary - Domain: RBAC (Role-Based Access Control)

## Entity: `roles`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | TEXT | Primary key | - |
| name | TEXT, UNIQUE | Nama role | `admin`, `operator` |
| description | TEXT, NULLABLE | Deskripsi role | - |

## Entity: `permissions`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | TEXT | Primary key | - |
| code | TEXT, UNIQUE | Kode permission | `content.manage` |
| description | TEXT, NULLABLE | Deskripsi | - |

## Entity: `role_permissions`

| Field | Tipe Data | Deskripsi |
|---|---|---|
| roleId | TEXT, FK ke `roles.id`, cascade | Bagian composite primary key |
| permissionId | TEXT, FK ke `permissions.id`, cascade | Bagian composite primary key |

## Entity: `user_roles`

| Field | Tipe Data | Deskripsi |
|---|---|---|
| userId | TEXT, FK ke `users.id`, cascade | Bagian composite primary key |
| roleId | TEXT, FK ke `roles.id`, cascade | Bagian composite primary key |

## Seed Data

| Role | Permission |
|---|---|
| admin | `content.manage`, `alert.validate`, `device.view`, `device.manage`, `siren.view`, `user.manage` |
| operator | `content.manage`, `alert.validate`, `device.view`, `siren.view`, `siren.trigger` |

## Pemakaian Permission

| Permission | Dipakai Route |
|---|---|
| `content.manage` | Mutasi kontak darurat, titik evakuasi, panduan |
| `user.manage` | Seluruh route manajemen akun |
| `alert.validate`, `device.view`, `device.manage`, `siren.view`, `siren.trigger` | Belum dipakai route |
