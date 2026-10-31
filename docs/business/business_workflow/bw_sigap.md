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
| Aktor | Sistem SIGAP, Admin/Operator terlatih, Unit Utama, Sirine/Toa, Warga Desa |
| As-Is | Tidak ada mekanisme alert terstruktur; peringatan mengandalkan komunikasi manual antar warga/perangkat desa, tanpa standar level bahaya. |
| To-Be | Data lingkungan dievaluasi terhadap rule threshold, sistem menetapkan level (GREEN/YELLOW/ORANGE/RED - ditampilkan sebagai 3 warna di indikator fisik, GREEN+YELLOW digabung), level ditampilkan di dashboard dan diambil Unit Utama via polling REST (ADR-013). Operator terlatih memverifikasi kondisi dan, hanya untuk level ORANGE/RED, dapat menekan tombol sirine (fisik di Unit Utama, atau digital via dashboard - keduanya broadcast ke seluruh Sirine terdaftar). Level GREEN/YELLOW tidak dapat memicu sirine sama sekali. |
| Ringkasan Perubahan | Dari "tanpa standar, manual" menjadi "level terstandar 4-tingkat, tervisualisasi fisik, dengan human-in-the-loop sebagai safeguard sebelum aksi sirine". Sistem tidak mengotomasi bunyi sirine - keputusan akhir tetap di tangan operator manusia. |
| Catatan Terbuka | **Sebagian besar sudah final** (protokol komunikasi, jalur sirine hybrid, cooldown & eskalasi - lihat FS-08/FS-09, ADR-013/ADR-029). Yang masih terbuka: kanal notifikasi ke operator (Web Push langsung sudah live; integrasi SID sebagai kanal tambahan masih menunggu sign-off Tim SID) dan mekanisme konfirmasi 2-langkah untuk tombol fisik level RED (menunggu konfirmasi Tim IoT). Lihat diagram aktivitas terpisah: `bw_alert_kesiapsiagaan.puml`. |

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
| As-Is | Pembaruan informasi (kontak, titik evakuasi, panduan) dilakukan manual dan tidak terdokumentasi. |
| To-Be | Admin/Operator login ke dashboard admin dan mengelola kontak darurat, titik & jalur evakuasi, serta panduan kesiapsiagaan melalui form terstruktur. Kelola Pengumuman **tidak lagi** bagian dari proses ini - sumber data pindah jadi proxy read-only dari SID sejak Tahap 2. |
| Ringkasan Perubahan | Dari "tidak terdokumentasi" menjadi "terpusat, tercatat, dapat diaudit". Cakupan Tahap 2 juga menambahkan manajemen perangkat IoT, akun & role, dan dashboard ringkasan admin - lihat `uc_admin_dashboard.puml` revisi. |

---

## 5. Ringkasan & Rekomendasi Berbasis AI

| Elemen | Detail |
|---|---|
| Nama Proses | Ringkasan & Rekomendasi Berbasis AI |
| Aktor | Sistem SIGAP, AI API, Warga Desa |
| As-Is | Warga harus menginterpretasi data mentah cuaca/gempa secara mandiri. |
| To-Be | Sistem mengirim data terkini ke AI API, menghasilkan ringkasan bahasa sederhana dan rekomendasi aktivitas, ditampilkan ke warga. Jika AI API gagal, sistem menampilkan data mentah dengan indikator bahwa ringkasan otomatis tidak tersedia. |
| Ringkasan Perubahan | Dari "interpretasi mandiri" menjadi "dibantu ringkasan, dengan fallback eksplisit agar tidak ada gap informasi saat AI gagal". |