# Data Dictionary - SIGAP

## 1. Cakupan

Data Dictionary mencatat tabel yang ada di database. Sumber skema adalah `apps/backend/prisma/schema.prisma`, dengan DDL per domain di `architecture_data_and_schema/schemas/`.

## 2. Struktur Folder

| Data Dictionary | Domain | Skema SQL |
|---|---|---|
| - | Tipe enum | `001_core_types.sql` |
| `DD_core_users.md` | Pengguna dan sesi | `002_users.sql` |
| `DD_content_admin.md` | Kontak darurat, panduan, titik evakuasi | `003_content_admin.sql` |
| `DD_environmental.md` | Alert, gempa, notifikasi | `004_environmental.sql` |
| `DD_iot_kesiapsiagaan.md` | Perangkat | `005_iot_kesiapsiagaan.sql` |
| `DD_rbac.md` | Role dan permission | `006_rbac.sql` |

## 3. Konvensi

- Primary key `id` bertipe `TEXT`, berisi UUID yang dibuat oleh Prisma.
- Timestamp bertipe `TIMESTAMP(3)`.
- Nama kolom mengikuti pemetaan Prisma. Kolom tanpa `@map` memakai `camelCase`, misalnya `createdAt` pada `users` dan `roleId` pada tabel junction.

## 4. Enum

| Enum | Nilai |
|---|---|
| `AlertLevel` | `GREEN`, `YELLOW`, `ORANGE`, `RED` |
| `DeviceStatus` | `ONLINE`, `OFFLINE` |
| `alert_review_status` | `Belum Ditinjau`, `Dikonfirmasi`, `Ditolak`, `Ditindaklanjuti` |
| `GuideSourceType` | `RESMI`, `MITRA` |

Pemetaan label `AlertLevel`:

| Nilai | Label |
|---|---|
| `GREEN` | Aman |
| `YELLOW` | Waspada |
| `ORANGE` | Siaga |
| `RED` | Awas |

Alert yang berlaku juga dapat bernilai `UNKNOWN` (Data Tidak Tersedia) pada respons API. Nilai ini tidak disimpan di database.
