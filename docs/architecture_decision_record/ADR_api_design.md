# Architecture Decision Record - Desain API

| | |
|---|---|
| **Document Type** | Architecture Decision Record (ADR) |
| **Domain** | API Design |
| **Status** | Approved |
| **Version** | 1.0 |
| **Date** | 20 July 2026 |
| **Author** | Tech Lead, SIGAP |
| **Applies To** | `api/openapi.yaml`, `api/paths/`, `api/components/` |

---

## ADR-016: Format OpenAPI 3.0 Sebagai Kontrak API

### Latar Belakang Keputusan
Kontrak API antara backend dan frontend perlu didokumentasikan dalam bentuk yang dapat diandalkan sebagai satu sumber kebenaran bersama, digunakan oleh developer frontend, backend, QA, maupun tooling otomatis.

### Alternatif yang Dipertimbangkan
1. Dokumentasi tabel markdown manual, mendeskripsikan setiap endpoint secara naratif.
2. Spesifikasi OpenAPI 3.0 dalam format YAML.

### Keputusan yang Dipilih
Opsi 2 - OpenAPI 3.0.

### Alasan Pemilihan
- OpenAPI adalah format yang dapat diproses mesin (machine-readable) - dapat diimpor langsung ke Postman/Swagger UI untuk pengujian, dipakai men-generate mock server, dan dipakai men-generate client SDK, mengurangi risiko dokumentasi dan implementasi aktual saling menyimpang.
- Dokumentasi tabel markdown manual rentan menjadi usang karena tidak ada mekanisme validasi otomatis terhadap konsistensi struktur (mis. tipe data yang berubah tanpa dokumentasi ikut diperbarui).

### Dampak Terhadap Sistem
- Seluruh perubahan kontrak API wajib dilakukan melalui perubahan file OpenAPI, bukan sekadar catatan terpisah - menjadikan file ini sumber kebenaran tunggal untuk struktur request/response.
- Tim frontend dan QA dapat memvalidasi implementasi backend terhadap spesifikasi secara otomatis menggunakan tooling standar OpenAPI.

---

## ADR-017: Struktur Envelope Response Standar

### Latar Belakang Keputusan
Setiap response API memerlukan struktur yang konsisten agar frontend dapat menangani response sukses dan error dengan pola penanganan yang seragam di seluruh aplikasi, tanpa penanganan khusus per endpoint.

### Alternatif yang Dipertimbangkan
1. Response sukses berupa schema data secara langsung (tanpa pembungkus), error dikembalikan dalam struktur terpisah `{error: {code, message}}`.
2. Seluruh response (sukses maupun error) dibungkus struktur seragam eksplisit: sukses `{status, code, message, data}`, error `{status, code, message, errors}`.

### Keputusan yang Dipilih
Opsi 2.

### Alasan Pemilihan
- Struktur seragam memungkinkan frontend menulis satu lapisan penanganan response generik (memeriksa field `status`) alih-alih menangani bentuk response yang berbeda-beda tergantung endpoint atau hasil.
- Menyertakan `code` pada body response (duplikasi terhadap HTTP status code) mempermudah debugging pada kondisi tertentu di mana HTTP status code asli tidak sepenuhnya terlihat oleh lapisan frontend (mis. di balik beberapa proxy/interceptor).

### Dampak Terhadap Sistem
- Seluruh response pada spesifikasi API (`api/paths/*.yaml`) menggunakan pola `allOf` yang menggabungkan skema envelope (`SuccessEnvelope`/`ErrorEnvelope`) dengan skema data spesifik endpoint.
- Pengecualian eksplisit: response `204 No Content` tidak menyertakan body sama sekali, mengikuti konvensi HTTP standar - tidak dipaksakan mengikuti envelope karena kontradiktif dengan definisi status code tersebut.

---

## ADR-018: Model Data Alert Konsisten dengan `alert_log`

### Latar Belakang Keputusan
Terdapat dua kemungkinan model untuk merepresentasikan "status kesiapsiagaan saat ini" pada API: sebagai entity status tunggal yang disederhanakan, atau sebagai record terbaru dari log kejadian yang sudah ada.

### Alternatif yang Dipertimbangkan
1. Entity terpisah yang disederhanakan, hanya berisi level, warna, dan alasan singkat tanpa riwayat/audit trail.
2. Menggunakan skema `Alert` yang sama dengan `alert_log` (mencakup `validated_by`, `validated_at`, `source_rule`), dengan endpoint "current" mengembalikan record terbaru dari data yang sama.

### Keputusan yang Dipilih
Opsi 2.

### Alasan Pemilihan
- Opsi 1 menciptakan dua model data untuk konsep yang sebenarnya sama (status kesiapsiagaan terkini vs riwayatnya), berisiko keduanya saling tidak sinkron seiring waktu.
- Mempertahankan satu model data tunggal untuk alert memastikan audit trail (siapa memvalidasi, kapan) tetap dapat ditelusuri bahkan dari endpoint yang menampilkan kondisi "saat ini" sekalipun.

### Dampak Terhadap Sistem
- Endpoint `GET /public/alerts/current` mengembalikan skema `Alert` yang identik dengan `GET /public/alerts` (list), hanya berbeda pada filter (record terbaru) - tidak ada skema tambahan yang perlu dipelihara terpisah.

---

## ADR-019: Struktur URL Berbasis Kategori Akses, Bukan Path Versioning

### Latar Belakang Keputusan
Struktur URL API memerlukan konvensi yang konsisten. Pola umum di industri sering menyertakan versi API pada path (`/v1/`, `/v2/`), sementara SIGAP telah lebih dulu menetapkan struktur berbasis kategori akses (`/public/`, `/protected/`) sejak Route/Access Design.

