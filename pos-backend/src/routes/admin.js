const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// ✅ Stats
router.get('/stats', authMiddleware, adminController.getStats);

// ✅ Orders
router.get('/orders', authMiddleware, adminController.getAllOrders);
router.patch('/orders/:id/status', authMiddleware, adminController.updateOrderStatus);

// ✅ Products
router.get('/products', authMiddleware, adminController.getAllProducts);

// ✅ Users
router.get('/users', authMiddleware, adminController.getAllUsers);
router.delete('/users/:id', authMiddleware, adminController.deleteUser);

// ✅ Reservations
router.get('/reservations', authMiddleware, async (req, res) => {
  try {
    const Reservation = require('../models/Reservation');
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.patch('/reservations/:id/status', authMiddleware, adminController.updateReservationStatus);

module.exports = router;