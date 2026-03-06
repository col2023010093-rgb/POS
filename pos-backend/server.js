const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./src/config/database');

const app = express();
const server = http.createServer(app);

// ✅ Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Connect Database
connectDB();

// ✅ Socket.io connection handler
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

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/orders', require('./src/routes/orders')); // ✅ Verify this line exists
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/reservations', require('./src/routes/reservations'));
app.use('/api/notifications', require('./src/routes/notifications'));
app.use('/api/payments', require('./src/routes/payments'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: '✅ POS API running' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
});

module.exports = { app, io, server };
