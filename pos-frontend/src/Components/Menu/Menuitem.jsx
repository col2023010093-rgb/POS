import React, { useState } from 'react'
import { getImageSrc } from '../../utils/image'

const MenuItem = ({ item, index, onAddToCart, onItemClick, isOutOfStock = false }) => {
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    if (isOutOfStock) return
    setIsAdding(true)
    onAddToCart(item)
    setTimeout(() => setIsAdding(false), 600)
  }

  const handleCardClick = () => {
    onItemClick(item)
  }

  return (
    <div
      className={`menu-item-card ${isAdding ? 'adding' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={handleCardClick}
    >
      {item.popular && !isOutOfStock && (
        <div className="popular-badge">
          <span>🔥 Popular</span>
        </div>
      )}

      {isOutOfStock && (
        <div className="stock-badge">Out of Stock</div>
      )}
      
      <div className="item-image">
        {item.image ? (
          <img
            src={getImageSrc(item.image)}
            alt={item.name}
            className="item-img"
          />
        ) : (
          <span className="item-emoji">🍖</span>
        )}
        <div className="image-overlay">
          <button
            className={`quick-add ${isOutOfStock ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Unavailable' : 'Quick Add'}
          </button>
        </div>
      </div>
      
      <div className="item-details">
        <div className="item-category">{item.category}</div>
        <h3 className="item-name">{item.name}</h3>
        <p className="item-description">{item.description}</p>
        
        {item.tags && item.tags.length > 0 && (
          <div className="item-tags-preview">
            {item.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="tag-preview">{tag}</span>
            ))}
          </div>
        )}
        
        <div className="item-footer">
          <div className="item-price">
            ₱{item.price.toFixed(2)}
          </div>
          <button 
            className={`add-to-cart-btn ${isAdding ? 'added' : ''} ${isOutOfStock ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
          >
            {isOutOfStock ? (
              <span>Unavailable</span>
            ) : isAdding ? (
              <span className="added-text">Added! ✓</span>
            ) : (
              <span>Add to Cart</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MenuItem