/**
 * DairyChain Backend Server
 *
 * Express + Socket.io server that receives temperature readings from ESP32
 * sensors via HTTP POST and broadcasts them to connected React clients
 * via WebSocket in real time.
 *
 * Routes:
 *   POST /api/temperature      — Receive a new sensor reading
 *   GET  /api/temperature/history — Retrieve all stored readings
 *   GET  /api/health            — Health check endpoint
 *
 * WebSocket Events:
 *   "new-temperature" — Emitted to all clients when a reading arrives
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const crypto = require('crypto');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const accessRequestRoutes = require('./routes/accessRequests');
const userRoutes = require('./routes/users');
const batchRoutes = require('./routes/batches');
const scanRoutes = require('./routes/scans');
const blockchainRoutes = require('./routes/blockchain');
const blockchainService = require('./services/blockchainService');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected:', process.env.MONGO_URI);
    blockchainService.init();
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/access-requests', accessRequestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/blockchain', blockchainRoutes);

// ─── In-memory readings store (FIFO, max 200) ──────────────────
const MAX_READINGS = 200;
const readings = [];

// ─── Helper: get local network IP ──────────────────────────────
function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// ─── Routes ─────────────────────────────────────────────────────

/**
 * POST /api/temperature
 *
 * Accepts a JSON body with sensor data from ESP32.
 *
 * @body {number}  temperature  — Temperature in °C (required)
 * @body {number}  [humidity]   — Relative humidity in % (optional)
 * @body {string}  deviceId     — Identifier for the sensor device (required)
 *
 * @returns {{ success: boolean, reading: object }}
 */
app.post('/api/temperature', (req, res) => {
  const rawTemp =
    req.body.milkTemperature !== undefined
      ? req.body.milkTemperature
      : req.body.temperature;
  const { humidity, deviceId, relay, mode, limit, status } = req.body;

  const temperature = parseFloat(rawTemp);

  // Validate temperature is a number
  if (isNaN(temperature)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or missing "temperature" or "milkTemperature" — must be a number.',
    });
  }

  // Validate deviceId is present
  const resolvedDeviceId = deviceId || 'MILK-ESP32-01';

  // Build reading with server-side timestamp
  const reading = {
    temperature,
    humidity: humidity !== undefined && humidity !== null ? parseFloat(humidity) : null,
    deviceId: resolvedDeviceId,
    timestamp: new Date().toISOString(),
    source: 'http',
    milkTemperature: temperature,
    relay: relay || null,
    mode: mode || null,
    limit: limit != null ? parseFloat(limit) : null,
    status: status || null,
  };

  // Store (FIFO — drop oldest when at capacity)
  readings.push(reading);
  if (readings.length > MAX_READINGS) {
    readings.shift();
  }

  // Broadcast to all connected WebSocket clients
  io.emit('new-temperature', reading);

  // Console log
  const time = new Date().toLocaleTimeString();
  const humStr = reading.humidity !== null ? `${reading.humidity}%` : 'N/A';
  console.log(`📥 [${time}] ${reading.deviceId}: ${reading.temperature}°C | Humidity: ${humStr}`);

  return res.status(200).json({ success: true, reading });
});

/**
 * GET /api/temperature/history
 *
 * Returns the full in-memory readings array.
 *
 * @returns {Array<{ temperature, humidity, deviceId, timestamp }>}
 */
app.get('/api/temperature/history', (req, res) => {
  return res.status(200).json(readings);
});

/**
 * GET /api/health
 *
 * Simple health check.
 *
 * @returns {{ status: string, readings: number }}
 */
app.get('/api/health', (req, res) => {
  return res.status(200).json({ status: 'ok', readings: readings.length });
});

/**
 * GET /api/mqtt/status
 *
 * Checks MQTT broker connection status.
 */
app.get('/api/mqtt/status', (req, res) => {
  res.json({
    connected: mqttClient ? mqttClient.connected : false,
    broker: MQTT_BROKER_URL,
    topic: PRIMARY_MQTT_TOPIC,
    topics: MQTT_TOPICS,
    readings: readings.length,
  });
});

// ─── Socket.io ──────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Send the latest reading immediately if available
  if (readings.length > 0) {
    socket.emit('new-temperature', readings[readings.length - 1]);
  }

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ─── Start Server ───────────────────────────────────────────────
const PORT = 5000;
const localIP = getLocalIP();

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('  🧊  DairyChain Temperature Relay Server');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  ✅ Backend running on http://0.0.0.0:${PORT}`);
  console.log(`  📡 POST endpoint: http://${localIP}:${PORT}/api/temperature`);
  console.log(`  🌐 WebSocket:     ws://${localIP}:${PORT}`);
  console.log(`  📜 History:       http://localhost:${PORT}/api/temperature/history`);
  console.log(`  💚 Health:        http://localhost:${PORT}/api/health`);
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log('  Waiting for ESP32 sensor data...');
  console.log('');
});

