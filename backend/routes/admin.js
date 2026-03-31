const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const BlockedIP = require('../models/BlockedIP');

// GET /api/admin/ip-list - list all IPs with activity
router.get('/ip-list', async (req, res) => {
  try {
    const [postIPs, commentIPs, blockedIPs] = await Promise.all([
      Post.aggregate([
        { $group: { _id: '$ipAddress', postCount: { $sum: 1 }, lastSeen: { $max: '$createdAt' }, usernames: { $addToSet: '$anonUsername' } } },
        { $sort: { lastSeen: -1 } },
      ]),
      Comment.aggregate([
        { $group: { _id: '$ipAddress', commentCount: { $sum: 1 }, lastSeen: { $max: '$createdAt' } } },
      ]),
      BlockedIP.find().lean(),
    ]);

    const blockedSet = new Set(blockedIPs.map(b => b.ipAddress));
    const commentMap = {};
    commentIPs.forEach(c => { commentMap[c._id] = c.commentCount; });

    const ipList = postIPs.map(ip => ({
      ipAddress: ip._id,
      postCount: ip.postCount,
      commentCount: commentMap[ip._id] || 0,
      lastSeen: ip.lastSeen,
      usernames: ip.usernames,
      isBlocked: blockedSet.has(ip._id),
    }));

    res.json({ ipList, blockedIPs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/posts - all posts for moderation
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
      Post.countDocuments(),
    ]);

    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/block-ip
router.post('/block-ip', async (req, res) => {
  try {
    const { ipAddress, reason } = req.body;
    if (!ipAddress) return res.status(400).json({ error: 'IP address required' });

    const blocked = await BlockedIP.findOneAndUpdate(
      { ipAddress },
      { ipAddress, reason: reason || 'Blocked by admin', blockedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ message: 'IP blocked', blocked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/unblock-ip
router.delete('/unblock-ip', async (req, res) => {
  try {
    const { ipAddress } = req.body;
    await BlockedIP.deleteOne({ ipAddress });
    res.json({ message: 'IP unblocked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/remove-user-content
router.delete('/remove-user-content', async (req, res) => {
  try {
    const { ipAddress } = req.body;
    if (!ipAddress) return res.status(400).json({ error: 'IP address required' });

    const [postsResult, commentsResult] = await Promise.all([
      Post.deleteMany({ ipAddress }),
      Comment.deleteMany({ ipAddress }),
    ]);

    res.json({
      message: 'All content removed for IP',
      postsRemoved: postsResult.deletedCount,
      commentsRemoved: commentsResult.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/posts/:id
router.delete('/posts/:id', async (req, res) => {
  try {
    await Promise.all([
      Post.findByIdAndDelete(req.params.id),
      Comment.deleteMany({ postId: req.params.id }),
    ]);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/posts/:id/hide
router.patch('/posts/:id/hide', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { isHidden: true }, { new: true });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
