# Business Workflow — SIGAP
### Gate 2 Deliverable

---

## 1. Pemantauan Kondisi Lingkungan & Cuaca

| Elemen | Detail |
|---|---|
| Nama Proses | Pemantauan Kondisi Lingkungan & Cuaca |
| Aktor | Warga Desa, Sistem SIGAP, Sumber Eksternal (BMKG, USGS, OpenWeatherMap) |
| As-Is | Warga mencari informasi cuaca/gempa secara mandiri lintas platform (BMKG, media sosial, radio komunitas). Tidak ada titik akses tunggal yang spesifik untuk Desa Cibenda. |
| To-Be | Sistem menarik data dari BMKG/USGS/OWM secara berkala, menormalisasi, dan menampilkan di dashboard dalam satu tampilan yang berfokus pada wilayah desa, lengkap data historis. |
| Ringkasan Perubahan | Dari "cari sendiri lintas sumber" menjadi "satu dashboard terpusat, spesifik lokasi". Sistem tidak melakukan prediksi mandiri — murni menampilkan data resmi. |

---

## 2. Penyampaian Alert & Level Kesiapsiagaan

| Elemen | Detail |
|---|---|
| Nama Proses | Penyampaian Alert & Level Kesiapsiagaan (termasuk indikator fisik dan sirine) |
| Aktor | Sistem SIGAP, Admin/Operator terlatih, Perangkat IoT, Warga Desa |
| As-Is | Tidak ada mekanisme alert terstruktur; peringatan mengandalkan komunikasi manual antar warga/perangkat desa, tanpa standar level bahaya. |
| To-Be | Data lingkungan dievaluasi terhadap rule threshold, sistem menetapkan level (Hijau/Waspada, Kuning/Siaga, Merah/Awas), level dikirim ke dashboard dan Perangkat IoT. Operator terlatih memverifikasi kondisi dan, untuk level Kuning/Merah, dapat menekan tombol sirine sesuai kategori. Level Hijau tidak dapat memicu sirine. |
| Ringkasan Perubahan | Dari "tanpa standar, manual" menjadi "level terstandar, tervisualisasi fisik, dengan human-in-the-loop sebagai safeguard sebelum aksi sirine". Sistem tidak mengotomasi bunyi sirine — keputusan akhir tetap di tangan operator manusia. |
| Catatan Terbuka | Jalur tombol sirine (network-connected vs switch lokal) dan kanal notifikasi ke operator masih TBD — lihat PRD SIGAP v4.0 §7.1. Lihat diagram aktivitas terpisah: `bw_alert_kesiapsiagaan.puml`. |

---

## 3. Akses Informasi Kesiapsiagaan (Evakuasi & Kontak Darurat)

| Elemen | Detail |
|---|---|
| Nama Proses | Akses Informasi Kesiapsiagaan |
| Aktor | Warga Desa, Admin |
| As-Is | Informasi jalur evakuasi/kontak darurat tersebar (papan pengumuman fisik, informasi verbal), sulit diakses saat darurat. |
| To-Be | Warga mengakses peta jalur dan titik evakuasi serta kontak darurat langsung dari dashboard, terhubung dengan status kondisi lingkungan terkini. |
| Ringkasan Perubahan | Dari "statis, tersebar" menjadi "terpusat, kontekstual dengan kondisi real-time". |

---

## 4. Pengelolaan Konten oleh Admin

| Elemen | Detail |
|---|---|
| Nama Proses | Pengelolaan Konten oleh Admin |
| Aktor | Admin/Operator |
| As-Is | Pembaruan informasi (pengumuman, kontak, titik evakuasi) dilakukan manual dan tidak terdokumentasi. |
| To-Be | Admin login ke dashboard admin dan mengelola pengumuman, kontak darurat, serta titik dan jalur evakuasi melalui form terstruktur. |
| Ringkasan Perubahan | Dari "tidak terdokumentasi" menjadi "terpusat, tercatat, dapat diaudit". |

---

## 5. Ringkasan & Rekomendasi Berbasis AI

| Elemen | Detail |
|---|---|
| Nama Proses | Ringkasan & Rekomendasi Berbasis AI |
| Aktor | Sistem SIGAP, AI API, Warga Desa |
| As-Is | Warga harus menginterpretasi data mentah cuaca/gempa secara mandiri. |
| To-Be | Sistem mengirim data terkini ke AI API, menghasilkan ringkasan bahasa sederhana dan rekomendasi aktivitas, ditampilkan ke warga. Jika AI API gagal, sistem menampilkan data mentah dengan indikator bahwa ringkasan otomatis tidak tersedia. |
| Ringkasan Perubahan | Dari "interpretasi mandiri" menjadi "dibantu ringkasan, dengan fallback eksplisit agar tidak ada gap informasi saat AI gagal". |