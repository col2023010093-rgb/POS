const express = require('express');
const router = express.Router();

// ✅ Body parser
router.use(express.json({ limit: '50mb', parameterLimit: 50000 }));
router.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

console.log('✅ Routes: Body parser configured with 50mb limit');

const auth = require('../middleware/auth');

// ❌ REMOVE these duplicates:
// const authController = require('../controllers/authController');
// router.post('/auth/register', authController.register);
// router.post('/auth/login', authController.login);
// router.get('/auth/me', auth, authController.getMe);

// ✅ Use one auth router only:
router.use('/auth', require('./auth'));

// Product routes
const productRoutes = require('./products');
router.use('/products', productRoutes);

// Admin routes
try {
  const adminRoutes = require('./admin');
  router.use('/admin', adminRoutes);
  console.log('✅ Admin routes loaded');
} catch (err) {
  console.log('⚠️ Admin routes error:', err.message);
}

// Reservation routes
try {
  const reservationRoutes = require('./reservations');
  router.use('/reservations', reservationRoutes);
  console.log('✅ Reservation routes loaded');
} catch (err) {
  console.log('⚠️ Reservation routes error:', err.message);
}

// Notification routes
try {
  const notificationRoutes = require('./notifications');
  router.use('/notifications', notificationRoutes);
  console.log('✅ Notification routes loaded');
} catch (err) {
  console.log('⚠️ Notification routes error:', err.message);
}

// Order routes
try {
  const orderController = require('../controllers/orderController');
  router.get('/orders', auth, orderController.getOrders);
  router.post('/orders', auth, orderController.createOrder);
  router.get('/orders/:id', auth, orderController.getOrderById);
  console.log('✅ Order routes loaded');
} catch (err) {
  console.log('⚠️ Order controller error:', err.message);
}

// Payment routes
try {
  const paymentController = require('../controllers/paymentController');
  router.post('/payments/intent', auth, paymentController.createPaymentIntent);
  router.post('/payments/confirm', auth, paymentController.confirmPayment);
  console.log('✅ Payment routes loaded');
} catch (err) {
  console.log('⚠️ Payment controller error:', err.message);
}

const paymentRoutes = require('./payments');
router.use('/api/payments', paymentRoutes);

module.exports = router;