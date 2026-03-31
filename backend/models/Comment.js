const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  content: { type: String, required: true, maxlength: 1000 },
  anonUsername: { type: String, required: true },
  sessionId: { type: String, required: true },
  ipAddress: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
