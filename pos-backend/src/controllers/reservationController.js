const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');

// ─── Constants ────────────────────────────────────────────────────────────────
// FIX #1: Guest-based capacity instead of booking count
// 5 bookings × 9 guests = 45 guests could overflow — use total guest cap instead
const MAX_GUESTS_PER_SLOT = 50;
const MAX_DAYS_AHEAD       = 30;

// FIX #4: Simple in-memory rate limiter (per IP, 5 submissions per 15 min)
// If you have express-rate-limit installed, use that as middleware in the router instead
const _rateMap  = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_HITS  = 5;
function isRateLimited(ip) {
  const now  = Date.now();
  const hits = (_rateMap.get(ip) || []).filter(t => now - t < WINDOW_MS);
  hits.push(now);
  _rateMap.set(ip, hits);
  return hits.length > MAX_HITS;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const dateRange = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const start = new Date(y, m - 1, d,  0,  0,  0,   0);
  const end   = new Date(y, m - 1, d, 23, 59, 59, 999);
  return { start, end };
};

// FIX #7: Sanitize string inputs — trim + length cap
const s = (v, max = 100) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

// ─── Public: check availability ───────────────────────────────────────────────
/**
 * GET /api/reservations/availability?date=YYYY-MM-DD
 * Returns { bookedSlots: ['6:00 PM', ...] }
 */
exports.getAvailability = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid or missing date (expected YYYY-MM-DD).' });
    }

    const { start, end } = dateRange(date);

    // FIX #2: Select guests too — slot is full when total GUESTS hit capacity
    const reservations = await Reservation.find({
      date:   { $gte: start, $lte: end },
      status: { $nin: ['cancelled'] },
    }).select('time guests');

    // Sum guests per slot (not booking count)
    const guestTotals = {};
    reservations.forEach(r => {
      guestTotals[r.time] = (guestTotals[r.time] || 0) + (Number(r.guests) || 0);
    });

    const bookedSlots = Object.entries(guestTotals)
      .filter(([, total]) => total >= MAX_GUESTS_PER_SLOT)
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
 */
