const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const upload = require('../middleware/upload');
const filterContent = require('../middleware/filter');
const { checkBlocked } = require('../middleware/ipBlock');

const REACTION_TYPES = ['crazy', 'cop', 'hot', 'scared', 'suggestive'];

const adjectives = ['Silent', 'Phantom', 'Ghost', 'Shadow', 'Misty', 'Neon', 'Cosmic', 'Void', 'Cyber', 'Echo', 'Rogue', 'Crypt', 'Drift', 'Flux', 'Omen'];
const generateAnonUsername = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `User_${num}`;
};

// GET /api/posts
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sessionId = req.headers['x-session-id'];

    const [posts, total] = await Promise.all([
      Post.find({ isHidden: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      Post.countDocuments({ isHidden: false }),
    ]);

    const enriched = posts.map(post => ({
      ...post,
      userReaction: post.reactions?.find(r => r.sessionId === sessionId)?.type || null,
    }));

    res.json({ posts: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts
router.post('/', checkBlocked, upload.single('media'), filterContent, async (req, res) => {
  try {
    const { content, sessionId } = req.body;
    if (!content || !sessionId) return res.status(400).json({ error: 'Content and sessionId required' });

    let imageUrl = null;
    let videoUrl = null;

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');

      if (isVideo) {
        // Store video as base64 data URI
        videoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      } else {
        // Upload image to ImgBB
        const base64 = req.file.buffer.toString('base64');
        const formData = new URLSearchParams();
        formData.append('image', base64);
        formData.append('key', process.env.IMGBB_API_KEY);

        const imgRes = await fetch(`https://api.imgbb.com/1/upload`, {
          method: 'POST',
          body: formData,
        });
        const imgData = await imgRes.json();
        if (imgData.success) {
          imageUrl = imgData.data.url;
        } else {
          return res.status(500).json({ error: 'Image upload failed' });
        }
      }
    }

    const post = new Post({
      content,
      sessionId,
      anonUsername: generateAnonUsername(),
      ipAddress: req.clientIP || '0.0.0.0',
      imageUrl,
      videoUrl,
    });

    await post.save();

    if (req.app.get('io')) req.app.get('io').emit('post:new', post.toJSON());

    res.status(201).json(post.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean({ virtuals: true });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.sessionId !== sessionId) return res.status(403).json({ error: 'Not authorized' });

    await Promise.all([
      Post.findByIdAndDelete(req.params.id),
      Comment.deleteMany({ postId: req.params.id }),
    ]);

    if (req.app.get('io')) req.app.get('io').emit('post:deleted', { postId: req.params.id });

    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts/:id/react
router.post('/:id/react', checkBlocked, async (req, res) => {
  try {
    const { type, sessionId } = req.body;
    if (!REACTION_TYPES.includes(type)) return res.status(400).json({ error: 'Invalid reaction type' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const existingIndex = post.reactions.findIndex(r => r.sessionId === sessionId);
    if (existingIndex !== -1) {
      if (post.reactions[existingIndex].type === type) {
        post.reactions.splice(existingIndex, 1);
      } else {
        post.reactions[existingIndex].type = type;
      }
    } else {
      post.reactions.push({ type, sessionId });
    }

    await post.save();

    const updatedPost = await Post.findById(req.params.id).lean({ virtuals: true });
    if (req.app.get('io')) {
      req.app.get('io').emit('post:reaction', { postId: post._id, reactionCounts: updatedPost.reactionCounts });
    }

    res.json({
      reactionCounts: updatedPost.reactionCounts,
      userReaction: post.reactions.find(r => r.sessionId === sessionId)?.type || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts/:postId/comments
router.get('/:postId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId, isHidden: false })
      .sort({ createdAt: -1 })
      .lean();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts/:postId/comments
router.post('/:postId/comments', checkBlocked, filterContent, async (req, res) => {
  try {
    const { content, sessionId } = req.body;
    if (!content || !sessionId) return res.status(400).json({ error: 'Content and sessionId required' });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = new Comment({
      postId: req.params.postId,
      content,
      sessionId,
      anonUsername: `User_${Math.floor(1000 + Math.random() * 9000)}`,
      ipAddress: req.clientIP || '0.0.0.0',
    });

    await comment.save();
    await Post.findByIdAndUpdate(req.params.postId, { $inc: { commentCount: 1 } });

    if (req.app.get('io')) {
      req.app.get('io').emit('comment:new', { postId: req.params.postId, comment: comment.toJSON() });
    }

    res.status(201).json(comment.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;