const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  try {
    console.log('💳 /payments/intent body:', req.body)

    const amountPeso = Number(req.body?.amount)

    // ✅ defensive validation
    if (!Number.isFinite(amountPeso) || amountPeso <= 0) {
      return res.status(400).json({
        message: 'Invalid amount - must be a positive number',
        received: req.body?.amount ?? null,
      })
    }

    // ✅ convert pesos to cents
    const amountCents = Math.round(amountPeso * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'php',
    })

    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === 'succeeded') {
      return res.json({ message: 'Payment confirmed', status: 'succeeded' })
    }

    return res.status(400).json({ message: 'Payment not completed', status: paymentIntent.status })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
};