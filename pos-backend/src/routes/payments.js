require('dotenv').config(); // <-- Add this line

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY); // Debug log

// Create payment intent
router.post('/intent', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const userId = req.userId || req.user?.userId || req.user?._id || req.user?.id;

    // ✅ Get user email from database
    const user = await User.findById(userId);
    const customerEmail = user?.email || null;
    const customerName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

    // ✅ Create or retrieve Stripe customer
    let stripeCustomerId = null;
    if (customerEmail) {
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: customerEmail,
          name: customerName || undefined,
          metadata: { userId: userId.toString() }
        });
        stripeCustomerId = customer.id;
      }
    }

    // Stripe expects amount in cents
    const amountInCents = Math.round(amount * 100);

    const paymentIntentData = {
      amount: amountInCents,
      currency: 'php',
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: customerEmail,
      metadata: {
        userId: userId.toString(),
        customerEmail: customerEmail || '',
        customerName: customerName || ''
      }
    };

    if (stripeCustomerId) {
      paymentIntentData.customer = stripeCustomerId;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    console.log('✅ Payment intent created:', paymentIntent.id, '| Email:', customerEmail);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Confirm payment
router.post('/confirm', authMiddleware, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id,
      receiptEmail: paymentIntent.receipt_email
    });
  } catch (error) {
    console.error('Payment confirm error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;