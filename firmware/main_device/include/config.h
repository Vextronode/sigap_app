#pragma once

#include <stdint.h>

#if __has_include("secrets.h")
#include "secrets.h"
#else
#error "include/secrets.h belum ada: salin include/secrets.example.h menjadi include/secrets.h lalu isi nilainya."
#endif

// Identitas perangkat; deviceCode harus sama dengan yang terdaftar di backend.
#define DEVICE_CODE "ESP32-CIBENDA-UTAMA"
#define DEVICE_NAME "Indikator Utama Balai Desa Cibenda"

#ifndef SIGAP_BASE_URL
#define SIGAP_BASE_URL "https://sigap-berdampak.widyatama.ac.id/api/public/device"
#endif

#ifndef FIRMWARE_VERSION
#define FIRMWARE_VERSION "dev"
#endif

// Kontrak perangkat (ADR-052): poll status 15 detik, heartbeat 60 detik.
constexpr uint32_t STATUS_POLL_INTERVAL_MS = 15000;
constexpr uint32_t HEARTBEAT_INTERVAL_MS = 60000;

// Indikator masuk mode "tidak diketahui" (ADR-004) setelah 3 poll gagal berturut-turut
// (sekitar 45 detik, sama dengan batas offline backend).
constexpr uint8_t UNKNOWN_AFTER_FAILED_POLLS = 3;

// Batas waktu jaringan; jumlah keduanya di bawah interval poll.
constexpr uint32_t HTTP_CONNECT_TIMEOUT_MS = 5000;
constexpr uint32_t HTTP_READ_TIMEOUT_MS = 5000;
constexpr uint32_t WIFI_CONNECT_TIMEOUT_MS = 20000;

// Perangkat restart bila Wi-Fi tidak kembali selama ini, atau loop macet melewati watchdog.
constexpr uint32_t WIFI_RESTART_AFTER_MS = 5UL * 60UL * 1000UL;
constexpr uint32_t WATCHDOG_TIMEOUT_MS = 60000;

// Pin modul nRF24L01 (CE, CSN), sesuai rangkaian Tim IoT.
constexpr uint8_t RADIO_CE_PIN = 4;
constexpr uint8_t RADIO_CSN_PIN = 5;
