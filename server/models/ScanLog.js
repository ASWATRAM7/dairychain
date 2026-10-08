const mongoose = require('mongoose');

const scanLogSchema = new mongoose.Schema({
  batchId: { type: String, required: true, trim: true, uppercase: true, index: true },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scannerEmail: { type: String, lowercase: true, trim: true },
  scannerRole: { type: String, enum: ['admin', 'transport', 'inspector', 'public'] },
  scanType: { type: String, enum: ['qr', 'manual'], default: 'qr' },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    label: { type: String, trim: true },
  },
  userAgent: { type: String, trim: true },
  verified: { type: Boolean, default: false },
  verificationResult: { type: String, enum: ['valid', 'invalid', 'not_found'], default: 'not_found' },
  ipAddress: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('ScanLog', scanLogSchema);
