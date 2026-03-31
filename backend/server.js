require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const postRoutes = require('./routes/posts');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Socket.IO
const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST', 'DELETE', 'PATCH'] },
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Middleware
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { error: 'Too many requests. Please slow down.' },
});
app.use('/api/', limiter);

// Routes
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date(), app: 'Barly Secret' }));

// MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Barly Secret backend running on http://localhost:${PORT}`));
