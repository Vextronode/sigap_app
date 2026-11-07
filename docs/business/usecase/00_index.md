# Use Case Diagram - SIGAP

## 1. Tujuan

Folder ini mendokumentasikan interaksi aktor dengan Sistem SIGAP dalam bentuk Use Case Diagram (PlantUML), dipecah per modul.

## 2. Aktor

| Aktor | Deskripsi | Posisi |
|---|---|---|
| Warga Desa | Pengguna publik tanpa login | Luar sistem |
| Admin | Perangkat desa dengan role `admin` | Luar sistem |
| Operator | Perangkat desa dengan role `operator` | Luar sistem |
| BMKG dan Open-Meteo | Sumber data eksternal | Luar sistem |
| Unit Utama | Perangkat indikator yang membaca level dari backend | Luar sistem |

## 3. Daftar File

| File | Modul | Aktor |
|---|---|---|
| `uc_overview.puml` | Peta seluruh use case | Seluruh aktor |
| `uc_monitoring_lingkungan.puml` | Pemantauan cuaca, gempa, dan tsunami | Warga, BMKG, Open-Meteo |
| `uc_admin_dashboard.puml` | Konten, alert, akun, dan sistem | Admin, Operator |
| `uc_kesiapsiagaan_iot.puml` | Level kesiapsiagaan, notifikasi, dan perangkat | Warga, Unit Utama |

## 4. Legenda Notasi

| Notasi | Arti |
|---|---|
| Kotak bertitel "Sistem SIGAP" | Boundary sistem |
| Oval | Use case |
| Stick figure | Aktor |
| `<<include>>` | Sub-proses yang selalu dijalankan |

## 5. Cara Render

Diagram dirender dengan ekstensi PlantUML pada VS Code, `java -jar plantuml.jar nama_file.puml`, atau server PlantUML.

## 6. Referensi Silang

| Use Case | Proses pada `bw_sigap.md` |
|---|---|
| Lihat Dashboard Lingkungan, Lihat Ringkasan AI | 1, 6 |
| Terima Notifikasi Level Alert, Klasifikasi Alert | 2 |
| Lihat Info Kesiapsiagaan, Buka Navigasi | 3 |
| Kelola Kontak Darurat, Titik Evakuasi, Panduan | 4 |
| Manajemen Akun dan Role, Pantau Kesehatan Sistem | 5 |
