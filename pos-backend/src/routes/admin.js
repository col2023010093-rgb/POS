const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');

// ✅ Update order status
router.patch('/orders/:id/status', auth, adminController.updateOrderStatus);

// ✅ Update reservation status
router.patch('/reservations/:id/status', auth, adminController.updateReservationStatus);

// ✅ Admin dashboard stats
router.get('/stats', adminController.getStats);

// ✅ Admin orders management
router.get('/orders', adminController.getAllOrders);

// ✅ Admin users management
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);

// ✅ Admin products management
router.get('/products', adminController.getAllProducts);

module.exports = router;