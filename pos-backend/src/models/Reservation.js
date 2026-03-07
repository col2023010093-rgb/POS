const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    // ── Guest info ──────────────────────────────────────────────────────────
    firstName: {
      type: String,
      required: [true, 'First name is required.'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Invalid email address.'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required.'],
      trim: true,
    },

    // ── Linked account (optional — set when user is logged in) ──────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ── Booking details ─────────────────────────────────────────────────────
    date: {
      type: Date,
      required: [true, 'Date is required.'],
    },
    time: {
      type: String,
      required: [true, 'Time is required.'],
      // Matches labels like "10:30 AM", "9:30 PM"
      match: [/^\d{1,2}:\d{2} (AM|PM)$/, 'Invalid time format.'],
    },
    guests: {
      type: Number,
      required: [true, 'Number of guests is required.'],
      min: [1, 'At least 1 guest is required.'],
      max: [9, 'Maximum 9 guests per online reservation. Please call for larger parties.'],
    },

    // ── Preferences (optional) ──────────────────────────────────────────────
    occasion: {
      type: String,
      enum: ['none', 'birthday', 'anniversary', 'business', 'celebration', 'date', ''],
      default: '',
    },
    seatingPreference: {
      type: String,
      enum: ['indoor', 'patio', 'bar', 'private', ''],
      default: '',
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [500, 'Special requests cannot exceed 500 characters.'],
    },

    // ── Status ──────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'cancelled', 'completed'],
        message: 'Invalid status value.',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
// Fast availability queries  (date + time + status)
reservationSchema.index({ date: 1, time: 1, status: 1 });

// Fast user-facing "my reservations" queries
reservationSchema.index({ userId: 1, createdAt: -1 });

// Duplicate-booking guard
reservationSchema.index({ email: 1, date: 1, time: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);