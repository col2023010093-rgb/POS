const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Verification = require('../models/Verification');
const { sendVerificationEmail } = require('../services/emailService');

// ✅ LOGIN ROUTE (FIXED)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', email);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if verified
    if (!user.verified) {
      console.log('❌ User not verified:', email);
      return res.status(403).json({ 
        error: 'Please verify your email before logging in.',
        code: 'EMAIL_NOT_VERIFIED',
        needsVerification: true,
        email: email
      });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful:', email);

    res.json({
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ✅ CHECK EMAIL AVAILABILITY
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const emailLower = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLower });

    if (user) {
      return res.json({ 
        available: false,
        verified: user.verified,
        message: user.verified 
          ? '⚠️ Email is already registered and verified' 
          : '⚠️ Email is registered but not verified'
      });
    }

    return res.json({ 
      available: true,
      message: '✅ Email is available'
    });

  } catch (err) {
    console.error('❌ Check email error:', err);
    return res.status(500).json({ error: 'Failed to check email availability.' });
  }
});

// ✅ REGISTER ROUTE (WITHOUT TRANSACTIONS)
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // ✅ Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All required fields must be provided.' });
    }

    const emailLower = email.toLowerCase().trim();

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email: emailLower });

    if (existingUser) {
      if (existingUser.verified) {
        return res.status(400).json({
          error: 'This email is already registered and verified. Please login.',
          code: 'EMAIL_VERIFIED_EXISTS'
        });
      } else {
        // ✅ Delete unverified user + verification (no transaction)
        console.log(`🗑️ Deleting unverified account for ${emailLower}`);
        await User.deleteOne({ email: emailLower, verified: false });
        await Verification.deleteOne({ email: emailLower });
      }
    }

    // ✅ Create new user (NO MANUAL HASHING - let pre-save handle it)
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: emailLower,
      password: password,  // ✅ Plain password - pre-save hook will hash it
      phone: phone?.trim() || '',
      role: 'customer',
      verified: false
    });

    // ✅ Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Create verification record
    await Verification.create({
      email: emailLower,
      code: code,
      lastCodeSentAt: new Date()
    });

    console.log('✅ Registration successful for:', emailLower);
    console.log('📧 Verification code:', code);

    // ✅ Send verification email (outside transaction)
    try {
      await sendVerificationEmail(emailLower, code);
    } catch (emailError) {
      console.error('⚠️ Email failed but registration successful:', emailError.message);
      // Don't fail registration if email fails
    }

    return res.status(201).json({
      message: 'Registration successful. Check your email for verification code.',
      email: emailLower
      // code: code  // ← Remove in production
    });

  } catch (err) {
    console.error('❌ Registration error:', {
      message: err.message,
      code: err.code,
      name: err.name
    });
    
    // ✅ Handle unique key violation error
    if (err.code === 11000) {
      return res.status(400).json({
        error: 'This email is already registered.',
        code: 'EMAIL_EXISTS'
      });
    }
    
    // ✅ Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        error: 'Validation failed: ' + messages.join(', '),
        code: 'VALIDATION_ERROR'
      });
    }
    
    return res.status(500).json({ 
      error: 'Registration failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ✅ VERIFY EMAIL ROUTE (WITHOUT TRANSACTIONS)
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required.' });
    }

    const emailLower = email.toLowerCase().trim();

    // ✅ Check verification code (TTL will handle expiration)
    const verification = await Verification.findOne({
      email: emailLower,
      code: code
    });

    if (!verification) {
      return res.status(401).json({ 
        error: 'Invalid or expired verification code.' 
      });
    }

    // ✅ Mark user as verified
    const user = await User.findOneAndUpdate(
      { email: emailLower },
      { verified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // ✅ Delete verification record
    await Verification.deleteOne({ _id: verification._id });

    console.log('✅ Email verified for:', emailLower);

    return res.json({
      message: 'Email verified successfully!',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        verified: user.verified
      }
    });

  } catch (err) {
    console.error('❌ Verification error:', err);
    return res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

// ✅ RESEND VERIFICATION CODE (NO CHANGES NEEDED)
router.post('/resend', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const emailLower = email.toLowerCase().trim();

    // ✅ Check if user exists
    const user = await User.findOne({ email: emailLower });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.verified) {
      return res.status(400).json({ error: 'This email is already verified.' });
    }

    // ✅ Generate new code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Update verification record
    await Verification.findOneAndUpdate(
      { email: emailLower },
      {
        code: code,
        lastCodeSentAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log('✅ Resend verification code:', code, 'for:', emailLower);

    // ✅ Send email (don't fail if email fails)
    try {
      await sendVerificationEmail(emailLower, code);
    } catch (emailError) {
      console.error('⚠️ Email failed:', emailError.message);
    }

    return res.json({ 
      message: 'Verification code sent to your email!',
      email: emailLower
      // code: code  // ← Remove in production
    });

  } catch (err) {
    console.error('❌ Resend verification error:', err);
    return res.status(500).json({ error: 'Failed to resend code. Please try again.' });
  }
});

// ✅ TEMPORARY: Reset password route
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);
    
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { password: hashedPassword },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ DELETE UNVERIFIED ACCOUNT
router.post('/delete-unverified', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const emailLower = email.toLowerCase().trim();

    // ✅ Check if user is unverified
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.verified) {
      return res.status(400).json({ 
        error: 'Cannot delete verified account. Please contact support.' 
      });
    }

    // ✅ Delete unverified user
    await User.deleteOne({ email: emailLower, verified: false });

    // ✅ Delete verification record
    await Verification.deleteOne({ email: emailLower });

    console.log(`🗑️ Unverified account deleted: ${emailLower}`);

    return res.json({ 
      message: 'Account deleted successfully.'
    });

  } catch (err) {
    console.error('❌ Delete account error:', err);
    return res.status(500).json({ error: 'Failed to delete account.' });
  }
});

module.exports = router;
