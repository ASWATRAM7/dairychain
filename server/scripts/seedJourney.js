const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Batch = require('../models/Batch');
const JourneyEvent = require('../models/JourneyEvent');
const crypto = require('crypto');

const BATCH_ID = 'MILK001';

const sampleEvents = [
  {
    stage: 'farm_collection',
    stageLabel: 'Farm Collection',
    location: 'Erode Dairy Cluster',
    handler: 'S. Karthik',
    handlerRole: 'Farmer',
    temperature: 4.0,
    humidity: 68,
    notes: 'Morning milking batch collected',
  },
  {
    stage: 'chilling_center',
    stageLabel: 'Chilling Center',
    location: 'Bhavani BMC',
    handler: 'R. Murugan',
    handlerRole: 'Collection Center Manager',
    temperature: 3.8,
    humidity: 66,
    notes: 'Bulk milk cooler temperature verified',
  },
  {
    stage: 'transport',
    stageLabel: 'Transport',
    location: 'TN-38/2802 → Salem',
    handler: 'Karthik M',
    handlerRole: 'Driver',
    temperature: 4.2,
    humidity: 65,
    notes: 'Insulated tanker en route',
  },
  {
    stage: 'processing_plant',
    stageLabel: 'Processing Plant',
    location: 'Salem Central Dairy',
    handler: 'P. Anitha',
    handlerRole: 'Plant Manager',
    temperature: 3.5,
    humidity: 64,
    notes: 'Pasteurization cycle completed',
  },
  {
    stage: 'cold_storage',
    stageLabel: 'Cold Storage',
    location: 'Salem Central Dairy — Bay 4',
    handler: 'V. Suresh',
    handlerRole: 'Cold Storage Operator',
    temperature: 3.9,
    humidity: 65,
    notes: 'Stored in chilled room',
  },
  {
    stage: 'retail_delivery',
    stageLabel: 'Retail Delivery',
    location: 'Chennai Hub',
    handler: 'M. Ravi',
    handlerRole: 'Delivery Agent',
    temperature: 4.1,
    humidity: 66,
    notes: 'Delivered to retail cold hub',
  },
];

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Clear existing
    await Batch.deleteOne({ batchId: BATCH_ID });
    await JourneyEvent.deleteMany({ batchId: BATCH_ID });
    console.log('🧹 Cleared existing MILK001 data');

    // Create batch
    const batch = new Batch({
      batchId: BATCH_ID,
      origin: 'Erode Dairy Cooperative',
      collectionCenter: 'Bhavani BMC',
      volume: '12,350 L',
      route: 'Erode → Salem → Chennai',
      currentStage: 'Retail Delivery',
      currentTemperature: 4.1,
      status: 'safe',
    });
    await batch.save();

    // Create events with staggered timestamps (1 hour apart)
    let offset = sampleEvents.length * 60 * 60 * 1000;
    for (const ev of sampleEvents) {
      const createdAt = new Date(Date.now() - offset);
      const canonical = JSON.stringify({
        batchId: BATCH_ID,
        stage: ev.stage,
        temperature: ev.temperature,
        humidity: ev.humidity,
        timestamp: createdAt.toISOString(),
      });
      const dataHash = '0x' + crypto.createHash('sha256').update(canonical).digest('hex');

      const journeyEvent = new JourneyEvent({
        batchId: BATCH_ID,
        ...ev,
        dataHash,
        createdAt,
      });
      await journeyEvent.save();
      offset -= 60 * 60 * 1000;
    }

    console.log(`✅ Seeded ${sampleEvents.length} journey events for ${BATCH_ID}`);
    console.log('🎉 Done. Test: GET /api/journey/MILK001');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

main();
