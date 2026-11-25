// Firmware Unit Utama SIGAP (ESP32-C3).
// Mengambil level kesiapsiagaan dari backend dengan REST polling (ADR-013) dan melapor
// aktif sesuai kontrak perangkat ADR-052. Sirine tidak pernah dibunyikan otomatis.

#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <RF24.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <esp_arduino_version.h>
#include <esp_task_wdt.h>

#include "config.h"
#include "root_ca.h"

namespace {

RF24 radio(RADIO_CE_PIN, RADIO_CSN_PIN);
WiFiClientSecure secureClient;
WiFiClient plainClient;

bool registered = false;
String currentLevel = "";  // level sah terakhir dari backend, hanya untuk log saat tidak diketahui
uint8_t failedPolls = 0;
bool indicatorUnknown = true;

uint32_t lastPollAt = 0;
uint32_t lastHeartbeatAt = 0;
uint32_t wifiLostAt = 0;
bool firstPoll = true;

bool isValidLevel(const char* level) {
  return level != nullptr && (strcmp(level, "GREEN") == 0 || strcmp(level, "YELLOW") == 0 ||
                              strcmp(level, "ORANGE") == 0 || strcmp(level, "RED") == 0);
}

// Titik sambung tampilan fisik. Saat `unknown`, indikator wajib memakai mode "tidak
// diketahui" yang berbeda dari keempat level, bukan warna level terakhir (ADR-004).
// Pemetaan LED/buzzer per level (ADR-015) dan pola mode tersebut menunggu rangkaian
// dari Tim IoT; saat ini hanya dicetak ke serial.
void updateIndicator(const String& level, bool unknown) {
  if (unknown) {
    Serial.printf("[indikator] tidak diketahui (level terakhir: %s)\n",
                  level.isEmpty() ? "belum ada" : level.c_str());
  } else {
    Serial.printf("[indikator] level=%s\n", level.c_str());
  }
}

void setLevel(const String& level) {
  const bool changed = level != currentLevel || indicatorUnknown;
  currentLevel = level;
  failedPolls = 0;
  indicatorUnknown = false;
  if (changed) updateIndicator(currentLevel, false);
}

void countFailedPoll() {
  if (failedPolls < UINT8_MAX) failedPolls += 1;
  if (failedPolls >= UNKNOWN_AFTER_FAILED_POLLS && !indicatorUnknown) {
    // Level terakhir tidak lagi dianggap valid (ADR-004, ADR-052).
    indicatorUnknown = true;
    updateIndicator(currentLevel, true);
  }
}

void startWatchdog() {
#if ESP_ARDUINO_VERSION_MAJOR >= 3
  const esp_task_wdt_config_t config = {
      .timeout_ms = WATCHDOG_TIMEOUT_MS,
      .idle_core_mask = 0,
      .trigger_panic = true,
  };
  if (esp_task_wdt_reconfigure(&config) != ESP_OK) esp_task_wdt_init(&config);
#else
  esp_task_wdt_init(WATCHDOG_TIMEOUT_MS / 1000, true);
#endif
  esp_task_wdt_add(nullptr);
}

void connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  const uint32_t startedAt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startedAt < WIFI_CONNECT_TIMEOUT_MS) {
    esp_task_wdt_reset();
    delay(250);
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("[wifi] tersambung, IP %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("[wifi] belum tersambung, dicoba ulang di latar belakang");
  }
}

// false bila Wi-Fi terputus; perangkat restart bila Wi-Fi tidak kembali terlalu lama.
bool wifiReady() {
  if (WiFi.status() == WL_CONNECTED) {
    wifiLostAt = 0;
    return true;
  }
  if (wifiLostAt == 0) {
    wifiLostAt = millis();
    Serial.println("[wifi] terputus");
  } else if (millis() - wifiLostAt > WIFI_RESTART_AFTER_MS) {
    Serial.println("[wifi] tidak kembali, restart perangkat");
    ESP.restart();
  }
  return false;
}

