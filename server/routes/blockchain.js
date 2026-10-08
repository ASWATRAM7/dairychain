const express = require('express');
const crypto = require('crypto');
const blockchainService = require('../services/blockchainService');

const router = express.Router();

// GET /api/blockchain/status
router.get('/status', async (req, res) => {
  try {
    const ready = blockchainService.isReady();
    let total = 0;
    if (ready) {
      try {
        total = await blockchainService.getTotalLogs();
      } catch (e) {
        console.error('Error fetching total logs:', e.message);
      }
    }
    res.json({
      success: true,
      ready,
      contractAddress: process.env.CONTRACT_ADDRESS || null,
      totalLogs: total,
      network: 'Ethereum Sepolia',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/blockchain/verify — body: { data }
// Recomputes hash from provided data and checks against on-chain record
router.post('/verify', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'data is required' });

    const canonical = JSON.stringify({
      temperature: parseFloat(data.temperature),
      humidity: data.humidity != null ? parseFloat(data.humidity) : null,
      deviceId: data.deviceId,
      timestamp: data.timestamp,
    });
    const dataHash = '0x' + crypto.createHash('sha256').update(canonical).digest('hex');

    const exists = await blockchainService.verifyHash(dataHash);
    if (!exists) {
      return res.json({
        success: false,
        verified: false,
        dataHash,
        message: 'Hash not found on-chain',
      });
    }

    const log = await blockchainService.getLogByHash(dataHash);
    res.json({
      success: true,
      verified: true,
      dataHash,
      onChainData: log,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
