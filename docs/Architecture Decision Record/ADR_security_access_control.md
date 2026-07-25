# Architecture Decision Record - Keamanan & Kontrol Akses

| | |
|---|---|
| **Document Type** | Architecture Decision Record (ADR) |
| **Domain** | Security & Access Control |
| **Status** | Approved |
| **Version** | 1.0 |
| **Date** | 20 July 2026 |
| **Author** | Tech Lead, SIGAP |
| **Applies To** | `api/`, `db/schema/006_rbac.sql`, `db/data-dictionary/DD_rbac.md` |

---

## ADR-005: Kategorisasi Akses Dua Tingkat (Public/Protected)

### Latar Belakang Keputusan
SIGAP melayani dua kelompok pengguna dengan kebutuhan akses berbeda: warga desa yang mengonsumsi informasi tanpa login, dan admin/operator yang memerlukan otentikasi untuk mengelola konten dan memvalidasi alert. Setiap endpoint API perlu diklasifikasikan sebelum implementasi backend dimulai.

### Alternatif yang Dipertimbangkan
1. Kategorisasi granular berbasis sensitivitas data per endpoint (lebih dari dua tingkat).
2. Kategorisasi biner berdasarkan kebutuhan token: Public (tanpa token) dan Protected (wajib token valid).

### Keputusan yang Dipilih
Opsi 2 - dua kategori: **Public** dan **Protected**, dengan prefix URL eksplisit (`/api/public/*`, `/api/protected/*`) yang mencerminkan kategori langsung dari path.

### Alasan Pemilihan
- Model dua kategori cukup untuk kebutuhan SIGAP saat ini dan lebih sederhana diimplementasikan serta diaudit dibanding model granular yang belum tentu diperlukan pada skala sistem ini.
- Penentuan hak akses granular di dalam kategori Protected didelegasikan ke lapisan RBAC (ADR-006), bukan ke kategorisasi route itu sendiri - memisahkan concern "butuh token atau tidak" dari "punya izin spesifik apa".

### Dampak Terhadap Sistem
- Middleware otentikasi cukup memeriksa prefix path untuk menentukan apakah validasi token diperlukan, sebelum masuk ke pemeriksaan permission granular.
- Penambahan endpoint baru mewajibkan keputusan eksplisit di titik pembuatan: masuk `/public/` atau `/protected/` - tidak ada kategori default implisit.

---

## ADR-006: RBAC Penuh Menggantikan Kolom Role Tunggal

### Latar Belakang Keputusan
Rancangan awal `users` menggunakan satu kolom `role` (VARCHAR) dengan nilai tunggal per pengguna. Permission matrix admin pada PRD masih berstatus belum final saat skema pertama kali dirancang, sehingga struktur otorisasi granular sempat ditunda.

### Alternatif yang Dipertimbangkan
1. Mempertahankan kolom `role` tunggal, menunda granularitas hingga permission matrix final divalidasi ke mitra desa.
2. Membangun struktur RBAC penuh (`roles`, `permissions`, `role_permissions`, `user_roles`) sejak awal, terlepas dari kapan personel per role ditentukan.

### Keputusan yang Dipilih
Opsi 2 - struktur RBAC penuh dibangun sekarang sebagai fondasi arsitektur final, bukan sebagai solusi sementara.

### Alasan Pemilihan
- Migrasi dari kolom `role` tunggal ke struktur RBAC penuh setelah sistem berjalan (data pengguna sudah ada, kode aplikasi sudah bergantung pada struktur lama) jauh lebih mahal dibanding membangunnya di awal.
- Struktur arsitektur (skema tabel) tidak bergantung pada kapan keputusan personel-per-role diambil - keduanya adalah keputusan yang independen. Menunda struktur arsitektur karena menunggu keputusan personel adalah kekeliruan kategori.
- Selaras dengan prinsip standardisasi lintas sistem program (auth pattern wajib seragam dan future-ready).

