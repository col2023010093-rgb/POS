const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

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
    sparse: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'customer'],
    default: 'customer'
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// ✅ Hash password before saving (only if modified)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Compare passwords method with logging
userSchema.methods.matchPassword = async function(enteredPassword) {
  console.log('🔍 Comparing passwords:');
  console.log('  Entered:', enteredPassword);
  console.log('  Stored hash:', this.password.substring(0, 20) + '...');
  
  const isMatch = await bcryptjs.compare(enteredPassword, this.password);
  console.log('  Match result:', isMatch);
  
  return isMatch;
};

module.exports = mongoose.model('User', userSchema);