# Route / Access Category Design - SIGAP

## Document Control

| Field | Detail |
|---|---|
| Status | Final - berlaku sebagai fondasi kategorisasi akses SIGAP |
| Tanggal | 13 Juli 2026 |
| Pemilik | Tech Lead SIGAP |
| Dokumen Terkait | PRD SIGAP v4.0, Data Dictionary & Schema SQL (`db/`) |

---

## 1. Prinsip Kategorisasi

Dua kategori berdasarkan kebutuhan token, bukan sensitivitas isi data semata:

- **Public** - dapat diakses tanpa token otentikasi. Mencakup seluruh data konsumsi warga dan titik masuk otentikasi (login) itu sendiri.
- **Protected** - wajib menyertakan `Authorization: Bearer <JWT>` yang valid, dengan permission code tertentu dipetakan lewat struktur RBAC (`roles`, `permissions`, `role_permissions`, `user_roles` - lihat `db/data-dictionary/DD_rbac.md`).

Prefix URL: `/api/public/*` dan `/api/protected/*`.

---

## 2. Tabel Kategorisasi Route

| Resource | Aksi | Kategori | Permission Dibutuhkan |
|---|---|---|---|
| Auth - login | POST `/api/public/auth/login` | Public | - |
| Auth - profil sendiri | GET `/api/protected/auth/me` | Protected | (valid token) |
| environmental_data | GET `/api/public/environmental-data` | Public | - |
| alert_log | GET `/api/public/alerts` | Public | - |
| alert_log - validate | PATCH `/api/protected/alerts/:id/validate` | Protected | `alert.validate` |
| iot_devices (ringkas) | GET `/api/public/devices` | Public | - |
| iot_devices (lengkap) | GET `/api/protected/devices` | Protected | `device.view` |
| iot_devices | POST/PUT/DELETE `/api/protected/devices` | Protected | `device.manage` |
| device_status_log | GET `/api/protected/devices/:id/status-log` | Protected | `device.view` |
| siren_action_log | GET `/api/protected/devices/:id/siren-log` | Protected | `siren.view` |
| siren_action_log - trigger remote | POST `/api/protected/devices/:id/trigger-siren` | Protected | `siren.trigger` |
| announcements | GET `/api/public/announcements` | Public | - |
| announcements | POST/PUT/DELETE `/api/protected/announcements` | Protected | `content.manage` |
| evacuation_points | GET `/api/public/evacuation-points` | Public | - |
| evacuation_points | POST/PUT/DELETE `/api/protected/evacuation-points` | Protected | `content.manage` |
| evacuation_routes | GET `/api/public/evacuation-routes` | Public | - |
| evacuation_routes | POST/PUT/DELETE `/api/protected/evacuation-routes` | Protected | `content.manage` |
| emergency_contacts | GET `/api/public/emergency-contacts` | Public | - |
| emergency_contacts | POST/PUT/DELETE `/api/protected/emergency-contacts` | Protected | `content.manage` |
| Ringkasan AI | GET `/api/public/ai-summary` | Public | - |
| users - kelola akun & role | POST/PUT/DELETE `/api/protected/users` | Protected | `user.manage` |

### Catatan - Route Trigger Sirine

`POST /api/protected/devices/:id/trigger-siren` hanya melayani jalur **remote_aplikasi**. Jalur **lokal_fisik** tidak melalui route ini sama sekali - aktuasi terjadi langsung di device, dan device melaporkan kejadian tersebut secara asinkron ke `siren_action_log` (`trigger_source = lokal_fisik`, `operator_id = NULL`) melalui sinkronisasi Firebase Realtime Database.

Validasi bisnis yang wajib diterapkan pada route ini:
- Menolak permintaan jika level device saat ini bukan `oranye` atau `merah` (sinkron dengan CHECK constraint di database).
- Mencatat `operator_id` dari token yang memanggil - tidak boleh diambil dari body request.

---

## 3. Pemetaan Role Default

| Role | Permission |
|---|---|
| admin | `content.manage`, `alert.validate`, `device.view`, `device.manage`, `siren.view`, `user.manage` |
| operator | `alert.validate`, `device.view`, `siren.view`, `siren.trigger` |

Detail struktur: `db/data-dictionary/DD_rbac.md` dan `db/schema/006_rbac.sql`.

---

## 4. Rate Limiting

**Algoritma:** Token Bucket - mengizinkan burst wajar (mis. dashboard memanggil beberapa endpoint bersamaan saat halaman dibuka) sambil tetap mencegah penggunaan berlebihan berkelanjutan.

**Layering:** diterapkan di dua lapis -
1. Level aplikasi (middleware), kontrol granular per endpoint.
2. Level infrastruktur/reverse proxy, sebagai lapisan pertahanan kedua sebelum trafik mencapai aplikasi.

**Batas per endpoint:**

| Endpoint | Limit | Alasan |
|---|---|---|
| `POST /api/public/auth/login` | 5 request / 15 menit / IP | Mencegah brute-force kredensial admin |
| `GET /api/public/*` (data umum) | 100 request / menit / IP | Mengakomodasi pemakaian dashboard wajar, membatasi scraping massal |
| `GET /api/public/ai-summary` | 20 request / menit / IP | Setiap request memicu panggilan berbayar ke AI API eksternal |

---

## 5. Integrasi Lintas Sistem

Notifikasi ke operator memanfaatkan infrastruktur SID sebagai kanal pengiriman (lihat `integration/SID_INTEGRATION_PROPOSAL.md`). SIGAP tetap menjadi satu-satunya sumber kebenaran untuk data kesiapsiagaan; integrasi ini murni lapisan pengiriman notifikasi.

---

## 6. Isu Governance Terbuka

| Isu | Status | Pemilik |
|---|---|---|
| Kontrak integrasi SID (endpoint, autentikasi, SLA) | Draft - menunggu sign-off Tim SID & Architecture Working Group | Tech Lead SIGAP + Tech Lead SID |
| Validasi personel per role (siapa memegang role apa) | Kebijakan operasional mitra desa, di luar cakupan arsitektur sistem | Mitra desa |
