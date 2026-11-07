# 6. API Architecture

## 6.1 Prinsip

| Prinsip | Implementasi | ADR |
|---|---|---|
| Format kontrak | OpenAPI 3.0 di `api_spec/` | ADR-016 |
| Struktur response | `{success, message, data}` dan `{success, message, errors}` | ADR-027 |
| Model alert | Status terkini memakai skema yang sama dengan riwayat alert | ADR-018 |
| Struktur URL | Berbasis kategori akses, tanpa versi pada path | ADR-019 |
| Device Gateway | Di bawah `/api/public/device/*` dengan autentikasi header | ADR-028 |
| Segmentasi file | Per domain pada `paths/` dan `schemas/` | ADR-021 |

## 6.2 Domain API

| Domain | File | Cakupan |
|---|---|---|
| Auth | `auth.yaml` | Login, profil, logout, ganti password |
| Weather | `weather.yaml` | Cuaca terkini dan prakiraan |
| Earthquakes | `earthquakes.yaml` | Gempa, peta sebaran, status tsunami |
| Alerts | `alerts.yaml` | Alert terkini, riwayat, review |
| Device Gateway | `device.yaml` | Status, registrasi, heartbeat |
| Notifications | `notifications.yaml` | Subscribe, konten, pengiriman manual, riwayat |
| Content Admin | `content-admin.yaml` | Titik evakuasi, kontak darurat, panduan, pengumuman |
| Users | `users.yaml` | Manajemen akun dan role |
| System | `system.yaml` | Kesehatan sistem dan pemicu scheduler |
| Health | `health.yaml` | Liveness dan readiness |
