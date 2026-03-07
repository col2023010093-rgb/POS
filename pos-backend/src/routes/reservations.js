const express = require('express');
const router  = express.Router();
const reservationController = require('../controllers/reservationController');

// ── Auth middleware ──────────────────────────────────────────────────────────
// We support two patterns:
//   1. middleware/auth.js exports a single function directly
//   2. middleware/auth.js exports an object with verifyToken / authenticate
const authImport = require('../middleware/auth');
const authRequired = typeof authImport === 'function'
  ? authImport
  : authImport?.verifyToken || authImport?.authenticate || authImport?.default;

/**
 * Optional-auth middleware.
 * Attaches req.user if a valid JWT is present, but does NOT reject
 * the request when there is no token — used on the public POST route
 * so logged-in users still get their reservation linked to their account.
 */
const authOptional = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return next();          // no token → continue as guest

  // Delegate to the real middleware; if it fails just continue as guest
  try {
    authRequired(req, res, (err) => {
      if (err) {
        req.user = null;               // invalid token → treat as guest
      }
      next();
    });
  } catch {
    req.user = null;
    next();
  }
};

// ── Public routes ────────────────────────────────────────────────────────────

/**
 * GET /api/reservations/availability?date=YYYY-MM-DD
 * Returns fully-booked slots for a given date.
 * Must be declared BEFORE /:id to avoid route collision.
 */
router.get('/availability', reservationController.getAvailability);

/**
 * POST /api/reservations
 * Create a new reservation (guest or logged-in user).
 * authOptional links the booking to the user account when a valid JWT is sent.
 */
router.post('/', authOptional, reservationController.createReservation);

// ── Protected routes (require valid JWT) ─────────────────────────────────────

/**
 * GET /api/reservations
 * Admin  → all reservations (paginated, filterable by status/date).
 * Customer → only their own reservations.
 */
router.get('/', authRequired, reservationController.getReservations);

/**
 * GET /api/reservations/:id
 * Single reservation. Admin sees any; customers see only their own.
 */
router.get('/:id', authRequired, reservationController.getReservationById);

/**
 * PATCH /api/reservations/:id
 * General update (admin).  Customers may update non-status fields only.
 */
router.patch('/:id', authRequired, reservationController.updateReservation);

/**
 * PATCH /api/reservations/:id/status
 * Convenience status-only update used by admin dashboard.
 */
router.patch('/:id/status', authRequired, reservationController.updateReservation);

/**
 * DELETE /api/reservations/:id
 * Admin only.
 */
router.delete('/:id', authRequired, reservationController.deleteReservation);

module.exports = router;