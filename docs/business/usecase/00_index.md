# Use Case Diagram - SIGAP
## Panduan Membaca & Struktur Folder

---

### 1. Tujuan

Folder ini mendokumentasikan interaksi antar aktor dengan Sistem SIGAP dalam bentuk Use Case Diagram (PlantUML), sebagai bagian dari deliverable Gate G2 (Workflow & Data Alignment).

Diagram dipecah per modul, bukan digabung dalam satu file, karena SIGAP mencakup domain dengan tingkat risiko berbeda modul kesiapsiagaan fisik (indikator dan sirine) bersifat safety-critical dan melibatkan aktuasi dunia nyata, sehingga sengaja dipisahkan agar tidak "tenggelam" di antara use case administratif biasa (kelola pengumuman, kelola kontak darurat, dan sejenisnya).

### 2. Aktor

| Aktor | Deskripsi | Berada di dalam/luar boundary sistem |
|---|---|---|
| Warga Desa | Pengguna publik, tidak memerlukan login | Luar |
| Admin / Operator | Perangkat desa yang memiliki akses Dashboard Admin dan telah dilatih untuk menangani aktivasi sirine | Luar |
| Sistem SIGAP | Platform inti (backend, rule engine, dashboard) | (subjek diagram) |
| Sumber Eksternal | BMKG, USGS, OpenWeatherMap, AI API | Luar |
| Perangkat IoT | Indikator level 3-warna dan tombol sirine yang terpasang di titik strategis desa | Luar |

Sumber Eksternal dan Perangkat IoT digambarkan sebagai aktor, bukan bagian internal sistem, karena keduanya berada di luar kendali langsung SIGAP dan berkomunikasi melalui antarmuka (API/protokol) yang terpisah.

### 3. Daftar File dan Cakupan

| File | Modul | Aktor Terlibat | Status |
|---|---|---|---|
| `uc_overview.puml` | Peta besar seluruh use case (tanpa detail relasi) | Seluruh aktor | light_green |
| `uc_monitoring_lingkungan.puml` | Pemantauan cuaca, seismik, dan ringkasan AI | Warga, Sistem SIGAP, Sumber Eksternal | light_green |
| `uc_admin_dashboard.puml` | Pengelolaan konten (pengumuman, kontak darurat, titik/jalur evakuasi) | Admin | light_green |
| `uc_kesiapsiagaan_iot.puml` | Level kesiapsiagaan, indikator fisik, dan aktivasi sirine | Warga, Admin, Sistem SIGAP, Perangkat IoT | yellow |

Status `yellow` pada modul kesiapsiagaan-IoT bukan menandakan diagram belum selesai, melainkan menandai bahwa dua keputusan governance terkait jalur komunikasi tombol sirine dan kanal notifikasi operator masih terbuka (lihat PRD SIGAP v4.0, Bagian 7.1). Relasi yang bergantung pada keputusan tersebut ditandai eksplisit di dalam file `.puml` melalui catatan (`note`), bukan diasumsikan.

Tidak ada status `red` saat ini,  seluruh modul memiliki cukup informasi untuk digambar, meski sebagian detail teknis di modul kesiapsiagaan masih menunggu konfirmasi.

### 4. Legenda Notasi

| Notasi | Arti |
|---|---|
| Kotak besar bertitel "Sistem SIGAP" | Boundary sistem |
| Oval | Use case |
| Actor stick figure | Aktor (manusia atau sistem eksternal) |
| `<<include>>` | Sub-proses yang selalu dijalankan sebagai bagian dari use case utama |
| `<<extend>>` | Sub-proses opsional, hanya berjalan pada kondisi tertentu |
| `note` (catatan bergaris putus) | Penanda item yang masih berstatus terbuka/TBD |

### 5. Cara Render

Diagram dapat dirender menggunakan salah satu dari:
- Ekstensi "PlantUML" pada VS Code (render langsung dari editor)
- `plantuml.jar` melalui command line: `java -jar plantuml.jar nama_file.puml`
- Server render daring resmi PlantUML, untuk pengecekan cepat tanpa instalasi lokal

Tidak diperlukan tooling tambahan di luar yang disebutkan di atas.

### 6. Referensi Silang

Setiap use case pada diagram ini dapat ditelusuri balik ke proses bisnis terkait pada dokumen `bw/BW_SIGAP.md`:

| Use Case | Proses Bisnis Terkait (BW) |
|---|---|
| Lihat Dashboard Lingkungan, Lihat Ringkasan AI | 1.1 Pemantauan Kondisi Lingkungan & Cuaca |
| Terima Notifikasi Level Alert, Verifikasi Level & Putuskan Tindakan, Trigger Sirine | 1.2 Penyampaian Alert & Level Kesiapsiagaan |
| Lihat Info Kesiapsiagaan | 1.3 Akses Informasi Kesiapsiagaan |
| Kelola Pengumuman, Kelola Kontak Darurat, Kelola Titik & Jalur Evakuasi | 1.4 Pengelolaan Konten oleh Admin |
| Lihat Ringkasan AI (rekomendasi) | 1.5 Ringkasan & Rekomendasi Berbasis AI |