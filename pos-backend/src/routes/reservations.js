const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

// ✅ Import auth middleware
const authImport = require('../middleware/auth');
const auth = typeof authImport === 'function'
  ? authImport
  : authImport?.verifyToken || authImport?.authenticate || authImport?.default;

// ✅ Public route - create reservation (no auth needed)
router.post('/', reservationController.createReservation);

// ✅ Protected routes - require authentication
router.get('/', auth, reservationController.getReservations);
router.get('/:id', auth, reservationController.getReservationById || reservationController.getReservations);
router.patch('/:id', auth, reservationController.updateReservation);
router.patch('/:id/status', auth, reservationController.updateReservation);
router.delete('/:id', auth, reservationController.deleteReservation);

module.exports = router;