// Mengirim request ke backend; mengembalikan kode HTTP (negatif bila gagal tersambung).
int sendRequest(const char* method, const String& path, const String& body, String& response) {
  const String url = String(SIGAP_BASE_URL) + path;
  const bool tls = url.startsWith("https://");

  HTTPClient http;
  http.setConnectTimeout(HTTP_CONNECT_TIMEOUT_MS);
  http.setTimeout(HTTP_READ_TIMEOUT_MS);
  if (!http.begin(tls ? static_cast<WiFiClient&>(secureClient) : plainClient, url)) return -1;

  http.addHeader("x-device-token", DEVICE_TOKEN);
  if (!body.isEmpty()) http.addHeader("Content-Type", "application/json");

  const int code = http.sendRequest(method, body);
  if (code > 0) response = http.getString();
  else Serial.printf("[http] %s %s gagal: %s\n", method, path.c_str(), HTTPClient::errorToString(code).c_str());
  http.end();
  return code;
}

void logUnexpected(const char* action, int code) {
  if (code == 401) Serial.printf("[%s] 401: DEVICE_TOKEN tidak cocok dengan DEVICE_SHARED_KEY backend\n", action);
  else if (code > 0) Serial.printf("[%s] HTTP %d\n", action, code);
}

void registerDevice() {
  JsonDocument payload;
  payload["deviceCode"] = DEVICE_CODE;
  payload["name"] = DEVICE_NAME;
  String body;
  serializeJson(payload, body);

  String response;
  const int code = sendRequest("POST", "/register", body, response);
  registered = code == 200;
  if (registered) Serial.println("[register] berhasil");
  else logUnexpected("register", code);
}

void pollStatus() {
  String response;
  const int code = sendRequest("GET", "/status?deviceCode=" DEVICE_CODE, "", response);
  if (code != 200) {
    logUnexpected("status", code);
    countFailedPoll();
    return;
  }

  JsonDocument doc;
  if (deserializeJson(doc, response)) {
    Serial.println("[status] respons bukan JSON yang valid");
    countFailedPoll();
    return;
  }

  const char* level = doc["data"]["level"];
  if (!isValidLevel(level)) {
    // UNKNOWN atau nilai lain dihitung sebagai poll gagal (ADR-052).
    Serial.printf("[status] level tidak dipakai: %s\n", level ? level : "(kosong)");
    countFailedPoll();
    return;
  }
  setLevel(level);
}

void sendHeartbeat() {
  JsonDocument payload;
  payload["deviceCode"] = DEVICE_CODE;
  payload["firmwareVersion"] = FIRMWARE_VERSION;
  String body;
  serializeJson(payload, body);

  String response;
  const int code = sendRequest("POST", "/heartbeat", body, response);
  if (code == 404) {
    Serial.println("[heartbeat] perangkat belum terdaftar, registrasi ulang");
    registered = false;
  } else if (code != 200) {
    logUnexpected("heartbeat", code);
  }
}

// Konfigurasi harus sama dengan firmware Sirine.
void startRadio() {
  if (!radio.begin()) {
    Serial.println("[radio] modul nRF24 tidak terdeteksi");
    return;
  }
  radio.setChannel(90);
  radio.setDataRate(RF24_250KBPS);
  radio.setPALevel(RF24_PA_HIGH);
  radio.setCRCLength(RF24_CRC_16);
  radio.setAutoAck(true);
  radio.openWritingPipe(0xF0F0F0F0E1LL);
  radio.openReadingPipe(1, 0xF0F0F0F0E2LL);
  radio.startListening();
}

}  // namespace

void setup() {
  Serial.begin(115200);
  Serial.printf("\nSIGAP Unit Utama %s, firmware %s\n", DEVICE_CODE, FIRMWARE_VERSION);
  startWatchdog();

  secureClient.setCACert(ROOT_CA_PEM);
  updateIndicator(currentLevel, true);
  startRadio();
  connectWifi();
}

void loop() {
  esp_task_wdt_reset();
  const uint32_t now = millis();
  const bool pollDue = firstPoll || now - lastPollAt >= STATUS_POLL_INTERVAL_MS;

  if (!wifiReady()) {
    // Tanpa Wi-Fi, setiap jadwal poll dihitung sebagai poll gagal.
    if (pollDue) {
      firstPoll = false;
      lastPollAt = now;
      countFailedPoll();
    }
    delay(100);
    return;
  }

  if (pollDue) {
    firstPoll = false;
    lastPollAt = now;
    // Registrasi diulang paling sering sekali per interval poll.
    if (!registered) registerDevice();
    pollStatus();
  }
  if (registered && now - lastHeartbeatAt >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeatAt = now;
    sendHeartbeat();
  }

  // Tombol fisik dan perintah TRIGGER ke Sirine menyusul (FS-09, Tim IoT).
  delay(50);
}
