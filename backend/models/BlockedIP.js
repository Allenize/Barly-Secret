const mongoose = require('mongoose');

const blockedIPSchema = new mongoose.Schema({
  ipAddress: { type: String, required: true, unique: true },
  reason: { type: String, default: 'Blocked by admin' },
  blockedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BlockedIP', blockedIPSchema);
