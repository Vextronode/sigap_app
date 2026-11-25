#pragma once

// Salin file ini menjadi secrets.h (diabaikan git) lalu isi nilainya.

// Wi-Fi lokasi pemasangan Unit Utama.
#define WIFI_SSID "nama-wifi"
#define WIFI_PASSWORD "password-wifi"

// Sama dengan DEVICE_SHARED_KEY di backend (openssl rand -hex 32).
#define DEVICE_TOKEN "isi-dengan-device-shared-key"

// Opsional: backend selain production, mis. staging atau backend lokal
// (http:// tanpa TLS hanya untuk pengujian di jaringan sendiri).
// #define SIGAP_BASE_URL "http://192.168.1.10:3000/api/public/device"
