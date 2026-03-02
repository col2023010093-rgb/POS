const Order = require('../models/Order');

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id

    if (!userId) {
      return res.status(400).json({ message: 'User ID not found' })
    }

    const orders = await Order.find({ customerId: userId }).sort({ createdAt: -1 })
    console.log(`📦 Found ${orders.length} orders for customer ${userId}`)
    res.json(orders || [])
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ message: error.message })
  }
}

// ✅ Alias for route compatibility
exports.getOrders = exports.getUserOrders;

exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod, deliveryAddress } = req.body
    const customerId = req.user.id

    if (!items || !totalAmount) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const orderNumber = `ORD-${Date.now()}`

    const order = await Order.create({
      orderNumber,
      customerId,
      items,
      totalAmount,
      paymentMethod: paymentMethod || 'cash',
      deliveryAddress,
      paymentStatus: 'pending',
      status: 'pending'
    })

    res.status(201).json(order)
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ message: error.message })
  }
}

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}