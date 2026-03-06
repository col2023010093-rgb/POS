const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ✅ CORS: allow any origin for deployment (or set your frontend URL)
app.use(cors({
  origin: true,
  credentials: true
}));

// ✅ mount socket.io on same HTTP server
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true
  },
  path: '/socket.io'
});

io.on('connection', (socket) => {
  console.log('socket connected:', socket.id);
});

app.set('io', io);

// ✅ MongoDB Connection (Using MONGODB_URI)
const mongoUri = process.env.MONGODB_URI;

if (mongoUri) {
  console.log('🔗 Connecting to MongoDB...');
  console.log('📍 URI:', mongoUri);
  
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => {
      console.log('✅ MongoDB connected successfully');
    })
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
    });
} else {
  console.error('❌ MONGODB_URI not configured in .env');
}

// ✅ Serve static files for product images
app.use('/images', express.static('public/images', { 
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'public, max-age=3600');
  }
}));

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders')); // ✅ Change from 'index' to 'orders'
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/profile', require('./routes/profile')); // <-- ADD THIS LINE

// ✅ Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? '✅ connected' : '❌ disconnected';
  res.json({ 
    status: '✅ Server is running',
    mongodb: mongoStatus,
    time: new Date().toISOString()
  });
});

// ✅ Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'POS Backend API', version: '1.0.0' });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ✅ Start HTTP server (Render needs "0.0.0.0")
const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`API+Socket running on ${PORT}`);
});