# Data Dictionary - Domain: Perangkat

## Entity: `devices`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | TEXT | Primary key | - |
| deviceCode | TEXT, UNIQUE | Kode perangkat | `ESP32-CIBENDA-UTAMA` |
| name | TEXT | Nama perangkat | `Indikator Utama Balai Desa Cibenda` |
| status | ENUM `DeviceStatus`, default `OFFLINE` | Status koneksi tersimpan | `ONLINE` |
| lastSeen | TIMESTAMP, NULLABLE | Waktu terakhir perangkat melapor | - |
| createdAt / updatedAt | TIMESTAMP | Waktu dibuat dan diperbarui | - |

Perangkat dihitung aktif bila melapor dalam 45 detik terakhir. Waktu lapor dicatat di memori backend pada setiap laporan dan ditulis ke `lastSeen` paling sering sekali per 60 detik.
