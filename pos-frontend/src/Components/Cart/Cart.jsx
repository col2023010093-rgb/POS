import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { CartContext } from '../../context/CartContext'
import './Cart.css'
import { getImageSrc } from '../../utils/image'
import placeholder from '../../assets/placeholder.png'

const Cart = () => {
  const navigate = useNavigate()
  const { cart, removeFromCart } = useContext(CartContext)

  // ✅ ADD THESE LOGS
  console.log('🛒 Cart image type:', typeof cart?.[0]?.image)
  console.log('🛒 Cart image sample:', String(cart?.[0]?.image).slice(0, 120))
  console.log('🛒 Full cart item:', cart?.[0])

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="cart">
      <h2>Shopping Cart ({cart.length})</h2>
      
      {cart.length === 0 ? (
        <p className="empty-cart">Your cart is empty</p>
      ) : (
        <>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item._id} className="cart-item">
                <img
                  src={getImageSrc(item.image)}
                  alt={item.name}
                  style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', marginRight: 12 }}
                />
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>Qty: {item.quantity}</p>
                </div>
                <div className="item-price">
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                  <button 
                    className="btn-remove"
                    onClick={() => removeFromCart(item._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h3>Total: ${total.toFixed(2)}</h3>
            <button 
              className="btn-checkout"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart