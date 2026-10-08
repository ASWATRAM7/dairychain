const mongoose = require('mongoose');

const accessRequestSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  password: { type: String, required: false, minlength: 6 },
  requestedRole: { type: String, enum: ['transport', 'inspector'], required: true },
  reason: { type: String, trim: true, maxlength: 500 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AccessRequest', accessRequestSchema);
