const mongoose = require('mongoose');

// ─── PasswordReset model ──────────────────────────────────────────────────────
// Stores hashed reset codes with TTL-based expiry.
// One document per reset request — old codes are deleted on new request.

const passwordResetSchema = new mongoose.Schema({
  email: {
    type     : String,
    required : true,
    lowercase: true,
    trim     : true,
    index    : true,
  },
  code: {
    type    : String,   // SHA-256 hash of the 6-digit code — never stored plain
    required: true,
  },
  expiresAt: {
    type    : Date,
    required: true,
    // TTL index: MongoDB auto-deletes expired documents
    index   : { expireAfterSeconds: 0 },
  },
  used: {
    type   : Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// ✅ Compound index for fast lookup by email + code
passwordResetSchema.index({ email: 1, code: 1 });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);