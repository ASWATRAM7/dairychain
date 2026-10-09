const express = require('express');
const jwt = require('jsonwebtoken');
const JourneyEvent = require('../models/JourneyEvent');
const Batch = require('../models/Batch');
const ScanLog = require('../models/ScanLog');
const crypto = require('crypto');
const blockchainService = require('../services/blockchainService');

const router = express.Router();

const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============================================================
// GET /api/journey/:batchId — full journey for a batch
// Public — anyone can query (like a public traceability page)
// ============================================================
router.get('/:batchId', async (req, res) => {
  try {
    const batchId = req.params.batchId.trim().toUpperCase();

    const [batch, events, scans] = await Promise.all([
      Batch.findOne({ batchId }),
      JourneyEvent.find({ batchId }).sort({ createdAt: 1 }),
      ScanLog.find({ batchId }).sort({ createdAt: -1 }).limit(50),
    ]);

    if (!batch && events.length === 0) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    // Compute summary stats
    const temperatures = events
      .map((e) => e.temperature)
      .filter((t) => typeof t === 'number' && !isNaN(t));

    const stats = {
      totalEvents: events.length,
      minTemp: temperatures.length ? Math.min(...temperatures) : null,
      maxTemp: temperatures.length ? Math.max(...temperatures) : null,
      avgTemp: temperatures.length
        ? Number((temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(2))
        : null,
      violations: events.filter((e) => e.status === 'critical').length,
      onChainCount: events.filter((e) => e.onChain).length,
      totalScans: scans.length,
    };

    // Build timeline ordered by stage
    const STAGE_ORDER = [
      'farm_collection',
      'chilling_center',
      'transport',
      'processing_plant',
      'cold_storage',
      'retail_delivery',
      'consumer',
    ];

    const timeline = STAGE_ORDER.map((stage) => {
      const stageEvents = events.filter((e) => e.stage === stage);
      return {
        stage,
        label: stageLabel(stage),
        events: stageEvents,
        completed: stageEvents.length > 0,
        firstAt: stageEvents[0] ? stageEvents[0].createdAt : null,
        lastAt: stageEvents.length
          ? stageEvents[stageEvents.length - 1].createdAt
          : null,
      };
    });

    res.json({
      success: true,
      batch: batch || { batchId },
      stats,
      timeline,
      events,
      scans,
    });
  } catch (err) {
    console.error('Journey fetch error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// ============================================================
// POST /api/journey/:batchId/events — add a journey event
// Requires auth (admin, inspector, transport)
// ============================================================
router.post('/:batchId/events', requireAuth, async (req, res) => {
  try {
    const batchId = req.params.batchId.trim().toUpperCase();
    const {
      stage,
      stageLabel: customLabel,
      location,
      handler,
      handlerRole,
      temperature,
      humidity,
      notes,
      advanceBatch,
    } = req.body;

    if (!stage) {
      return res.status(400).json({ error: 'stage is required' });
    }

    // Check if batch exists — create a stub if it doesn't (dev-friendly)
    let batch = await Batch.findOne({ batchId });
    if (!batch) {
      batch = new Batch({
        batchId,
        createdBy: req.user?.id || req.user?._id,
        currentStage: stageLabel(stage),
      });
      await batch.save();
    }

    // Compute status
    const safeMin = batch.safeTempMin != null ? batch.safeTempMin : 2;
    const safeMax = batch.safeTempMax != null ? batch.safeTempMax : 6;
    let status = 'safe';
    const parsedTemp = temperature != null ? parseFloat(temperature) : undefined;
    const parsedHumidity = humidity != null ? parseFloat(humidity) : undefined;

    if (typeof parsedTemp === 'number' && !isNaN(parsedTemp)) {
      if (parsedTemp > safeMax || parsedTemp < safeMin) status = 'critical';
    }

    // Compute SHA-256 hash
    const canonical = JSON.stringify({
      batchId,
      stage,
      temperature: parsedTemp ?? null,
      humidity: parsedHumidity ?? null,
      timestamp: new Date().toISOString(),
    });
    const dataHash = '0x' + crypto.createHash('sha256').update(canonical).digest('hex');

    const event = new JourneyEvent({
      batchId,
      stage,
      stageLabel: customLabel || stageLabel(stage),
      location,
      handler,
      handlerRole,
      temperature: parsedTemp,
      humidity: parsedHumidity,
      safeTempMin: safeMin,
      safeTempMax: safeMax,
      status,
      notes,
      dataHash,
    });

    // Anchor to blockchain (non-blocking)
    if (blockchainService.isReady() && typeof parsedTemp === 'number' && !isNaN(parsedTemp)) {
      try {
        const result = await blockchainService.anchorLog(
          dataHash,
          `${batchId}:${stage}`,
          parsedTemp,
          parsedHumidity || 0
        );
        event.txHash = result.txHash;
        event.blockNumber = result.blockNumber;
        event.onChain = true;
      } catch (err) {
        console.error('⛓️  Journey anchor failed:', err.message);
      }
    }

    await event.save();

    // Update batch current state
    if (advanceBatch !== false && typeof parsedTemp === 'number' && !isNaN(parsedTemp)) {
      batch.currentTemperature = parsedTemp;
      if (parsedHumidity != null) batch.currentHumidity = parsedHumidity;
      batch.currentStage = event.stageLabel;
      batch.status = status;
      if (event.onChain) {
        batch.blockchainHash = event.dataHash;
        batch.blockNumber = event.blockNumber;
      }
      batch.updatedAt = new Date();
      await batch.save();
    }

    // Broadcast to clients
    const io = req.app.get('io');
    if (io) {
      io.emit('journey-update', {
        batchId,
        event: event.toObject(),
        stats: { stage, status, temperature: parsedTemp },
      });
    }

    res.status(201).json({ success: true, event });
  } catch (err) {
    console.error('Journey event error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// ============================================================
// GET /api/journey — list recent batches with journey summary
// ============================================================
router.get('/', async (req, res) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, batches });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Helper
function stageLabel(stage) {
  const labels = {
    farm_collection: 'Farm Collection',
    chilling_center: 'Chilling Center',
    transport: 'Transport',
    processing_plant: 'Processing Plant',
    cold_storage: 'Cold Storage',
    retail_delivery: 'Retail Delivery',
    consumer: 'Consumer',
  };
  return labels[stage] || stage;
}

module.exports = router;
