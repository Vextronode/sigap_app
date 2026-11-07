# Data Dictionary - Domain: Alert, Gempa, dan Notifikasi

## Entity: `alerts`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | TEXT | Primary key | - |
| level | ENUM `AlertLevel` | Level kesiapsiagaan | `YELLOW` |
| source | TEXT | Asal data | `BMKG (estimasi dari data gempa)` |
| description | TEXT, NULLABLE | Pesan alert | - |
| review_status | ENUM `alert_review_status`, default `Belum Ditinjau` | Klasifikasi peninjauan | `Dikonfirmasi` |
| reviewed_by | TEXT, NULLABLE, FK ke `users.id`, set null | Peninjau terakhir | - |
| reviewed_at | TIMESTAMP, NULLABLE | Waktu peninjauan terakhir | - |
| createdAt / updatedAt | TIMESTAMP | Waktu dibuat dan diperbarui | - |

Nilai `source` yang dihasilkan sistem: `BMKG`, `BMKG InaTEWS`, `BMKG (estimasi dari data gempa)`. Aturan level berada di `Rules_Alerts.md`.

## Entity: `earthquake_records`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | TEXT | Primary key | - |
| eventTime | TEXT, UNIQUE | Waktu kejadian | - |
| magnitude | DOUBLE PRECISION | Magnitudo | `5.6` |
| depth | TEXT | Kedalaman | `18 km` |
| location | TEXT | Wilayah | - |
| latitude / longitude | DOUBLE PRECISION | Koordinat episentrum | - |
| distanceToVillage | DOUBLE PRECISION | Jarak ke desa dalam kilometer | - |
| felt | TEXT, NULLABLE | Field `Dirasakan` BMKG | - |
| potential | TEXT, NULLABLE | Field `Potensi` BMKG | - |
| shakemap | TEXT, NULLABLE | URL shakemap | - |
| createdAt / updatedAt | TIMESTAMP | Waktu dibuat dan diperbarui | - |

## Entity: `push_subscriptions`

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | TEXT | Primary key |
| endpoint | TEXT, UNIQUE | Endpoint push browser |
| p256dh | TEXT | Kunci publik subscription |
| auth | TEXT | Secret autentikasi subscription |
| userAgent | TEXT, NULLABLE | User agent saat berlangganan |
| createdAt | TIMESTAMP | Waktu berlangganan |

Subscription tidak terikat ke akun pengguna.

## Entity: `notification_logs`

| Field | Tipe Data | Deskripsi | Contoh Nilai |
|---|---|---|---|
| id | TEXT | Primary key | - |
| alert_id | TEXT, NULLABLE, FK ke `alerts.id`, set null | Alert terkait | - |
| level | ENUM `AlertLevel` | Level saat dikirim | `ORANGE` |
| title | TEXT | Judul notifikasi | - |
| body | TEXT | Isi notifikasi | - |
| triggered_by | TEXT, default `CRON_SCHEDULER` | Pemicu pengiriman | `ADMIN_DISPATCH` |
| total_subscribers | INTEGER | Jumlah subscriber tujuan | - |
| sent_count | INTEGER | Jumlah berhasil | - |
| failed_count | INTEGER | Jumlah gagal | - |
| error_details | TEXT, NULLABLE | Rincian kegagalan | - |
| created_at | TIMESTAMP | Waktu pengiriman | - |
