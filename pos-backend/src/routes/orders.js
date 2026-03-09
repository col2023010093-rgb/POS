const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get user orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId || req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('📦 Fetching orders for user:', userId);

    const orders = await Order.find({ customerId: userId })
      .populate('customerId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${orders.length} orders`);
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId || req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { items, totalAmount, paymentMethod, paymentStatus, deliveryAddress, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // ✅ Validate stock
    const stockErrors = [];
    for (const cartItem of items) {
      const productId = cartItem.productId || cartItem._id || cartItem.product;
      const product = await Product.findById(productId);

      if (!product) {
        stockErrors.push(`${cartItem.name || 'Unknown item'} not found`);
        continue;
      }

      if (typeof product.stock === 'number') {
        if (product.stock <= 0) {
          stockErrors.push(`${product.name} is out of stock`);
        } else if (cartItem.quantity > product.stock) {
          stockErrors.push(`${product.name}: only ${product.stock} available`);
        }
      }
    }

    if (stockErrors.length > 0) {
      return res.status(400).json({
        message: 'Cannot complete order due to stock issues',
        errors: stockErrors
      });
    }

    // ✅ Deduct stock
    for (const cartItem of items) {
      const productId = cartItem.productId || cartItem._id || cartItem.product;
      const product = await Product.findById(productId);

      if (product && typeof product.stock === 'number') {
        product.stock -= cartItem.quantity;
        await product.save();
      }
    }

    // ✅ Auto-generate order number
    const orderCount = await Order.countDocuments();
    const timestamp = Date.now().toString().slice(-6);
    const orderNumber = `ORD-${timestamp}-${String(orderCount + 1).padStart(4, '0')}`;

    const order = new Order({
      orderNumber,
      customerId: userId,
      items: items.map(item => ({
        productId: item.productId || item._id || item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentStatus || 'pending',
      deliveryAddress,
      notes,
      status: 'pending'
    });

await order.save();
console.log('✅ Order created:', orderNumber);

const io = req.app.get('io');

// ✅ Notify all admins of new order
const admins = await User.find({ role: 'admin' }).select('_id');
for (const admin of admins) {
  const notif = await Notification.create({
    userId: admin._id,
    title: 'New Order Received',
    message: `Order ${orderNumber} was placed for ₱${totalAmount}.`,
    type: 'order',
    read: false
  });
  io?.to(`user_${admin._id}`).emit('notification', notif);
}

if (io) {
  io.emit('product_updated', { message: 'Stock updated' });
  io.emit('order_created', { order });
}

res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId || req.user?._id || req.user?.id;
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.customerId._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;