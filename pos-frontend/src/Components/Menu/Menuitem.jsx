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
      aria-disabled={isOutOfStock}
    >
      {/* ── Badges ── */}
      {item.popular && !isOutOfStock && (
        <div className="popular-badge">
          <span>🔥 Popular</span>
        </div>
      )}

      {isOutOfStock && (
        <div className="stock-badge">
          <span className="stock-badge-icon">🚫</span>
          Out of Stock
        </div>
      )}

      {/* ── Image ── */}
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

        {/* Grayscale overlay when out of stock */}
        {isOutOfStock && (
          <div className="oos-image-overlay" aria-hidden="true">
            <span className="oos-overlay-text">Unavailable</span>
          </div>
        )}

        {/* Quick add — only shown on hover when in stock */}
        {!isOutOfStock && (
          <div className="image-overlay">
            <button className="quick-add" onClick={handleAddToCart}>
              Quick Add
            </button>
          </div>
        )}
      </div>

      {/* ── Details ── */}
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
          <div className={`item-price ${isOutOfStock ? 'item-price--oos' : ''}`}>
            ₱{item.price.toFixed(2)}
          </div>

          <button
            className={`add-to-cart-btn ${isAdding ? 'added' : ''} ${isOutOfStock ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            title={isOutOfStock ? 'This item is currently out of stock' : 'Add to cart'}
            aria-label={
              isOutOfStock
                ? `${item.name} — out of stock`
                : isAdding
                ? `${item.name} added to cart`
                : `Add ${item.name} to cart`
            }
          >
            {isOutOfStock ? (
              <>
                <span className="btn-oos-icon">🚫</span>
                <span>Out of Stock</span>
              </>
            ) : isAdding ? (
              <span className="added-text">Added! ✓</span>
            ) : (
              <span>Add to Cart</span>
            )}
          </button>
        </div>

        {/* Extra out-of-stock notice under the footer */}
        {isOutOfStock && (
          <p className="oos-notice" role="status">
            Currently unavailable — check back soon
          </p>
        )}
      </div>
    </div>
  )
}

export default MenuItem