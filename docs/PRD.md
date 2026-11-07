# Product Requirement Document - SIGAP
### Sistem Informasi & Kesiapsiagaan Bencana Desa Cibenda

| Field | Detail |
|---|---|
| Versi | 5.0 |
| Tanggal | 7 November 2026 |
| Status | Aktif |
| Pemilik Dokumen | Tech Lead SIGAP |
| Dokumen Terkait | `Rules_Alerts.md`, `architecture/`, `architecture_decision_record/`, `sigap-phase-2/ROADMAP_TAHAP_2.md` |

## Riwayat Revisi

| Versi | Tanggal | Perubahan Utama |
|---|---|---|
| 1.0 | 05/07/2026 | Draft awal |
| 2.0 | 06/07/2026 | Penambahan monitoring lingkungan dan kesiapsiagaan bencana |
| 3.0 | 06/07/2026 | Penambahan Success Metrics dan Non-Functional Requirements |
| 4.0 | 09/07/2026 | Penambahan IoT indikator dan sirine |
| 5.0 | 07/11/2026 | Penyelarasan dengan kondisi aktual: sumber data BMKG dan Open-Meteo, cakupan evakuasi, kebijakan notifikasi, data historis dan alert cuaca dipindahkan ke roadmap |

## Ringkasan Eksekutif

SIGAP adalah platform web untuk Desa Cibenda, Kecamatan Parigi, Kabupaten Pangandaran. SIGAP mengolah data resmi BMKG (gempa, potensi tsunami, prakiraan cuaca) dan data cuaca Open-Meteo menjadi status kesiapsiagaan yang sederhana, dilengkapi titik evakuasi, kontak darurat, panduan kesiapsiagaan, notifikasi Web Push, dan gateway untuk perangkat indikator fisik. SIGAP tidak melakukan prediksi bencana. Aktivasi sirine selalu merupakan keputusan operator.

## 1. Project Overview

### 1.1 Latar Belakang

Desa Cibenda adalah wilayah pesisir dengan eksposur risiko gempa bumi, tsunami, dan cuaca ekstrem. Informasi resmi tersedia melalui BMKG, namun tersebar lintas platform, tidak berfokus pada level desa, dan tidak terhubung dengan informasi kesiapsiagaan operasional.

### 1.2 Tujuan Produk

1. Menyediakan dashboard monitoring cuaca, gempa, dan potensi tsunami yang berfokus pada Desa Cibenda.
2. Menyampaikan informasi bencana dari sumber resmi tanpa melakukan prediksi mandiri.
3. Membantu masyarakat memahami kondisi lingkungan melalui ringkasan berbasis AI.
4. Menyediakan informasi kesiapsiagaan yang terhubung dengan kondisi terkini.
5. Menyediakan API bagi integrasi lintas sistem program.
6. Meneruskan level kesiapsiagaan ke perangkat indikator fisik di titik strategis desa, dengan aktivasi sirine oleh operator terlatih.

### 1.3 Target Pengguna

| Segmen | Deskripsi |
|---|---|
| Warga | Warga Desa Cibenda, nelayan, petani, wisatawan; tanpa login |
| Admin | Mengelola konten, alert, akun, dan pengaturan sistem; role `admin` |
| Operator | Mengelola konten dan alert; role `operator` |

## 2. Success Metrics

| Area | Target | Metode Verifikasi |
|---|---|---|
| Adopsi kesiapsiagaan | Minimal 70% peserta UAT warga menemukan titik evakuasi terdekat dan membuka navigasinya tanpa bantuan admin dalam kurang dari 2 menit | Skenario UAT terstruktur |
| Keterandalan informasi | Data cuaca dan gempa konsisten dengan sumbernya pada sampling acak selama pilot | Spot-check mingguan selama pilot |
| Adopsi operasional | Admin menggunakan dashboard admin minimal 1 kali per minggu selama 4 minggu pilot | Waktu login terakhir per akun |
| Penerimaan mitra | Sign-off UAT dari mitra desa tanpa temuan blocking | Berita acara UAT |
| Aksesibilitas informasi | Warga dengan literasi digital terbatas memahami status kesiapsiagaan tanpa penjelasan tambahan | Sesi uji kualitatif dengan minimal 3 responden non-teknis |

## 3. Product Scope

Status: **Berjalan** tersedia di kode, **Sebagian** tersedia dengan batasan yang disebutkan, **Belum** belum tersedia di kode.

### 3.1 In Scope (MVP)