### Dampak Terhadap Sistem
- Empat tabel baru ditambahkan ke skema (`roles`, `permissions`, `role_permissions`, `user_roles`), menggantikan kolom `users.role`.
- Setiap endpoint Protected pada spesifikasi API memerlukan pemetaan eksplisit ke kode permission (mis. `content.manage`, `alert.validate`), bukan sekadar pengecekan "sudah login atau belum".
- Penentuan **personel** yang memegang role tertentu tetap merupakan kebijakan operasional mitra desa, di luar cakupan keputusan arsitektur ini.

---

## ADR-007: Seed Role Default - Admin dan Operator

### Latar Belakang Keputusan
Struktur RBAC (ADR-006) memerlukan data awal (seed) agar sistem dapat digunakan sejak deployment pertama, tanpa menunggu proses administrasi permission yang terpisah.

### Alternatif yang Dipertimbangkan
1. Tidak menyediakan seed role sama sekali - role dan permission dikonfigurasi manual pasca-deployment.
2. Menyediakan seed dua role dasar yang mencerminkan pembagian kerja tim yang sudah teridentifikasi: admin (pengelolaan konten) dan operator (verifikasi level dan sirine).

### Keputusan yang Dipilih
Opsi 2 - dua role default dengan permission yang telah dipetakan:
- **admin**: `content.manage`, `alert.validate`, `device.view`, `device.manage`, `siren.view`, `user.manage`
- **operator**: `alert.validate`, `device.view`, `siren.view`, `siren.trigger`

### Alasan Pemilihan
- Mencerminkan pembagian kerja yang telah diidentifikasi pada tim SIGAP (peran administratif vs peran lapangan/operasional), sehingga sistem langsung dapat dipakai tanpa konfigurasi tambahan di awal.
- Struktur permission granular (bukan role monolitik) memungkinkan penambahan role baru di kemudian hari tanpa mengubah skema, cukup menambah baris data.

### Dampak Terhadap Sistem
- `006_rbac.sql` menyertakan `INSERT` seed data sebagai bagian dari skema, bukan hanya struktur tabel kosong.
- Permission `siren.trigger` disertakan sebagai permission *reserved* pada role operator meski endpoint yang mengonsumsinya (`trigger-siren` untuk jalur remote) belum sepenuhnya aktif - menghindari migrasi permission tambahan ketika jalur remote direalisasikan.

---

## ADR-008: Algoritma Rate Limiting - Token Bucket

### Latar Belakang Keputusan
Route Public dapat diakses tanpa otentikasi, sehingga rentan terhadap penyalahgunaan (scraping massal, permintaan berlebihan ke endpoint yang memicu biaya eksternal seperti AI Summary). Algoritma pembatasan laju permintaan perlu ditentukan sebelum middleware diimplementasikan.

### Alternatif yang Dipertimbangkan
1. **Fixed Window Counter** - sederhana, overhead rendah, namun rawan burst di batas window.
2. **Sliding Window** - lebih akurat, namun lebih berat secara komputasi.
3. **Token Bucket** - mengizinkan burst wajar dalam batas tertentu, tetap membatasi penggunaan berkelanjutan.
4. **Leaky Bucket** - laju keluaran tetap, dapat menambah latency akibat antrian.

### Keputusan yang Dipilih
Token Bucket.

### Alasan Pemilihan
- Pola pemakaian dashboard SIGAP secara wajar melibatkan beberapa panggilan endpoint hampir bersamaan saat halaman pertama kali dimuat (burst alami) - Token Bucket mengakomodasi pola ini tanpa memerlukan pelonggaran limit secara keseluruhan.
- Dibanding Fixed Window, Token Bucket tidak memiliki celah burst di batas window yang dapat dieksploitasi untuk melampaui limit yang dimaksud.