exports.createReservation = async (req, res) => {
  try {
    // FIX #4: Rate limit check
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({
        message: 'Too many requests. Please wait 15 minutes before trying again.',
      });
    }

    const {
      firstName, lastName, email, phone,
      date, time, guests,
      occasion, seatingPreference, specialRequests,
    } = req.body;

    // ── Validation ────────────────────────────────────────────────────────────
    const errors = {};

    // FIX #7: Sanitize before validating
    const cleanFirst = s(firstName, 50);
    const cleanLast  = s(lastName,  50);
    const cleanEmail = s(email,    100).toLowerCase();
    const cleanPhone = s(phone,     20);
    const cleanDate  = s(date,      10);
    const cleanTime  = s(time,      10);

    if (!cleanFirst || cleanFirst.length < 2) errors.firstName = 'First name must be at least 2 characters.';
    if (!cleanLast  || cleanLast.length  < 2) errors.lastName  = 'Last name must be at least 2 characters.';

    if (!cleanEmail) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = 'Enter a valid email address.';
    }

    // FIX #5: Proper PH phone validation (10–11 digits)
    const digits = cleanPhone.replace(/\D/g, '');
    if (!digits) {
      errors.phone = 'Phone number is required.';
    } else if (digits.length < 10 || digits.length > 11) {
      errors.phone = 'Enter a valid Philippine phone number (10–11 digits).';
    }

    if (!cleanDate) {
      errors.date = 'Date is required.';
    } else {
      // Past date check
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const { start: slotDay } = dateRange(cleanDate);
      if (slotDay < today) errors.date = 'Reservation date cannot be in the past.';

      // FIX #6: Max 30 days ahead
      const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + MAX_DAYS_AHEAD);
      if (slotDay > maxDate) errors.date = `Reservations can only be made up to ${MAX_DAYS_AHEAD} days in advance.`;
    }

    if (!cleanTime) errors.time = 'Time is required.';

    const guestNum = parseInt(guests, 10);
    if (!guests || isNaN(guestNum) || guestNum < 1 || guestNum > 9) {
      errors.guests = 'Guest count must be between 1 and 9.';
    }

    if (Object.keys(errors).length) {
      return res.status(400).json({ message: 'Validation failed.', errors });
    }

    const { start, end } = dateRange(cleanDate);
    const { start: slotDay } = dateRange(cleanDate);

    // ── Duplicate guard ───────────────────────────────────────────────────────
    const duplicate = await Reservation.findOne({
      email:  cleanEmail,
      date:   { $gte: start, $lte: end },
      time:   cleanTime,
      status: { $nin: ['cancelled'] },
    });
    if (duplicate) {
      return res.status(409).json({
        field:   'duplicate',
        message: 'You already have a reservation for this date and time.',
      });
    }

    // ── FIX #1 & #2: Capacity check by total guests, not booking count ────────
    const slotBookings = await Reservation.find({
      date:   { $gte: start, $lte: end },
      time:   cleanTime,
      status: { $nin: ['cancelled'] },
    }).select('guests');

    const totalGuestsBooked = slotBookings.reduce(
      (sum, r) => sum + (Number(r.guests) || 0), 0
    );
    if (totalGuestsBooked + guestNum > MAX_GUESTS_PER_SLOT) {
      return res.status(409).json({
        field:   'time',
        message: 'That time slot is fully booked. Please choose another.',
      });
    }

    // ── Build document ────────────────────────────────────────────────────────
    const reservationData = {
      firstName: cleanFirst,
      lastName:  cleanLast,
      email:     cleanEmail,
      phone:     digits,              // store digits only
      date:      slotDay,             // normalised midnight local
      time:      cleanTime,
      guests:    guestNum,
      status:    'pending',
    };

    if (occasion && occasion !== 'none') reservationData.occasion         = s(occasion, 20);
    if (seatingPreference)               reservationData.seatingPreference = s(seatingPreference, 20);
    if (specialRequests?.trim())         reservationData.specialRequests   = s(specialRequests, 500);
    if (req.user?._id)                   reservationData.userId            = req.user._id;

    const reservation = await Reservation.create(reservationData);

    // ── Notify logged-in user ─────────────────────────────────────────────────
    if (reservationData.userId) {
      try {
        const notif = await Notification.create({
          userId:  reservationData.userId,
          title:   'Reservation Received',
          message: `Your table for ${guestNum} on ${cleanDate} at ${cleanTime} is pending confirmation.`,
          type:    'reservation',
        });
        req.app.get('io')?.to(String(reservationData.userId)).emit('notification', notif);
      } catch (notifErr) {
        console.warn('⚠️ Notification creation failed:', notifErr.message);
      }
    }

    console.log('✅ Reservation created:', reservation._id);

    // FIX #8: Return reservationId + reference so the success screen can show them
    return res.status(201).json({
      ...reservation.toObject(),
      reservationId: reservation._id,
      reference:     String(reservation._id).slice(-8).toUpperCase(),
    });

  } catch (error) {
    console.error('❌ Error creating reservation:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ─── Protected: get reservations ─────────────────────────────────────────────
/**
 * GET /api/reservations
 * Admin → all (filterable). Customer → own only.
 */
exports.getReservations = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const { status, date, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (!isAdmin) {
      filter.userId = req.user._id;
    } else {
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
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

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
exports.updateReservation = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';

    const existing = await Reservation.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    if (!isAdmin && String(existing.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // FIX #9: Whitelist updatable fields — no mass assignment
    const ADMIN_FIELDS    = ['status', 'date', 'time', 'guests', 'seatingPreference', 'occasion', 'specialRequests'];
    const CUSTOMER_FIELDS = ['seatingPreference', 'occasion', 'specialRequests'];
    const allowed         = isAdmin ? ADMIN_FIELDS : CUSTOMER_FIELDS;

    const update = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    }

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
        req.app.get('io')?.to(String(reservation.userId)).emit('notification', notif);
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