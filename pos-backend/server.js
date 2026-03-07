const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS setup for frontend
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

// Serve static files for product images
app.use('/images', express.static(path.join(__dirname, 'public/images'), {
  setHeaders: (res) => {
    res.set('Cache-Control', 'public, max-age=3600');
  }
}));

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || true,
    credentials: true
  },
  path: '/socket.io'
});

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Join user room for notifications
  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`✅ User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

app.set('io', io);

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI not configured in .env');
} else {
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));
}

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/reservations', require('./src/routes/reservations'));
app.use('/api/notifications', require('./src/routes/notifications'));
app.use('/api/payments', require('./src/routes/payments'));
app.use('/api/profile', require('./src/routes/profile'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? '✅ connected' : '❌ disconnected';
  res.json({
    status: '✅ Server is running',
    mongodb: mongoStatus,
    time: new Date().toISOString()
  });
});

// ✅ Backend test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: '✅ Backend is reachable from frontend!',
    time: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'POS Backend API', version: '1.0.0' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start HTTP server
const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API + Socket running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
});

module.exports = { app, io, server };