| Modul | Kebutuhan | Status |
|---|---|---|
| Monitoring | Cuaca terkini dan prakiraan (BMKG, Open-Meteo) | Berjalan |
| Monitoring | Gempa nasional, Jawa Barat, Pangandaran, dan peta sebaran (BMKG) | Berjalan |
| Monitoring | Status potensi tsunami | Berjalan |
| Monitoring | Alert berbasis aturan gempa dan tsunami beserta riwayatnya | Berjalan |
| Kesiapsiagaan | Titik evakuasi pada peta dan navigasi melalui Google Maps | Berjalan |
| Kesiapsiagaan | Kontak darurat | Berjalan |
| Kesiapsiagaan | Panduan kesiapsiagaan (artikel atau tautan eksternal) | Berjalan |
| Notifikasi | Web Push ke seluruh subscriber untuk level Waspada, Siaga, dan Awas | Berjalan |
| Decision Support | Ringkasan cuaca dan gempa berbasis AI serta rekomendasi aktivitas | Belum; kartu dashboard tersedia dengan konten sementara |
| Dashboard Admin | Riwayat alert dan catatan tinjauan, kontak darurat, titik evakuasi, panduan | Berjalan |
| Dashboard Admin | Manajemen akun dan role, pengaturan sistem, ringkasan operasional | Berjalan |
| Platform | Akses Public dan Protected, RBAC `admin`/`operator` | Berjalan |
| Platform | PWA dengan cache data terakhir | Berjalan |
| Pengumuman | Pengumuman desa melalui integrasi SID | Belum |
| IoT | Registrasi, heartbeat, dan status level untuk perangkat | Berjalan |
| IoT | Indikator fisik dan tombol sirine lokal pada perangkat | Di luar repositori ini; dikelola firmware Tim IoT |
| IoT | Kontrol sirine dari aplikasi dengan konfirmasi dan cooldown | Belum |

### 3.2 Roadmap

Kebutuhan berikut berada di `sigap-phase-2/ROADMAP_TAHAP_2.md`:

- Data historis lingkungan (grafik dan filter waktu).
- Alert berbasis aturan untuk banjir, kekeringan, dan cuaca ekstrem.
- Integrasi sensor lapangan sebagai sumber data.

### 3.3 Out of Scope

- Prediksi gempa bumi atau tsunami.
- Sistem peringatan dini mandiri di luar aturan pada `Rules_Alerts.md`.
- Machine learning di luar penggunaan AI untuk peringkasan teks.
- Jalur evakuasi tergambar dan routing internal; navigasi diserahkan ke Google Maps.
- Chatbot, aplikasi mobile native, login warga, forum, pelaporan warga, pelacakan kendaraan evakuasi.
- Notifikasi WhatsApp untuk warga.

## 4. Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, PWA |
| Backend | Node.js, Express, TypeScript, Prisma |
| Database | PostgreSQL |
| Peta | Leaflet dengan tile Google Maps |
| Notifikasi | Web Push (VAPID) |
| Komunikasi perangkat | REST polling ke backend |
| Hosting | Staging di server organisasi (Akademik Kampus) dengan Docker Compose |

## 5. Non-Functional Requirements

### 5.1 Performance
- Dashboard menampilkan data terkini tanpa jeda yang mengganggu pengguna non-teknis.
- Dashboard tetap menampilkan data terakhir yang tersimpan saat koneksi lambat atau terputus.

### 5.2 Security dan Privasi Data
- Kontak darurat dan titik evakuasi hanya dapat diubah oleh pengguna dengan permission `content.manage`.
- Kredensial tidak terekspos di sisi klien.

### 5.3 Aksesibilitas
- Antarmuka dapat digunakan warga dengan literasi digital terbatas, termasuk lansia, tanpa pelatihan.
- Kontras warna dan ukuran teks mengikuti keterbacaan di luar ruangan.
- Informasi kritis tidak hanya bergantung pada warna.

### 5.4 Offline Capability
- Saat koneksi hilang, sistem menampilkan data terakhir yang berhasil dimuat beserta waktu pembaruannya.

### 5.5 Keamanan Jalur Perangkat
- Perangkat mengautentikasi diri ke backend saat registrasi dan heartbeat.
- Kehilangan koneksi perangkat ditampilkan berbeda dari status aman.
- Aktivasi sirine level Awas melalui aplikasi memerlukan konfirmasi tambahan.

## 6. External APIs

| Sumber | Kegunaan |
|---|---|
| BMKG | Prakiraan cuaca, gempa, potensi tsunami |
| Open-Meteo | Cuaca terkini dan prakiraan harian |
| Google Maps | Tile peta dan navigasi ke titik evakuasi |
| Layanan push browser | Pengiriman Web Push |

## 7. Data Model

Struktur data lengkap berada di `architecture_data_and_schema/data_dictionary/` dan `apps/backend/prisma/schema.prisma`.

## 8. User Flow

**Warga:** membuka dashboard, melihat status kesiapsiagaan, cuaca, gempa, dan tsunami, membuka titik evakuasi terdekat serta navigasinya, mengakses kontak darurat dan panduan, serta dapat berlangganan notifikasi.

**Admin dan Operator:** login, memantau ringkasan operasional, mencatat tinjauan alert, serta mengelola kontak darurat, titik evakuasi, dan panduan. Admin juga mengelola akun.

## 9. Penutup

SIGAP bukan sistem pendeteksi maupun prediksi bencana. Keputusan mitigasi tetap mengacu pada informasi resmi BMKG, BPBD, dan instansi berwenang. AI dibatasi pada penyederhanaan penyampaian informasi. Sistem tidak pernah mengaktifkan sirine secara otomatis.
