# IoT Connection Guide

This guide explains the minimal changes required to make the SIGAP IoT devices communicate with the backend platform.

## 1. Backend secret
Create a **`.env`** file (do **not** commit it) in the project root and add the secret that the devices will use:
```
DEVICE_SHARED_KEY=YOUR_DEVICE_SHARED_KEY_HERE
```
A sample file **`.env.example`** is provided in the repo for reference.

## 2. Firmware (Main Device)
Place the following sketch in `firmware/main_device/main.ino` and flash it to the ESP32‑C3:
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <RF24.h>

// ----------- Configuration -----------
#define DEVICE_CODE   "ESP32-CIBENDA-UTAMA"
#define DEVICE_NAME   "Indikator Utama Balai Desa Cibenda"
#define BASE_URL      "https://sigap-berdampak.widyatama.ac.id/api/public/device"

Preferences pref;               // store token locally
RF24 radio(4, 5);               // CE, CSN pins (adjust if needed)

String getToken() { return pref.getString("dev_token", ""); }

void registerDevice() {
  HTTPClient http;
  http.begin(String(BASE_URL) + "/register");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-token", getToken());
  String payload = String("{\"deviceCode\":\"") + DEVICE_CODE + \"\",\"name\":\"") + DEVICE_NAME + \"\"}";
  int code = http.POST(payload);
  Serial.printf("Register HTTP %d\n", code);
  http.end();
}

void fetchWifiConfig() {
  HTTPClient http;
  http.begin(String(BASE_URL) + "/wifi-config?deviceCode=" + DEVICE_CODE);
  http.addHeader("x-device-token", getToken());
  int code = http.GET();
  if (code == 200) {
    String body = http.getString();
    DynamicJsonDocument doc(256);
    deserializeJson(doc, body);
    const char* ssid = doc["data"]["ssid"];
    const char* pwd  = doc["data"]["password"];
    if (ssid && pwd) {
      WiFi.begin(ssid, pwd);
      while (WiFi.status() != WL_CONNECTED) delay(500);
      Serial.println("WiFi re‑connected from backend config");
    }
  }
  http.end();
}

void pollStatus() {
  HTTPClient http;
  http.begin(String(BASE_URL) + "/status");
  http.addHeader("x-device-token", getToken());
  int code = http.GET();
  if (code == 200) {
    String body = http.getString();
    DynamicJsonDocument doc(256);
    deserializeJson(doc, body);
    const char* level = doc["data"]["level"];
    // TODO: set LED / buzzer based on level
    Serial.printf("Level from backend: %s\n", level);
  }
  http.end();
}

void sendHeartbeat(const char* level) {
  HTTPClient http;
  http.begin(String(BASE_URL) + "/heartbeat");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-token", getToken());
  String payload = String("{\"deviceCode\":\"") + DEVICE_CODE + \"\",\"currentLevel\":\"") + level + \"\",\"device2Online\":true,\"device2ErrorCode\":0,\"lastTriggerCommand\":\"NONE\",\"lastTriggerResult\":\"NONE\",\"radioReinitCount\":0}";
  http.POST(payload);
  http.end();
}

void setup() {
  Serial.begin(115200);
  pref.begin("sigap", false);
  // put the real secret here for local testing – never commit this file
  pref.putString("dev_token", "YOUR_DEVICE_SHARED_KEY_HERE");

  WiFi.begin("fallback_ssid", "fallback_pwd");
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println("WiFi connected");

  // Radio init – same config as sirine device
  radio.begin();
  radio.setChannel(90);
  radio.setDataRate(RF24_250KBPS);
  radio.setPALevel(RF24_PA_HIGH);
  radio.setCRCLength(RF24_CRC_16);
  radio.setAutoACK(false);
  radio.openWritingPipe(0xF0F0F0F0E1LL);
  radio.openReadingPipe(1, 0xF0F0F0F0E2LL);
  radio.startListening();

  registerDevice();
  fetchWifiConfig();
}

unsigned long lastStatus = 0, lastHB = 0, lastWifi = 0;
void loop() {
  unsigned long now = millis();
  if (now - lastStatus >= 5000) { pollStatus(); lastStatus = now; }
  if (now - lastHB >= 60000)   { sendHeartbeat("UNKNOWN"); lastHB = now; }
  if (now - lastWifi >= 300000) { fetchWifiConfig(); lastWifi = now; }
  // TODO: read button and send radio TRIGGER_* commands
}
```
> **Important:** The line `pref.putString("dev_token", "YOUR_DEVICE_SHARED_KEY_HERE");` is only for local testing. In production you will flash the device with the real secret and **remove** the hard‑coded value.

## 3. Sirine firmware (optional)
Create a similar sketch in `firmware/sirine_device/sirine.ino` that reads the radio messages, triggers the DFPlayer and replies with `ACK_PLAY`. The radio configuration **must match** the main device (channel 90, 250 kbps, PA HIGH, CRC 16, auto‑ACK disabled).

## 4. Documentation
The repository now contains:
- `.env.example` – shows the required environment variable.
- `docs/iot-connection.md` – this guide.
- Firmware skeletons in `firmware/`.

## 5. Git safety
`.gitignore` already excludes any real `.env` files, so the secret will never be committed.
