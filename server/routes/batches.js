const express = require('express');
const jwt = require('jsonwebtoken');
const Batch = require('../models/Batch');
const ScanLog = require('../models/ScanLog');

const router = express.Router();

// Optional auth — attaches user if token present, does not block
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch (err) {
    // Ignore invalid token — treat as public
  }
  next();
};

// Middleware: require auth
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

// POST /api/batches — create a new batch (auth required)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { batchId, origin, collectionCenter, volume, route } = req.body;

    if (!batchId || !batchId.trim()) {
      return res.status(400).json({ error: 'Batch ID is required' });
    }

    const normalizedId = batchId.trim().toUpperCase();

    const existing = await Batch.findOne({ batchId: normalizedId });
    if (existing) {
      return res.status(400).json({ error: 'A batch with this ID already exists' });
    }

    const newBatch = new Batch({
      batchId: normalizedId,
      origin: origin || '',
      collectionCenter: collectionCenter || '',
      volume: volume || '',
      route: route || '',
      createdBy: req.user.id,
    });
    await newBatch.save();

    res.status(201).json({ success: true, batch: newBatch });
  } catch (err) {
    console.error('Batch create error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// GET /api/batches — list all batches (admin + inspector only)
router.get('/', requireAuth, async (req, res) => {
  try {
    if (!['admin', 'inspector'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const batches = await Batch.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, batches });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// GET /api/batches/:batchId — fetch a single batch (public — for verification)
router.get('/:batchId', optionalAuth, async (req, res) => {
  try {
    const batchId = req.params.batchId.trim().toUpperCase();
    const batch = await Batch.findOne({ batchId });
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }
    res.json({ success: true, batch });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// GET /api/batches/:batchId/scans — get scan history for a batch
router.get('/:batchId/scans', optionalAuth, async (req, res) => {
  try {
    const batchId = req.params.batchId.trim().toUpperCase();
    const scans = await ScanLog.find({ batchId }).sort({ createdAt: -1 }).limit(200);

    // Only admin and inspector can see scanner email / role
    const isPrivileged = req.user && ['admin', 'inspector'].includes(req.user.role);
    const sanitized = scans.map((scan) => {
      const obj = scan.toObject();
      if (!isPrivileged) {
        delete obj.scannerEmail;
        delete obj.scannerRole;
        delete obj.scannedBy;
        delete obj.ipAddress;
      }
      return obj;
    });

    res.json({ success: true, scans: sanitized });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;