// ============================================================
// MQTT SUBSCRIBER — Bridges ESP32 sensor data into the app
// ============================================================

const MQTT_BROKER_URL = 'mqtt://broker.emqx.io:1883';
const PRIMARY_MQTT_TOPIC = 'smartfarm/field1/sensors';
const MQTT_TOPICS = [
  'smartfarm/field1/sensors',
  'dairychain/sensors/temperature',
  'dairychain',
];

console.log('🔄 Connecting to MQTT broker:', MQTT_BROKER_URL);

const mqttClient = mqtt.connect(MQTT_BROKER_URL, {
  clientId: 'dairychain_backend_' + Math.random().toString(16).slice(2, 10),
  clean: true,
  reconnectPeriod: 5000,
  connectTimeout: 10000,
});

mqttClient.on('connect', () => {
  console.log('✅ MQTT connected to broker');
  MQTT_TOPICS.forEach((topic) => {
    mqttClient.subscribe(topic, { qos: 0 }, (err) => {
      if (err) {
        console.error(`❌ MQTT subscribe error for ${topic}:`, err.message);
      } else {
        console.log(`📡 MQTT subscribed to topic: ${topic}`);
      }
    });
  });
});

mqttClient.on('message', async (topic, message) => {
  try {
    const raw = message.toString();
    console.log(`📥 MQTT [${topic}]:`, raw);

    const data = JSON.parse(raw);

    // Support both `milkTemperature` and standard `temperature` / `temp`
    const rawTemp =
      data.milkTemperature !== undefined
        ? data.milkTemperature
        : (data.temperature !== undefined ? data.temperature : data.temp);

    const temperature = parseFloat(rawTemp);

    // Validate
    if (isNaN(temperature)) {
      console.warn('⚠️ Invalid temperature in MQTT message:', raw);
      return;
    }

    const newReading = {
      temperature,
      humidity: data.humidity != null ? parseFloat(data.humidity) : null,
      deviceId: data.deviceId || 'MILK-ESP32-01',
      timestamp: new Date().toISOString(),
      source: 'mqtt',
      topic,
      milkTemperature: temperature,
      relay: data.relay || null,
      mode: data.mode || null,
      limit: data.limit != null ? parseFloat(data.limit) : null,
      status: data.status || null,
    };

    // Store in the existing in-memory array
    readings.push(newReading);
    if (readings.length > 200) readings.shift();

    // Compute SHA-256 hash of the canonical JSON
    const canonical = JSON.stringify({
      temperature: newReading.temperature,
      humidity: newReading.humidity,
      deviceId: newReading.deviceId,
      timestamp: newReading.timestamp,
    });
    const dataHash = '0x' + crypto.createHash('sha256').update(canonical).digest('hex');
    newReading.dataHash = dataHash;

    // Anchor to blockchain (non-blocking)
    if (blockchainService.isReady()) {
      try {
        const result = await blockchainService.anchorLog(
          dataHash,
          newReading.deviceId,
          newReading.temperature,
          newReading.humidity || 0
        );
        newReading.txHash = result.txHash;
        newReading.blockNumber = result.blockNumber;
        newReading.onChain = true;
        console.log(`⛓️  Anchored on-chain: ${dataHash.slice(0, 12)}... | tx: ${result.txHash.slice(0, 12)}...`);
      } catch (err) {
        console.error('⛓️  Anchor failed:', err.message);
        newReading.onChain = false;
      }
    } else {
      newReading.onChain = false;
    }

    // Broadcast to all React clients via Socket.io
    io.emit('new-temperature', newReading);

    const extraInfo = [
      newReading.relay ? `Relay: ${newReading.relay}` : null,
      newReading.mode ? `Mode: ${newReading.mode}` : null,
      newReading.limit != null ? `Limit: ${newReading.limit}°C` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    console.log(
      `✅ Broadcast to React: ${newReading.temperature}°C${
        newReading.humidity != null ? ` | ${newReading.humidity}%` : ''
      }${extraInfo ? ` | ${extraInfo}` : ''}`
    );
  } catch (err) {
    console.error('❌ MQTT parse error:', err.message);
  }
});

mqttClient.on('error', (err) => {
  console.error('❌ MQTT error:', err.message);
});

mqttClient.on('offline', () => {
  console.warn('⚠️ MQTT offline — will retry in 5s');
});

mqttClient.on('reconnect', () => {
  console.log('🔄 MQTT reconnecting...');
});

