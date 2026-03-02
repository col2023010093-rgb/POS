import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import './checkout.css'
import { getImageSrc } from '../utils/image'
import placeholder from '../assets/placeholder.png'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

const CheckoutContent = () => {
  const navigate = useNavigate()
  const stripe = useStripe()
  const elements = useElements()
  const { cart, clearCart, getCartTotal } = useCart()
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')

  const totalAmount = getCartTotal()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!Array.isArray(cart) || cart.length === 0) {
        setError('Your cart is empty')
        return
      }

      if (!paymentMethod) {
        setError('Please select a payment method')
        return
      }

      console.log('🧾 Checkout item sample:', cart?.[0])

      // ✅ Cash
      if (paymentMethod === 'cash') {
        await api.post('/orders', {
          items: cart,
          totalAmount,
          customerId: user?._id,
          paymentMethod: 'cash',
          paymentStatus: 'pending',
        })

        clearCart()
        navigate('/orders')
        return
      }

      // ✅ Card / Stripe
      if (!stripe || !elements) return

      const { data } = await api.post('/payments/intent', { amount: totalAmount })
      const clientSecret = data?.clientSecret ?? data?.data?.clientSecret
      if (!clientSecret) throw new Error('No client secret')

      const cardElement = elements.getElement(CardElement)
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement },
        })

      if (stripeError) throw new Error(stripeError.message)

      if (paymentIntent.status === 'succeeded') {
        await api.post('/orders', {
          items: cart,
          totalAmount,
          customerId: user?._id,
          paymentMethod: 'card',
          paymentStatus: 'paid',
          paymentIntentId: paymentIntent.id,
        })

        clearCart()
        navigate('/orders')
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || err.message || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="checkout-container" onSubmit={handleSubmit}>
      <h1>Checkout</h1>

      <div className="checkout-grid">
        {/* Order Summary */}
        <section className="checkout-summary">
          <h2>Order Summary</h2>

          <div className="cart-items">
            {cart.map((item) => {
              const qty = Number(item.quantity || 1)
              const price = Number(item.price || 0)
              const lineTotal = price * qty

              return (
                <div className="cart-item" key={item._id}>
                  <img
                    src={getImageSrc(item.image)}
                    alt={item.name}
                    onError={(e) => { e.currentTarget.src = placeholder }}
                    style={{ width: 50, height: 50, borderRadius: 6, objectFit: 'cover', marginRight: 12 }}
                  />
                  <div>
                    <div className="item-name">{item.name}</div>
                    <div className="item-meta">
                      ₱{price.toFixed(2)} × {qty}
                    </div>
                  </div>
                  <div className="item-subtotal">
                    ₱{lineTotal.toFixed(2)}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Payment */}
        <section className="checkout-payment">
          <h2>Payment</h2>

          {error && <div className="error-message">{error}</div>}

          <div className="payment-methods">
            <label className={paymentMethod === 'cash' ? 'active' : ''}>
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Cash
            </label>

            <label className={paymentMethod === 'card' ? 'active' : ''}>
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Card
            </label>
          </div>

          {paymentMethod === 'card' && (
            <div className="card-element-wrapper">
              <CardElement className="stripe-card-element" />
            </div>
          )}

<div className="total-row">
  <span>Subtotal</span>
  <span>₱{totalAmount.toFixed(2)}</span>
</div>

<div className="total-divider" />

<div className="total-row total-final">
  <span>Total</span>
  <span>₱{totalAmount.toFixed(2)}</span>
</div>


          <button
            className="checkout-btn"
            type="submit"
            disabled={loading || cart.length === 0}
          >
            {loading ? 'Processing…' : 'Place Order'}
          </button>
        </section>
      </div>
    </form>
  )
}

const Checkout = () => (
  <Elements stripe={stripePromise}>
    <CheckoutContent />
  </Elements>
)

export default Checkout
