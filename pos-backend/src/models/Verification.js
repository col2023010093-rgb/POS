const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  code: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  password: String,
  phone: String,
  expires: {
    type: Date,
    required: true
  },
  lastCodeSentAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Auto-delete after 10 minutes
  }
});

module.exports = mongoose.model('Verification', verificationSchema);
