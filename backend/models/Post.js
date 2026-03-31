const mongoose = require('mongoose');

const REACTION_TYPES = ['crazy', 'cop', 'hot', 'scared', 'suggestive'];

const reactionSchema = new mongoose.Schema({
  type: { type: String, enum: REACTION_TYPES, required: true },
  sessionId: { type: String, required: true },
}, { _id: false });

const postSchema = new mongoose.Schema({
  content: { type: String, required: true, maxlength: 5000 },
  anonUsername: { type: String, required: true },
  sessionId: { type: String, required: true },
  ipAddress: { type: String, required: true },
  imageUrl: { type: String, default: null }, // base64 data URI
  imageType: { type: String, default: null },
  reactions: [reactionSchema],
  commentCount: { type: Number, default: 0 },
  isHidden: { type: Boolean, default: false },
}, { timestamps: true });

postSchema.virtual('reactionCounts').get(function () {
  const counts = {};
  REACTION_TYPES.forEach(t => { counts[t] = 0; });
  this.reactions.forEach(r => { if (counts[r.type] !== undefined) counts[r.type]++; });
  return counts;
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);
module.exports.REACTION_TYPES = REACTION_TYPES;