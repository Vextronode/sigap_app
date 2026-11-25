# Panduan Firmware Unit Utama

Panduan ini menjelaskan cara menyiapkan, membangun, dan memasang firmware Unit Utama (ESP32-C3) di `firmware/main_device/`. Kontrak perangkat dicatat pada `architecture/05_iot_architecture.md` dan ADR-052.

## 1. Prasyarat

| Kebutuhan | Keterangan |
|---|---|
| PlatformIO Core | Versi yang dipakai CI: 6.2.0 (`pipx install platformio==6.2.0`) |
| Kunci perangkat | Nilai `DEVICE_SHARED_KEY` pada backend tujuan |
| Wi-Fi | SSID dan kata sandi Wi-Fi di lokasi pemasangan |

Platform `espressif32` dan library (`RF24`, `ArduinoJson`) diunduh otomatis oleh PlatformIO sesuai versi di `platformio.ini`.

## 2. Konfigurasi

1. Salin `firmware/main_device/include/secrets.example.h` menjadi `firmware/main_device/include/secrets.h`. Berkas ini diabaikan git.
2. Isi `WIFI_SSID`, `WIFI_PASSWORD`, dan `DEVICE_TOKEN` (sama dengan `DEVICE_SHARED_KEY` backend).
3. Untuk backend selain production, isi `SIGAP_BASE_URL` di `secrets.h`, misalnya `http://192.168.1.10:3000/api/public/device` untuk backend lokal. URL `https://` diverifikasi dengan sertifikat akar di `include/root_ca.h`, sehingga backend HTTPS lain harus memakai rantai sertifikat GlobalSign Root CA R6 atau berkas tersebut diganti.

Identitas perangkat (`DEVICE_CODE`, `DEVICE_NAME`), interval, dan pin modul radio berada di `include/config.h`.

## 3. Build dan Pemasangan

Dijalankan dari `firmware/main_device/`:

| Perintah | Fungsi |
|---|---|
| `pio run` | Compile firmware |
| `pio run -t upload` | Compile lalu tulis ke perangkat yang tersambung lewat USB |
| `pio device monitor` | Membuka log serial (115200 baud) |

## 4. Pemeriksaan Setelah Pemasangan

| Log serial | Arti |
|---|---|
| `[wifi] tersambung, IP ...` | Wi-Fi tersambung |
| `[register] berhasil` | Perangkat terdaftar di backend |
| `[indikator] level=...` | Level diterima dari backend |
| `[indikator] tidak diketahui ...` | Belum ada level, 3 poll gagal berturut-turut, atau backend memberikan `UNKNOWN` |
| `401: DEVICE_TOKEN tidak cocok ...` | `DEVICE_TOKEN` berbeda dengan `DEVICE_SHARED_KEY` backend |

Perangkat tampil aktif pada dashboard admin setelah registrasi berhasil, mengikuti interval pembaruan dashboard (60 detik).

## 5. Batasan Saat Ini

| Bagian | Status |
|---|---|
| Pemetaan LED dan buzzer per level (ADR-015) serta pola mode tidak diketahui | Belum; menunggu rangkaian Tim IoT |
| Tombol fisik dan perintah ke Sirine | Belum |
| Firmware Sirine | Belum ada di repositori; konfigurasi radio wajib sama dengan Unit Utama (ADR-052) |
