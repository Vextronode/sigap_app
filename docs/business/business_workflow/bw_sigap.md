# Business Workflow - SIGAP

## 1. Pemantauan Kondisi Lingkungan dan Cuaca

| Elemen | Detail |
|---|---|
| Nama Proses | Pemantauan Kondisi Lingkungan dan Cuaca |
| Aktor | Warga Desa, Sistem SIGAP, BMKG, Open-Meteo |
| Sebelum SIGAP | Warga mencari informasi cuaca dan gempa secara mandiri lintas platform. Tidak ada titik akses tunggal yang spesifik untuk Desa Cibenda. |
| Proses Berjalan | Sistem menarik data BMKG dan Open-Meteo, lalu menampilkan cuaca, prakiraan, gempa, peta sebaran gempa, dan status tsunami dalam satu dashboard yang berfokus pada wilayah desa. |
| Hasil | Satu dashboard terpusat dan spesifik lokasi. Sistem tidak melakukan prediksi. |

## 2. Penyampaian Alert dan Level Kesiapsiagaan

| Elemen | Detail |
|---|---|
| Nama Proses | Penyampaian Alert dan Level Kesiapsiagaan |
| Aktor | Sistem SIGAP, Admin, Operator, Unit Utama, Warga Desa |
| Sebelum SIGAP | Peringatan mengandalkan komunikasi manual antarwarga dan perangkat desa, tanpa standar level bahaya. |
| Proses Berjalan | Scheduler mengevaluasi data BMKG sesuai `Rules_Alerts.md` dan menetapkan level `GREEN`, `YELLOW`, `ORANGE`, atau `RED`. Alert selain `GREEN` disimpan dan dikirim sebagai Web Push ke seluruh subscriber. Level ditampilkan di dashboard dan dibaca Unit Utama melalui REST polling. Admin dan operator mengklasifikasikan alert menjadi Dikonfirmasi, Ditolak, atau Ditindaklanjuti. |
| Hasil | Level terstandar 4 tingkat yang sampai ke warga tanpa harus membuka dashboard. |

Diagram aktivitas: `bw_alert_kesiapsiagaan.puml`.

## 3. Akses Informasi Kesiapsiagaan

| Elemen | Detail |
|---|---|
| Nama Proses | Akses Informasi Kesiapsiagaan |
| Aktor | Warga Desa, Google Maps |
| Sebelum SIGAP | Informasi titik evakuasi dan kontak darurat tersebar dan sulit diakses saat darurat. |
| Proses Berjalan | Warga melihat titik evakuasi pada peta dan daftar, mengurutkan titik terdekat bila izin lokasi diberikan, membuka navigasi melalui Google Maps, serta mengakses kontak darurat dan panduan kesiapsiagaan. |
| Hasil | Informasi kesiapsiagaan terpusat dan dapat diakses tanpa login. |

## 4. Pengelolaan Konten

| Elemen | Detail |
|---|---|
| Nama Proses | Pengelolaan Konten |
| Aktor | Admin, Operator |
| Sebelum SIGAP | Pembaruan informasi dilakukan manual dan tidak terdokumentasi. |
| Proses Berjalan | Admin dan operator login ke dashboard admin untuk mengelola kontak darurat, titik evakuasi, dan panduan kesiapsiagaan. Perubahan langsung tampil di dashboard warga. |
| Hasil | Konten terpusat dan dikelola melalui form terstruktur. |

## 5. Pengelolaan Akun dan Sistem

| Elemen | Detail |
|---|---|
| Nama Proses | Pengelolaan Akun dan Sistem |
| Aktor | Admin |
| Sebelum SIGAP | Tidak ada. |
| Proses Berjalan | Admin mengelola akun dan role, mereset password, membuka kunci akun, dan memantau kesehatan layanan. |
| Hasil | Akses staf terkendali melalui RBAC. |

## 6. Ringkasan Berbasis AI

| Elemen | Detail |
|---|---|
| Nama Proses | Ringkasan dan Rekomendasi Berbasis AI |
| Aktor | Warga Desa |
| Proses Berjalan | Dashboard menyediakan kartu ringkasan dengan konten sementara. Layanan ringkasan AI belum tersedia di backend. |
