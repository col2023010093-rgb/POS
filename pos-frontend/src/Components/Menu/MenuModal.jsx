import React, { useState, useEffect } from 'react'
import { FaTimes, FaMinus, FaPlus, FaClock, FaFire } from 'react-icons/fa'
import { getImageSrc } from '../../utils/image'

const MenuModal = ({ item, isOpen, onClose, onAddToCart, isOutOfStock = false }) => {
  const [quantity, setQuantity] = useState(1)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setIsClosing(false)
    }
  }, [isOpen, item])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300)
  }

  const handleAddToOrder = () => {
    if (isOutOfStock) return
    onAddToCart(item, quantity)
    handleClose()
  }

  const incrementQuantity = () => setQuantity(prev => prev + 1)
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1))

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!isOpen && !isClosing) return null

  return (
    <div 
      className={`modal-overlay ${isOpen && !isClosing ? 'active' : ''} ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={`modal-container ${isOpen && !isClosing ? 'active' : ''} ${isClosing ? 'closing' : ''}`}>
        <button className="modal-close" onClick={handleClose}>
          <FaTimes />
        </button>

        {item && (
          <>
            <div className="modal-header">
              <div className="modal-image">
                {item.image ? (
                  <img
                    src={getImageSrc(item.image)}
                    alt={item.name}
                    className="modal-img"
                  />
                ) : (
                  <span className="modal-emoji">🍖</span>
                )}
              </div>
              <div className="modal-header-overlay"></div>
              {item.popular && !isOutOfStock && (
                <div className="modal-badge">🔥 Best Seller</div>
              )}
              {isOutOfStock && (
                <div className="modal-badge out-of-stock-badge">Out of Stock</div>
              )}
            </div>

            <div className="modal-content">
              <div className="modal-title-section">
                <h2 className="modal-title">{item.name}</h2>
                <div className="modal-price">
                  ₱{item.price.toFixed(2)}
                </div>
              </div>

              {isOutOfStock && (
                <div className="stock-alert" role="alert">
                  ⚠️ This item is currently out of stock and cannot be ordered.
                </div>
              )}

              <div className="modal-meta">
                {item.prepTime && (
                  <div className="meta-item">
                    <FaClock />
                    <span>{item.prepTime}</span>
                  </div>
                )}
                {item.calories && (
                  <div className="meta-item">
                    <FaFire />
                    <span>{item.calories} cal</span>
                  </div>
                )}
              </div>

              <p className="modal-description">{item.description}</p>

              {item.tags && item.tags.length > 0 && (
                <div className="modal-tags">
                  {item.tags.map((tag, index) => (
                    <span key={index} className={`modal-tag ${tag.toLowerCase().includes('spicy') ? 'spicy' : ''} ${tag.toLowerCase().includes('vegetarian') || tag.toLowerCase().includes('vegan') ? 'vegetarian' : ''} ${tag.toLowerCase().includes('best') || tag.toLowerCase().includes('favorite') ? 'popular' : ''}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {item.ingredients && item.ingredients.length > 0 && (
                <div className="modal-ingredients">
                  <h4>Ingredients</h4>
                  <div className="ingredients-list">
                    {item.ingredients.map((ingredient, index) => (
                      <span key={index} className="ingredient-item">{ingredient}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-quantity-section">
                <span className="quantity-label">Quantity</span>
                <div className="quantity-selector">
                  <button 
                    className="quantity-btn"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1 || isOutOfStock}
                  >
                    <FaMinus />
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={incrementQuantity}
                    disabled={isOutOfStock}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>

              <button
                className={`modal-add-btn ${isOutOfStock ? 'disabled' : ''}`}
                onClick={handleAddToOrder}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? (
                  <span>Unavailable</span>
                ) : (
                  <>
                    <span>Add to Order</span>
                    <span className="btn-price">₱{(item.price * quantity).toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MenuModal