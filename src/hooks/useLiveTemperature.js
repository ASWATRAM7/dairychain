import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

/**
 * Custom hook for real-time temperature data from the DairyChain backend.
 *
 * Connects to the backend via Socket.io WebSocket and fetches historical
 * readings on mount. Automatically reconnects on disconnection.
 *
 * @returns {{
 *   temperature: number | null,
 *   humidity: number | null,
 *   lastUpdate: string | null,
 *   history: Array<{ temperature: number, humidity: number | null, deviceId: string, timestamp: string }>,
 *   isConnected: boolean,
 *   mqttConnected: boolean
 * }}
 *
 * @property {number | null}  temperature   — Latest °C reading from the sensor
 * @property {number | null}  humidity      — Latest % relative humidity (may be null if sensor doesn't report it)
 * @property {string | null}  lastUpdate    — ISO 8601 timestamp of the most recent reading
 * @property {Array}          history       — Rolling window of the last 100 readings
 * @property {boolean}        isConnected   — Whether the WebSocket connection is active
 * @property {boolean}        mqttConnected — Whether backend is connected to the MQTT broker
 */
export const useLiveTemperature = () => {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [history, setHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [mqttConnected, setMqttConnected] = useState(false);
  const [latestReading, setLatestReading] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // ── 1. Fetch historical readings ──────────────────────────
    fetch(`${SOCKET_URL}/api/temperature/history`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Keep only the last 100 for the chart
          const recent = data.slice(-100);
          setHistory(recent);

          // Set current values from the latest entry
          const latest = recent[recent.length - 1];
          setLatestReading(latest);
          setTemperature(latest.temperature);
          setHumidity(latest.humidity);
          setLastUpdate(latest.timestamp);
        }
      })
      .catch((err) => {
        console.warn('⚠️ Could not fetch temperature history:', err.message);
      });

    // Fetch MQTT status
    fetch(`${SOCKET_URL}/api/mqtt/status`)
      .then((res) => res.json())
      .then((data) => {
        setMqttConnected(data.connected === true);
      })
      .catch((err) => console.warn('MQTT status fetch failed:', err));

    // Poll MQTT status every 15 seconds
    const statusInterval = setInterval(() => {
      fetch(`${SOCKET_URL}/api/mqtt/status`)
        .then((res) => res.json())
        .then((data) => setMqttConnected(data.connected === true))
        .catch(() => {});
    }, 15000);

    // ── 2. Connect to Socket.io ───────────────────────────────
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('🟢 WebSocket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔴 WebSocket disconnected');
    });

    // ── 3. Handle incoming readings ───────────────────────────
    socket.on('new-temperature', (reading) => {
      setLatestReading(reading);
      setTemperature(reading.temperature);
      setHumidity(reading.humidity);
      setLastUpdate(reading.timestamp);

      setHistory((prev) => {
        const updated = [...prev, reading];
        // Keep only the last 100 readings
        if (updated.length > 100) {
          return updated.slice(-100);
        }
        return updated;
      });
    });

    // ── 4. Cleanup on unmount ─────────────────────────────────
    return () => {
      clearInterval(statusInterval);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return {
    temperature,
    humidity,
    lastUpdate,
    history,
    isConnected,
    mqttConnected,
    latestReading,
    relay: latestReading?.relay ?? null,
    mode: latestReading?.mode ?? null,
    limit: latestReading?.limit ?? null,
    sensorStatus: latestReading?.status ?? null,
    deviceId: latestReading?.deviceId ?? null,
  };
};
