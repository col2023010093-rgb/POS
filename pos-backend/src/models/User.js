const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    match: [/^[0-9\-\+\(\)\s]+$/, 'Please provide a valid phone number']
  },
  address: String,
  role: {
    type: String,
    enum: ['user', 'admin', 'customer'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Add comparePassword method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

// ❌ DELETE EVERYTHING BELOW:
// ✅ Correct import (everywhere)
// const User = require('../models/User');
// const Verification = require('../models/Verification');
// 
// ❌ Wrong (delete these)
// const User = require('../../models/User');