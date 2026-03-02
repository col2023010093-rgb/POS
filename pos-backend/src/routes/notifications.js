const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// ✅ Import auth middleware
const authImport = require('../middleware/auth');
const auth = typeof authImport === 'function'
  ? authImport
  : authImport?.verifyToken || authImport?.authenticate || authImport?.default;

// ✅ All notification routes require authentication
router.use(auth);

// ✅ Get user notifications
router.get('/', notificationController.getNotifications);

// ✅ Mark notification as read
router.patch('/:id/read', notificationController.markAsRead);

// ✅ Delete notification (optional)
router.delete('/:id', notificationController.deleteNotification || ((req, res) => {
  res.status(501).json({ message: 'Delete not implemented' });
}));

module.exports = router;