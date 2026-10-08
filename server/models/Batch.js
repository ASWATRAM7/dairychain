const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  origin: { type: String, trim: true },
  collectionCenter: { type: String, trim: true },
  volume: { type: String, trim: true },
  route: { type: String, trim: true },
  safeTempMin: { type: Number, default: 2 },
  safeTempMax: { type: Number, default: 6 },
  currentTemperature: { type: Number },
  currentHumidity: { type: Number },
  currentStage: { type: String, default: 'Collection Center' },
  status: { type: String, enum: ['safe', 'warning', 'critical'], default: 'safe' },
  blockchainHash: { type: String, trim: true },
  blockNumber: { type: Number },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Batch', batchSchema);
