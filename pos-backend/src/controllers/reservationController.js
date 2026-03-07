const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');

const MAX_PER_SLOT = 5; // Max bookings per time slot

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise a YYYY-MM-DD string into a [start, end) Date range
 * so MongoDB $gte / $lt comparisons work correctly regardless of timezone.
 */
const dateRange = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end   = new Date(y, m - 1, d, 23, 59, 59, 999);
  return { start, end };
};

// ─── Public: check availability ───────────────────────────────────────────────
/**
 * GET /api/reservations/availability?date=YYYY-MM-DD
 * Returns { bookedSlots: ['6:00 PM', ...] } — slots that have reached MAX_PER_SLOT.
 * No auth required (called before the user submits the form).
 */
exports.getAvailability = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid or missing date (expected YYYY-MM-DD).' });
    }

    const { start, end } = dateRange(date);

    const reservations = await Reservation.find({
      date:   { $gte: start, $lte: end },
      status: { $nin: ['cancelled'] },
    }).select('time');

    // Count bookings per slot
    const counts = {};
    reservations.forEach(r => {
      counts[r.time] = (counts[r.time] || 0) + 1;
    });

    // Return only the fully-booked ones
    const bookedSlots = Object.entries(counts)
      .filter(([, count]) => count >= MAX_PER_SLOT)
      .map(([time]) => time);

    return res.json({ bookedSlots });
  } catch (error) {
    console.error('❌ Error fetching availability:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ─── Public: create reservation ───────────────────────────────────────────────
/**
 * POST /api/reservations
 * Body: { firstName, lastName, email, phone, date, time, guests,
 *         occasion?, seatingPreference?, specialRequests? }
 * Optional auth: if a logged-in user sends their JWT the reservation is linked
 * to their account via `userId`.
 */
exports.createReservation = async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone,
      date, time, guests,
      occasion, seatingPreference, specialRequests,
    } = req.body;

    // ── Server-side validation ────────────────────────────────────────────────
    const errors = {};

    if (!firstName?.trim()) errors.firstName = 'First name is required.';
    if (!lastName?.trim())  errors.lastName  = 'Last name is required.';
    if (!email?.trim())     errors.email     = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email address.';
    if (!phone?.trim())     errors.phone     = 'Phone number is required.';
    if (!date)              errors.date      = 'Date is required.';
    if (!time)              errors.time      = 'Time is required.';
    if (!guests)            errors.guests    = 'Number of guests is required.';

    if (Object.keys(errors).length) {
      return res.status(400).json({ message: 'Validation failed.', errors });
    }

    // ── Date: must not be in the past ─────────────────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { start: slotDay } = dateRange(date);
    if (slotDay < today) {
      return res.status(400).json({ message: 'Reservation date cannot be in the past.' });
    }

    // ── Slot capacity check ───────────────────────────────────────────────────
    const { start, end } = dateRange(date);
    const slotCount = await Reservation.countDocuments({
      date:   { $gte: start, $lte: end },
      time,
      status: { $nin: ['cancelled'] },
    });

    if (slotCount >= MAX_PER_SLOT) {
      return res.status(409).json({
        message: 'That time slot is fully booked. Please choose another.',
        field: 'time',
      });
    }

    // ── Duplicate guard: same email + date + time ─────────────────────────────
    const duplicate = await Reservation.findOne({
      email: email.toLowerCase().trim(),
      date:  { $gte: start, $lte: end },
      time,
      status: { $nin: ['cancelled'] },
    });

    if (duplicate) {
      return res.status(409).json({
        message: 'A reservation for this email at that date and time already exists.',
      });
    }

    // ── Build document ────────────────────────────────────────────────────────
    const reservationData = {
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      email:     email.toLowerCase().trim(),
      phone:     phone.trim(),
      date:      slotDay,     // normalised midnight local time
      time,
      guests:    Number(guests),
      status:    'pending',
    };

    if (occasion && occasion !== 'none')  reservationData.occasion          = occasion;
    if (seatingPreference)                reservationData.seatingPreference  = seatingPreference;
    if (specialRequests?.trim())          reservationData.specialRequests    = specialRequests.trim();

    // Link to user account if the request is authenticated (optional JWT)
    if (req.user?._id) reservationData.userId = req.user._id;

    const reservation = await Reservation.create(reservationData);

    // ── Notify user if logged in ──────────────────────────────────────────────
    if (reservationData.userId) {
      try {
        const notif = await Notification.create({
          userId:  reservationData.userId,
          title:   'Reservation Received',
          message: `Your table for ${reservation.guests} on ${date} at ${time} is pending confirmation.`,
          type:    'reservation',
        });

        const io = req.app.get('io');
        io?.to(String(reservationData.userId)).emit('notification', notif);
      } catch (notifErr) {
        // Non-fatal — log but don't fail the request
        console.warn('⚠️ Notification creation failed:', notifErr.message);
      }
    }

    console.log('✅ Reservation created:', reservation._id);
    return res.status(201).json(reservation);

  } catch (error) {
    console.error('❌ Error creating reservation:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ─── Protected: get reservations ─────────────────────────────────────────────
/**
 * GET /api/reservations
 * Admin → all reservations (sorted newest-first, with optional filters).
 * Customer → only their own reservations.
 *
 * Query params (admin only):
 *   status   = pending | confirmed | cancelled | completed
 *   date     = YYYY-MM-DD
 *   page     = 1  (default)
 *   limit    = 20 (default)
 */
exports.getReservations = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const { status, date, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (!isAdmin) {
      // Customers only see their own reservations
      filter.userId = req.user._id;
    } else {
      // Admin can filter by status and/or date
      if (status) filter.status = status;
      if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const { start, end } = dateRange(date);
        filter.date = { $gte: start, $lte: end };
      }
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Reservation.countDocuments(filter);

    const reservations = await Reservation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'firstName lastName email phone');

    return res.json({
      reservations,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching reservations:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ─── Protected: get single reservation ───────────────────────────────────────
/**
 * GET /api/reservations/:id
 */
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    // Non-admin users can only view their own reservation
    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && String(reservation.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    return res.json(reservation);
  } catch (error) {
    console.error('❌ Error fetching reservation:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ─── Protected: update reservation ───────────────────────────────────────────
/**
 * PATCH /api/reservations/:id
 * Body may include any updatable fields.
 */
exports.updateReservation = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';

    // Find first so we can authorise
    const existing = await Reservation.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    if (!isAdmin && String(existing.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Non-admin users may NOT change status directly
    const update = { ...req.body };
    if (!isAdmin) delete update.status;

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    // Notify user on status change
    if (req.body.status && reservation.userId) {
      try {
        const notif = await Notification.create({
          userId:  reservation.userId,
          title:   'Reservation Updated',
          message: `Your reservation on ${reservation.date.toDateString()} at ${reservation.time} is now ${reservation.status}.`,
          type:    'reservation',
        });

        const io = req.app.get('io');
        io?.to(String(reservation.userId)).emit('notification', notif);
      } catch (notifErr) {
        console.warn('⚠️ Notification creation failed:', notifErr.message);
      }
    }

    console.log('✅ Reservation updated:', reservation._id);
    return res.json(reservation);
  } catch (error) {
    console.error('❌ Error updating reservation:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ─── Protected: delete reservation ───────────────────────────────────────────
/**
 * DELETE /api/reservations/:id
 * Admin only.
 */
exports.deleteReservation = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    console.log('✅ Reservation deleted:', reservation._id);
    return res.json({ message: 'Reservation deleted successfully.' });
  } catch (error) {
    console.error('❌ Error deleting reservation:', error);
    return res.status(500).json({ message: error.message });
  }
};