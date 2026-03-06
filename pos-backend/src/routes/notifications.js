const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// ✅ Get notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(notifications);
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Mark as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Create notification (emit via socket)
router.post('/', auth, async (req, res) => {
  try {
    const { title, message, type, relatedId } = req.body;

    const notification = new Notification({
      userId: req.user.id,
      title,
      message,
      type,
      relatedId,
      read: false
    });

    await notification.save();

    // ✅ Emit to user via socket
    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('notification', notification);

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;