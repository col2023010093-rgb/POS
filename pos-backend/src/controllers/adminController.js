const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');

// ✅ Get all stats
exports.getStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalProducts,
      totalUsers,
      totalCustomers: totalUsers,
      pendingOrders
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'firstName lastName email phone')
      .populate('items.productId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('📝 Admin updating order:', id, 'to:', status);

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // ✅ Create notification
    if (order.customerId) {
      const message = `Your order ${order.orderNumber || order._id} is now ${status}.`;
      const notif = await Notification.create({
        userId: order.customerId,
        title: 'Order Status अपडेट',
        message,
        type: 'order'
      });

      // ✅ Emit to user room
      const io = req.app.get('io');
      io?.to(String(order.customerId)).emit('notification', notif);
    }

    console.log('✅ Order status updated:', order._id);
    res.json(order);
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update reservation status
exports.updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('📝 Admin updating reservation:', id, 'to:', status);

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const userId = reservation.userId || reservation.customerId;

    // ✅ Create notification
    if (userId) {
      const message = `Your reservation is now ${status}.`;
      const notif = await Notification.create({
        userId,
        title: 'Reservation Status अपडेट',
        message,
        type: 'reservation'
      });

      // ✅ Emit to user room
      const io = req.app.get('io');
      io?.to(String(userId)).emit('notification', notif);
    }

    console.log('✅ Reservation status updated:', reservation._id);
    res.json(reservation);
  } catch (error) {
    console.error('❌ Error updating reservation status:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ message: error.message });
  }
};