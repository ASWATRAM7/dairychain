const express = require('express');
const jwt = require('jsonwebtoken');
const ScanLog = require('../models/ScanLog');
const Batch = require('../models/Batch');

const router = express.Router();

const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch (err) {
    // ignore — public scan
  }
  next();
};

// POST /api/scans — record a scan event (public, optional auth)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { batchId, scanType, location, userAgent } = req.body;

    if (!batchId || !batchId.trim()) {
      return res.status(400).json({ error: 'batchId is required' });
    }

    const normalizedId = batchId.trim().toUpperCase();

    // Check if batch exists
    const batch = await Batch.findOne({ batchId: normalizedId });
    const verificationResult = batch ? 'valid' : 'not_found';

    const scanLog = new ScanLog({
      batchId: normalizedId,
      scannedBy: req.user ? req.user.id : undefined,
      scannerEmail: req.user ? req.user.email : 'public',
      scannerRole: req.user ? req.user.role : 'public',
      scanType: scanType || 'qr',
      location: location || {},
      userAgent: userAgent || req.headers['user-agent'] || '',
      verified: verificationResult === 'valid',
      verificationResult,
      ipAddress: req.ip || '',
    });
    await scanLog.save();

    // Broadcast scan event to all connected clients via Socket.io
    // The io instance is attached to the app via app.set('io', io) in server.js
    const io = req.app.get('io');
    if (io) {
      io.emit('new-scan', {
        batchId: normalizedId,
        scanType: scanLog.scanType,
        scannerRole: scanLog.scannerRole,
        verified: scanLog.verified,
        timestamp: scanLog.createdAt,
        location: scanLog.location,
      });
    }

    res.status(201).json({
      success: true,
      scan: scanLog,
      batch: batch || null,
    });
  } catch (err) {
    console.error('Scan log error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// GET /api/scans/recent — get recent scans across all batches (inspector + admin)
router.get('/recent', optionalAuth, async (req, res) => {
  try {
    if (!req.user || !['admin', 'inspector'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const scans = await ScanLog.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, scans });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;
