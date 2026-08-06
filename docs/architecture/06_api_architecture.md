# 6. API Architecture

## 6.1 Prinsip Desain

| Prinsip | Keputusan | ADR |
|---|---|---|
| Format kontrak | OpenAPI 3.0, bukan dokumentasi naratif manual | ADR-016 |
| Struktur response | Envelope `{status, code, message, data}` (sukses) / `{status, code, message, errors}` (error) | ADR-017 |
| Model data Alert | Konsisten dengan `alert_log`, bukan struktur tersederhanakan | ADR-018 |
| Struktur URL | Berbasis kategori akses (`/api/public/*`, `/api/protected/*`), bukan path versioning | ADR-019 |
| Segmentasi file | Per domain (`paths/`, `components/`), mengikuti pola yang sama dengan `db/schema/` | ADR-021 |

## 6.2 Domain API

| Domain | File | Deskripsi |
|---|---|---|
| Auth | `auth.yaml` | Login, profil pengguna |
| Weather | `weather.yaml` | Cuaca granular, agregasi dashboard (ADR-020) |
| Environmental Data & Alerts | `environmental.yaml` | Data historis, validasi alert |
| Devices | `iot-kesiapsiagaan.yaml` | Manajemen device, log, trigger sirine (Protected) |
| Device Gateway | `device-gateway.yaml` | Polling, heartbeat, laporan event (M2M) |
| Content Admin | `content-admin.yaml` | Pengumuman, evakuasi, kontak darurat |
| AI Summary | `ai-summary.yaml` | Ringkasan berbasis AI |
| Users | `users.yaml` | Manajemen akun (Protected) |

## 6.3 Verifikasi Konsistensi

Spesifikasi tersegmentasi (`api/paths/`, `api/components/`) telah diverifikasi menghasilkan struktur identik dengan bentuk file tunggal melalui proses bundling ulang — 36 path, 43 operasi, tanpa kehilangan informasi (lihat riwayat perubahan `api/openapi.yaml`).
