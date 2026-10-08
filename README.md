# DairyChain

Blockchain-based milk supply chain temperature tracking web app for Tamil
Nadu's dairy cooperatives. Built with React 18, Vite, Tailwind CSS, React
Router, ethers v6, and Recharts.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (defaults to `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  components/     Shared UI building blocks (Navbar, StatCard, DataTable, ...)
  pages/           One file per route (Landing, Dashboard, BatchDetail, Verify, Ledger, About)
  hooks/           useWallet (ethers/window.ethereum) and useContract (mocked reads/writes)
  contracts/       Contract address + placeholder ABI
  data/mockData.js Mock batches, ledger entries, telemetry, and certificate data
```

## Blockchain integration

- `src/hooks/useWallet.js` connects to an injected wallet (e.g. MetaMask) via
  `ethers.BrowserProvider`, tracks address/chainId/balance, and reacts to
  account/chain changes.
- `src/hooks/useContract.js` currently returns **mock data** for all reads
  and writes so the UI is fully functional without a deployed contract.
  Once a DairyChain contract is deployed, point `CONTRACT_ADDRESS` in
  `src/contracts/contractAddress.js` at it, and swap each function body in
  `useContract.js` for a real `ethers.Contract` call using the ABI in
  `src/contracts/DairyChainABI.json`.

## Notes

- All data (batches, sensor feed, ledger transactions, certificates) is
  mock data defined in `src/data/mockData.js` — replace with live
  `useContract()` reads as the contract comes online.
- Tables use `overflow-x: auto` on small screens; the navbar collapses to a
  hamburger menu below the `md` breakpoint.

## Live Sensor Setup (DHT11)

DairyChain supports **real-time temperature monitoring** from an ESP32 + DHT11
sensor. Readings flow through a Node.js relay server to the React dashboard via
WebSocket.

### Architecture

```
ESP32 + DHT11  ──HTTP POST──►  Node.js Server (port 5000)  ──WebSocket──►  React Dashboard (port 5173)
  (every 5s)                   stores in memory, broadcasts               live chart + stat card
```

### Prerequisites

- **Node.js** v18+ installed
- **ESP32** dev board with a **DHT11** sensor wired up
- **Arduino IDE** with ESP32 board support and the **"DHT sensor library"** by Adafruit
- ESP32 and your PC on the **same WiFi network**

### DHT11 Wiring

| DHT11 Pin | ESP32 Connection | Notes |
|-----------|------------------|-------|
| VCC (+)   | 3.3V             | **Not** 5V — use the 3.3V rail |
| GND (-)   | GND              | |
| DATA (S)  | GPIO 4           | Add a **10kΩ pull-up resistor** between DATA and VCC |

> **Note:** Some DHT11 breakout modules have the pull-up resistor built in.
> Check your module's datasheet. If you get frequent read failures, the pull-up
> is likely missing.

### Step-by-step

You need **3 terminals** running simultaneously:

#### Terminal 1 — Start the backend server

```bash
cd server
npm install
node server.js
```

Expected output:

```
═══════════════════════════════════════════════════
  🧊  DairyChain Temperature Relay Server
═══════════════════════════════════════════════════
  ✅ Backend running on http://0.0.0.0:5000
  📡 POST endpoint: http://192.168.x.x:5000/api/temperature
  🌐 WebSocket:     ws://192.168.x.x:5000
═══════════════════════════════════════════════════
```

> Take note of the IP address printed — you'll need it for the ESP32 sketch.

#### Terminal 2 — Start the React frontend

```bash
npm run dev
```

Open `http://localhost:5173` and navigate to the Dashboard.
The "Avg. Temperature" card will show `—` and "🔴 Disconnected" until the
server is running. Once the server is up, it will show "🟢 Live".

#### Terminal 3 — Upload the ESP32 sketch

1. Open `esp32/esp32_dht11_sensor.ino` in Arduino IDE
2. **Edit these 3 constants:**
   ```cpp
   const char* ssid      = "YOUR_WIFI_SSID";      // ← your WiFi name
   const char* password   = "YOUR_WIFI_PASSWORD";   // ← your WiFi password
   const char* serverUrl  = "http://192.168.x.x:5000/api/temperature";  // ← your PC's IP
   ```
3. Select your board: **Tools → Board → ESP32 Dev Module**
4. Select the COM port: **Tools → Port → COMx**
5. Click **Upload** (→ button)
6. Open **Serial Monitor** (115200 baud)

Expected output:

```
🧊 DairyChain ESP32 + DHT11 Sensor
📶 Connecting to WiFi: MyNetwork.....
✅ Connected! IP: 192.168.1.55
🌡️  Temp: 4.20 °C | 💧 Humidity: 62.30 %
📤 POST: {"temperature":4.20,"humidity":62.30,"deviceId":"MILK-ESP32-01"}
✅ Response [200]: {"success":true,"reading":{...}}
```

### Finding your PC's IP address

**Windows:**
```bash
ipconfig
```
Look for **"IPv4 Address"** under your WiFi adapter (e.g. `192.168.1.42`).

**Mac / Linux:**
```bash
ifconfig    # or: ip addr
```

### Windows Firewall

If the ESP32 can't reach the server (POST fails with error code -1):

1. Open **Windows Defender Firewall** → **Advanced Settings**
2. **Inbound Rules** → **New Rule** → **Port** → **TCP** → **5000** → **Allow**
3. Or: when you first run `node server.js`, Windows may prompt you — click **Allow**

### DHT11 accuracy note

The DHT11 sensor has an accuracy of **±2°C** and only reports integer-degree
precision in some implementations. For production dairy cold-chain monitoring
where precise temperature tracking is critical (2–6°C safe range), consider
upgrading to:

- **DHT22** — ±0.5°C accuracy, wider range (-40 to 80°C)
- **DS18B20** — ±0.5°C accuracy, waterproof probe available

### API Reference (server)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/temperature` | Submit a reading: `{ temperature, humidity?, deviceId }` |
| GET    | `/api/temperature/history` | Get all stored readings (max 200) |
| GET    | `/api/health` | Health check: `{ status, readings }` |
