const mongoose = require('mongoose');

const journeyEventSchema = new mongoose.Schema({
  batchId: { type: String, required: true, uppercase: true, trim: true, index: true },
  stage: {
    type: String,
    enum: [
      'farm_collection',
      'chilling_center',
      'transport',
      'processing_plant',
      'cold_storage',
      'retail_delivery',
      'consumer',
    ],
    required: true,
  },
  stageLabel: { type: String, trim: true },   // Human-readable, e.g., "Farm Collection"
  location: { type: String, trim: true },     // e.g., "Erode Dairy Cluster"
  handler: { type: String, trim: true },      // e.g., "Karthik M (Driver)"
  handlerRole: { type: String, trim: true },
  temperature: { type: Number },              // °C at this stage
  humidity: { type: Number },                 // % at this stage
  safeTempMin: { type: Number, default: 2 },
  safeTempMax: { type: Number, default: 6 },
  status: { type: String, enum: ['safe', 'warning', 'critical'], default: 'safe' },
  notes: { type: String, trim: true },
  dataHash: { type: String, trim: true },
  txHash: { type: String, trim: true },
  blockNumber: { type: Number },
  onChain: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: true },
});

journeyEventSchema.index({ batchId: 1, createdAt: 1 });

module.exports = mongoose.model('JourneyEvent', journeyEventSchema);
