const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,  // ✅ One verification per email
    lowercase: true,
    trim: true
  },
  code: {
    type: String,
    required: true
  },
  lastCodeSentAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600  // ✅ Auto-delete after 10 minutes (TTL index)
  }
});

module.exports = mongoose.model('Verification', verificationSchema);
