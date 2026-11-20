#include <WiFi.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <RF24.h>
#include <ArduinoJson.h>

// ---------- Configuration ----------
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
  String payload = String("{\"deviceCode\":\"") + DEVICE_CODE + "\",\"name\":\"" + DEVICE_NAME + "\"}";
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
    Serial.printf("Level from backend: %s\n", level);
    // TODO: set LED / buzzer based on level
  }
  http.end();
}

void sendHeartbeat(const char* level) {
  HTTPClient http;
  http.begin(String(BASE_URL) + "/heartbeat");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-token", getToken());
  String payload = String("{\"deviceCode\":\"") + DEVICE_CODE + "\",\"currentLevel\":\"" + level + "\",\"device2Online\":true,\"device2ErrorCode\":0,\"lastTriggerCommand\":\"NONE\",\"lastTriggerResult\":\"NONE\",\"radioReinitCount\":0}";
  http.POST(payload);
  http.end();
}

void setup() {
  Serial.begin(115200);
  pref.begin("sigap", false);
  // For testing only – replace with real secret before flashing production devices
  // pref.putString("dev_token", "YOUR_DEVICE_SHARED_KEY_HERE"); // TODO: set real device token via registerDevice

  WiFi.begin("fallback_ssid", "fallback_pwd");
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println("WiFi connected");

  // Radio init – must match sirine device
  radio.begin();
  radio.setChannel(90);
  radio.setDataRate(RF24_250KBPS);
  radio.setPALevel(RF24_PA_HIGH);
  radio.setCRCLength(RF24_CRC_16);
  radio.setAutoAck(false);
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
