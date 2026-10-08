/*
 * ═══════════════════════════════════════════════════════════════════
 *  DairyChain — ESP32 + DHT11 Temperature & Humidity Sensor
 *  Sends readings to the DairyChain backend every 5 seconds via HTTP POST
 * ═══════════════════════════════════════════════════════════════════
 *
 *  ▸ SETUP CHECKLIST:
 *
 *  1. WIFI CREDENTIALS
 *     Change the `ssid` and `password` constants below to match
 *     your WiFi network name and password.
 *
 *  2. SERVER IP ADDRESS
 *     Change the `serverUrl` constant below.
 *     Find your PC's local IP address:
 *       • Windows:  Open Command Prompt → type `ipconfig`
 *                   Look for "IPv4 Address" under your WiFi adapter
 *                   (e.g. 192.168.1.42)
 *       • Mac/Linux: Open Terminal → type `ifconfig` or `ip addr`
 *     Replace YOUR_PC_IP with that address.
 *     Example: "http://192.168.1.42:5000/api/temperature"
 *
 *  3. SAME WIFI NETWORK
 *     The ESP32 and your PC running the Node.js server MUST be
 *     connected to the SAME WiFi network.
 *
 *  4. WINDOWS FIREWALL
 *     If the ESP32 can't reach the server:
 *       • Open Windows Defender Firewall → Advanced Settings
 *       • Inbound Rules → New Rule → Port → TCP 5000 → Allow
 *       • Or: allow "Node.js" through the firewall when prompted
 *
 *  5. DHT11 WIRING
 *     ┌─────────────┬────────────────────────────────────────────┐
 *     │  DHT11 Pin  │  ESP32 Connection                         │
 *     ├─────────────┼────────────────────────────────────────────┤
 *     │  VCC (+)    │  3.3V                                     │
 *     │  GND (-)    │  GND                                      │
 *     │  DATA (S)   │  GPIO 4  (with 10kΩ pull-up to 3.3V)     │
 *     └─────────────┴────────────────────────────────────────────┘
 *
 *     Pull-up resistor: Connect a 10kΩ resistor between the DATA
 *     pin and VCC (3.3V). Some DHT11 breakout modules have this
 *     resistor built in — check your module's datasheet.
 *
 *  6. DHT11 SPECIFICATIONS
 *     • Temperature range: 0–50°C (accuracy ±2°C)
 *     • Humidity range:    20–90% RH (accuracy ±5%)
 *     • Minimum read interval: 2 seconds
 *       (we use 5 seconds to be safe and reduce server load)
 *     • Note: DHT11 is less precise than DS18B20 (±0.5°C).
 *       For dairy cold-chain monitoring, consider upgrading to
 *       DHT22 or DS18B20 for production use.
 *
 *  7. ARDUINO IDE SETUP
 *     • Board: "ESP32 Dev Module" (or your specific ESP32 board)
 *     • Install library: "DHT sensor library" by Adafruit
 *       (Sketch → Include Library → Manage Libraries → search "DHT")
 *     • Also install: "Adafruit Unified Sensor" (dependency)
 *
 * ═══════════════════════════════════════════════════════════════════
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// ─── DHT11 Sensor Configuration ────────────────────────────────
#define DHTPIN    4        // GPIO pin connected to the DHT11 DATA pin
#define DHTTYPE   DHT11    // DHT11 sensor type

DHT dht(DHTPIN, DHTTYPE);

// ─── WiFi Credentials (CHANGE THESE) ───────────────────────────
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ─── DairyChain Backend URL (CHANGE THIS) ──────────────────────
// Replace YOUR_PC_IP with your computer's local IPv4 address
// Example: "http://192.168.1.42:5000/api/temperature"
const char* serverUrl = "http://YOUR_PC_IP:5000/api/temperature";

// ─── Timing ────────────────────────────────────────────────────
const unsigned long SEND_INTERVAL = 5000;  // 5 seconds between readings
unsigned long lastSendTime = 0;

// ─── Function Prototypes ───────────────────────────────────────
void sendToServer(float temperature, float humidity);

// ═══════════════════════════════════════════════════════════════
//  SETUP
// ═══════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("═══════════════════════════════════════════");
  Serial.println("  🧊 DairyChain ESP32 + DHT11 Sensor");
  Serial.println("═══════════════════════════════════════════");
  Serial.println();

  // Initialize DHT11 sensor
  dht.begin();
  Serial.println("🌡️  DHT11 sensor initialized on GPIO " + String(DHTPIN));

  // Connect to WiFi
  Serial.print("📶 Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    attempts++;

    if (attempts > 40) {  // 20 second timeout
      Serial.println();
      Serial.println("❌ WiFi connection failed! Check SSID and password.");
      Serial.println("   Restarting in 5 seconds...");
      delay(5000);
      ESP.restart();
    }
  }

  Serial.println();
  Serial.println("✅ Connected! IP: " + WiFi.localIP().toString());
  Serial.println("📡 Server endpoint: " + String(serverUrl));
  Serial.println("⏱️  Send interval: " + String(SEND_INTERVAL / 1000) + " seconds");
  Serial.println();
  Serial.println("═══════════════════════════════════════════");
  Serial.println("  Sending readings...");
  Serial.println("═══════════════════════════════════════════");
  Serial.println();
}

// ═══════════════════════════════════════════════════════════════
//  LOOP
// ═══════════════════════════════════════════════════════════════
void loop() {
  unsigned long now = millis();

  // Only read and send every SEND_INTERVAL milliseconds
  if (now - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = now;

    // Read humidity and temperature from DHT11
    float humidity = dht.readHumidity();
    float tempC    = dht.readTemperature();

    // Validate readings (DHT11 returns NaN on failure)
    if (isnan(humidity) || isnan(tempC)) {
      Serial.println("❌ DHT11 read failed — check wiring and pull-up resistor!");
      return;
    }

    // Log to Serial Monitor
    Serial.println("🌡️  Temp: " + String(tempC, 2) + " °C | 💧 Humidity: " + String(humidity, 2) + " %");

    // Send to DairyChain backend
    sendToServer(tempC, humidity);
  }
}

// ═══════════════════════════════════════════════════════════════
//  SEND READING TO SERVER VIA HTTP POST
// ═══════════════════════════════════════════════════════════════
void sendToServer(float temperature, float humidity) {
  // Check WiFi connection first
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️  WiFi disconnected — skipping send. Reconnecting...");
    WiFi.begin(ssid, password);
    return;
  }

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  // Build JSON payload
  String payload = "{\"temperature\":" + String(temperature, 2) +
                   ",\"humidity\":"    + String(humidity, 2) +
                   ",\"deviceId\":\"MILK-ESP32-01\"}";

  Serial.println("📤 POST: " + payload);

  // Send HTTP POST request
  int responseCode = http.POST(payload);

  if (responseCode > 0) {
    Serial.println("✅ Response [" + String(responseCode) + "]: " + http.getString());
  } else {
    Serial.println("❌ POST failed, error code: " + String(responseCode));
    Serial.println("   Check: server running? firewall open? correct IP?");
  }

  http.end();
}
