import React, { useState } from 'react'
import { getImageSrc } from '../../utils/image'

const MenuItem = ({ item, index, onAddToCart, onItemClick }) => {
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    setIsAdding(true)
    onAddToCart(item)
    setTimeout(() => setIsAdding(false), 600)
  }

  const handleCardClick = () => {
    onItemClick(item)
  }

  return (
    <div
      className={`menu-item-card ${isAdding ? 'adding' : ''}`}
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={handleCardClick}
    >
      {item.popular && (
        <div className="popular-badge">
          <span>🔥 Popular</span>
        </div>
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
          <button className="quick-add" onClick={handleAddToCart}>
            Quick Add
          </button>
        </div>
      </div>
      
      <div className="item-details">
        <div className="item-category">{item.category}</div>
        <h3 className="item-name">{item.name}</h3>
        <p className="item-description">{item.description}</p>
        
        {/* Tags Preview */}
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
            className={`add-to-cart-btn ${isAdding ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
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