### Dampak Terhadap Sistem
- Implementasi middleware memerlukan dua parameter per endpoint (ukuran bucket dan laju pengisian ulang), bukan satu angka tunggal seperti Fixed Window - sedikit menambah kompleksitas konfigurasi, namun ditanggung pada lapisan middleware, tidak memengaruhi desain API.

---

## ADR-009: Rate Limiting Diterapkan pada Dua Lapis

### Latar Belakang Keputusan
Rate limiting yang hanya diterapkan pada satu lapis (aplikasi saja) berarti seluruh trafik - termasuk trafik berlebihan atau serangan skala besar - tetap harus diproses hingga mencapai kode aplikasi sebelum ditolak.

### Alternatif yang Dipertimbangkan
1. Rate limiting hanya di lapisan aplikasi (middleware).
2. Rate limiting berlapis: aplikasi dan infrastruktur/reverse proxy.
3. Menambahkan lapisan ketiga (API Gateway/CDN) sejak awal.

### Keputusan yang Dipilih
Opsi 2 - dua lapis: middleware aplikasi sebagai kontrol granular per endpoint, dan reverse proxy sebagai lapisan pertahanan kedua sebelum trafik mencapai aplikasi.

### Alasan Pemilihan
- Middleware aplikasi tidak dapat mencegah beban trafik mencapai proses aplikasi itu sendiri - pada volume serangan yang cukup besar, ini dapat membebani resource server meski setiap request akhirnya ditolak.
- Opsi 3 (API Gateway/CDN) dianggap berada di luar skala kebutuhan dan kapasitas anggaran proyek saat ini - dicatat sebagai opsi masa depan, bukan kebutuhan sekarang.

### Dampak Terhadap Sistem
- Konfigurasi rate limiting perlu dilakukan di dua tempat terpisah (kode aplikasi dan konfigurasi reverse proxy/DevOps), menambah satu titik koordinasi antara Tech Lead dan DevOps Coordinator.

---

## ADR-010: Batas Rate Limit per Endpoint

### Latar Belakang Keputusan
Setelah algoritma (ADR-008) dan strategi layering (ADR-009) ditentukan, diperlukan angka konkret sebagai titik mulai implementasi.

### Alternatif yang Dipertimbangkan
Angka rate limit idealnya ditentukan dari data trafik nyata, yang belum tersedia pada tahap ini. Alternatif yang dipertimbangkan adalah antara menunda seluruh implementasi rate limiting hingga data tersedia, atau menetapkan angka awal yang masuk akal sebagai baseline yang dapat direvisi.

### Keputusan yang Dipilih
Baseline awal ditetapkan per kategori endpoint:

| Endpoint | Limit | Alasan |
|---|---|---|
| `POST /api/public/auth/login` | 5 request / 15 menit / IP | Mencegah brute-force kredensial admin |
| `GET /api/public/*` (data umum) | 100 request / menit / IP | Mengakomodasi pemakaian dashboard wajar |
| `GET /api/public/ai-summary` | 20 request / menit / IP | Setiap request memicu panggilan berbayar ke AI API eksternal |

### Alasan Pemilihan
- Menunda seluruh implementasi hingga data trafik nyata tersedia berarti sistem berjalan tanpa proteksi sama sekali pada periode awal yang justru paling rentan (belum ada pola trafik yang dikenali sebagai "normal").
- Endpoint login diberi limit paling ketat karena merupakan target paling umum untuk serangan brute-force. Endpoint AI Summary diberi limit lebih ketat dibanding endpoint data umum karena setiap pemanggilannya membawa konsekuensi biaya langsung ke pihak ketiga.

### Dampak Terhadap Sistem
- Angka-angka ini bersifat baseline, bukan keputusan permanen - perlu ditinjau ulang setelah tersedia data trafik dari penggunaan awal.
- Tidak ada perubahan pada kontrak API (`openapi.yaml`) akibat keputusan ini - rate limiting beroperasi di lapisan middleware/infrastruktur, transparan terhadap skema request/response.
