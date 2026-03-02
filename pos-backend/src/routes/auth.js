const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Verification = require('../models/Verification');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((err) => {
  if (err) console.error('❌ SMTP verify failed:', err.message);
  else console.log('✅ SMTP ready');
});

// ✅ Register route: send verification code
router.post('/register', async (req, res) => {
  try {
    let { firstName, lastName, email, password, phone } = req.body;

    // ✅ Validate all required fields
    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    email = (email || '').trim().toLowerCase();

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      return res.status(400).json({ error: 'Only Gmail addresses are allowed.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // ✅ Store user data as a nested object
    await Verification.findOneAndUpdate(
      { email },
      { 
        code, 
        expires,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: password,
        phone: phone.trim()
      },
      { upsert: true, new: true }
    );

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verification Code',
      text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`
    });

    console.log('✅ Verification email sent to', email);
    return res.json({ message: 'Verification code sent' });
  } catch (err) {
    console.error('❌ REGISTER ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ✅ Verify route: check code and create user
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    console.log('📨 Verifying code for:', email, 'Code:', code);

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    const record = await Verification.findOne({ email });

    if (!record) {
      return res.status(400).json({ error: 'No pending verification' });
    }

    if (new Date() > record.expires) {
      await Verification.deleteOne({ email });
      return res.status(400).json({ error: 'Code expired. Please register again.' });
    }

    if (record.code !== code.toString()) {
      return res.status(400).json({ error: 'Incorrect code' });
    }

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(record.password, 10);

    // ✅ Create user with all fields from verification record
    const user = await User.create({
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      password: hashedPassword,
      phone: record.phone
    });

    console.log('✅ User created:', user._id);

    // ✅ Delete verification record
    await Verification.deleteOne({ email });

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ User verified and created:', user._id);

    res.json({ 
      message: 'Account created successfully',
      token,
      user: { 
        id: user._id, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        email: user.email 
      }
    });

  } catch (err) {
    console.error('❌ VERIFY ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Resend route: send new code with rate limiting
router.post('/resend', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('📤 Resending code to:', email);

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const record = await Verification.findOne({ email });
    if (!record) {
      return res.status(400).json({ error: 'No pending verification' });
    }

    // ✅ Check if last code was sent less than 1 minute ago
    const now = new Date();
    const lastCodeSentTime = record.lastCodeSentAt || record.createdAt;
    const timeSinceLastCode = (now - lastCodeSentTime) / 1000 / 60; // Convert to minutes

    if (timeSinceLastCode < 1) {
      const secondsToWait = Math.ceil(60 - (timeSinceLastCode * 60));
      return res.status(429).json({ 
        error: `Please wait ${secondsToWait} seconds before requesting a new code`,
        retryAfter: secondsToWait
      });
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // ✅ Update with new code and track when it was sent
    record.code = code;
    record.expires = expires;
    record.lastCodeSentAt = now;
    await record.save();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your New Verification Code',
      text: `Your new verification code is: ${code}\n\nThis code expires in 10 minutes.`
    });

    console.log('✅ New verification code sent to:', email);
    res.json({ 
      message: 'New code sent to your email',
      retryAfter: 60
    });

  } catch (err) {
    console.error('❌ RESEND ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Check email availability
router.post('/check-email', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!gmailRegex.test(email)) {
      return res.status(400).json({ error: 'Only Gmail addresses are allowed.' });
    }

    const exists = await User.exists({ email });
    return res.json({
      available: !exists,
      message: exists ? 'Email is already registered.' : 'Email is available.'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ✅ Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', email);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('❌ LOGIN ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ✅ Test route
router.post('/test', (req, res) => {
  console.log('✅ Test route called!');
  res.json({ message: 'Test route works' });
});

module.exports = router;