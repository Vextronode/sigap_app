# 6. API Architecture

## 6.1 Prinsip Desain

| Prinsip | Keputusan | ADR |
|---|---|---|
| Format kontrak | OpenAPI 3.0, bukan dokumentasi naratif manual | ADR-016 |
| Struktur response | Envelope `{success, message, data}` (sukses) / `{success, message, errors: array of string}` (error) - **direvisi**, lihat ADR-027 | ADR-022 |
| Model data Alert | Konsisten dengan tabel `alerts` (lihat DD_environmental.md revisi) - prinsip "satu model, bukan dua" dari ADR-018 tetap berlaku, detail field sudah berubah mengikuti struktur nyata | ADR-018 (prinsip), lihat DD_environmental.md untuk field aktual |
| Struktur URL | Berbasis kategori akses (`/api/public/*`, `/api/protected/*`), tanpa path versioning - **terverifikasi konsisten** dengan kode live | ADR-019 |
| Kategori akses ketiga | Device Gateway (M2M) - hidup di bawah prefix `/api/public/*` yang sama, dibedakan lewat kebutuhan device secret (bukan namespace URL terpisah seperti draf awal) | ADR-028 |
| Segmentasi file | Per domain (`paths/`, `schemas/`) | ADR-021 |

## 6.2 Domain API

| Domain | File | Deskripsi | Status |
|---|---|---|---|
| Auth | `auth.yaml` | Login, profil pengguna, logout | Login/me live, logout belum (Story SEC-3) |
| Weather | `weather.yaml` | Cuaca, gempa (3 region), tsunami, dashboard agregasi | Sebagian besar live (kecuali dashboard, sengaja ditunda) |
| Environmental Data & Alerts | `environmental.yaml` | Data historis, klasifikasi alert | Alert live, environmental_data belum |
| Devices | `iot-kesiapsiagaan.yaml` | Manajemen device, log, trigger sirine (Protected) | Belum ada sama sekali di database nyata |
| Device Gateway | `device-gateway.yaml` | Register, heartbeat, laporan event (M2M, prefix `/public/*`) | Register & heartbeat live tanpa autentikasi (Story SEC-7) |
| Content Admin | `content-admin.yaml` | Evakuasi, kontak darurat, panduan, proxy pengumuman | Kontak darurat & panduan live, evakuasi belum |
| AI Summary | `ai-summary.yaml` | Ringkasan berbasis AI | Belum live |
| Users | `users.yaml` | Manajemen akun & role (Protected) | Belum ada endpoint sama sekali |
| Notifications *(baru - gap, belum ada di spec)* | *(belum ada file - perlu dibuat)* | VAPID key, subscribe/unsubscribe, konten & riwayat notifikasi, dispatch manual | Live di kode, **belum terdokumentasi di OpenAPI spec manapun** |

## 6.3 Verifikasi Konsistensi

**Status usang:** klaim "36 path, 43 operasi" mengacu ke versi spec **sebelum** redesign sesi ini (penambahan 3 endpoint gempa, perubahan model Alert, penghapusan CRUD announcements, dst.). Perlu bundling ulang untuk menghasilkan angka yang akurat terhadap kontrak terbaru - jangan mengandalkan angka lama sebagai bukti konsistensi saat ini.