### Alternatif yang Dipertimbangkan
1. Path versioning (`/api/v1/...`), dengan migrasi ke `/api/v2/...` saat terjadi perubahan besar di masa depan.
2. Tetap menggunakan struktur kategori akses yang sudah ditetapkan (`/api/public/...`, `/api/protected/...`).

### Keputusan yang Dipilih
Opsi 2.

### Alasan Pemilihan
- Struktur kategori akses sudah menjadi fondasi desain sejak Route/Access Design (ADR-005) dan tercermin di seluruh middleware otorisasi - mengganti ke path versioning berarti merombak konvensi routing yang sudah berjalan tanpa manfaat langsung bagi kebutuhan SIGAP saat ini.
- Kebutuhan versioning API belum menjadi masalah nyata pada tahap pengembangan ini (belum ada breaking change yang memerlukan dua versi API berjalan bersamaan).

### Dampak Terhadap Sistem
- Seluruh path pada spesifikasi API tetap mengikuti pola `/api/public/*` dan `/api/protected/*`.
- Kebutuhan versioning di masa depan (jika muncul) perlu didesain ulang secara terpisah - tidak otomatis mengikuti pola `/v1/`, `/v2/` yang umum dipakai sistem lain.

---

## ADR-020: Penambahan Endpoint Agregasi Dashboard dan Domain Cuaca Granular

### Latar Belakang Keputusan
Review terhadap dokumen API_Spec.md (Naufal Fadhiil, v2.0) mengidentifikasi kebutuhan endpoint yang belum ada pada spesifikasi API SIGAP: endpoint agregasi untuk halaman utama dashboard, serta endpoint granular per jenis data cuaca/gempa/tsunami dengan field yang sudah dipetakan ke sumber BMKG.

### Alternatif yang Dipertimbangkan
1. Mempertahankan hanya endpoint generik yang sudah ada (`GET /public/environmental-data` dengan filter `type`), tanpa endpoint granular tambahan.
2. Menambahkan endpoint granular (`/weather/current`, `/weather/forecast`, `/earthquakes/latest`, `/tsunamis/status`) dan endpoint agregasi (`/dashboard`, `/admin/dashboard`) sebagai tambahan terhadap endpoint generik yang sudah ada.

### Keputusan yang Dipilih
Opsi 2 - kedua jenis endpoint dipertahankan berdampingan, dengan tujuan berbeda: endpoint generik untuk akses data historis/terfilter, endpoint granular untuk kebutuhan tampilan UI spesifik yang sudah diproses ke bentuk siap pakai.

### Alasan Pemilihan
- Endpoint granular tidak bertentangan dengan arsitektur yang sudah ada - keduanya melayani kebutuhan berbeda (riwayat vs nilai terkini yang sudah diproses/diformat).
- Endpoint agregasi (`/dashboard`) mengurangi jumlah request yang harus dilakukan frontend saat halaman utama dibuka, memberikan manfaat performa nyata tanpa mengubah arsitektur data yang mendasarinya.

### Dampak Terhadap Sistem
- Domain baru `Weather` ditambahkan pada spesifikasi API (`components/weather.yaml`, `paths/weather.yaml`), mengikuti pola segmentasi yang sama dengan domain lain.
- Endpoint agregasi berarti backend perlu mengumpulkan data dari beberapa sumber internal (cuaca, gempa, tsunami, alert, pengumuman, kontak darurat, titik evakuasi) dalam satu handler - kompleksitas ini disadari sebagai konsekuensi langsung dari manfaat performa yang diperoleh.

---

## ADR-021: Segmentasi Spesifikasi API per Domain

### Latar Belakang Keputusan
Spesifikasi OpenAPI awal ditulis sebagai satu file tunggal. Seiring bertambahnya jumlah endpoint dan skema, file tunggal menjadi sulit dibaca dan dinavigasi.

### Alternatif yang Dipertimbangkan
1. Mempertahankan satu file `openapi.yaml` tunggal berisi seluruh path dan schema.
2. Memecah spesifikasi menjadi beberapa file per domain (`paths/`, `components/`), dengan `openapi.yaml` sebagai file index yang merujuk lewat `$ref`.

### Keputusan yang Dipilih
Opsi 2, dengan domain yang mengikuti pembagian yang sama dengan `db/schema/` dan `db/data-dictionary/` (auth, users, environmental, iot-kesiapsiagaan, content-admin, ai-summary, weather).

### Alasan Pemilihan
- Segmentasi meningkatkan keterbacaan tanpa mengubah kontrak API itu sendiri - diverifikasi dengan proses bundling ulang yang menghasilkan struktur identik dengan versi file tunggal sebelumnya.
- Mengikuti pembagian domain yang sama dengan skema database menjaga konsistensi mental model di seluruh proyek - siapa pun yang familier dengan satu struktur (mis. `db/schema/`) dapat langsung menavigasi struktur lain (`api/`) tanpa mempelajari skema pembagian baru.

### Dampak Terhadap Sistem
- Setiap penambahan domain baru (mis. ADR-020) mewajibkan penambahan pasangan file baru di `paths/` dan `components/`, mengikuti pola penamaan yang sudah ditetapkan.
- Proses build/deployment yang membutuhkan spesifikasi dalam satu file (mis. untuk diimpor ke tools tertentu) memerlukan langkah bundling tambahan - sudah divalidasi dapat dilakukan tanpa kehilangan informasi.
