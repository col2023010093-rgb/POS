const express = require('express');
const router = express.Router();
// const { verifyToken } = require('../middleware/auth'); // TEMPORARILY COMMENT OUT
const User = require('../models/User');

// TEMPORARY: Remove verifyToken for testing
router.get('/', async (req, res) => {
  res.json({ message: "Profile route works" });
});

// UPDATE profile
router.put('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    const [firstName, ...lastArr] = name.split(' ');
    const lastName = lastArr.join(' ') || '';
    const user = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, email },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      name: `${user.firstName} ${user.lastName}`,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;