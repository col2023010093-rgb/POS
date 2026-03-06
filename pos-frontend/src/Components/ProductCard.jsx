import React from 'react';
import './ProductCard.css';

const ProductCard = ({ item, onAddToCart }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  return (
    <div className="product-card">
      <div className="product-image">
        {item.image ? (
          <img 
            src={`${API_URL}${item.image}`} 
            alt={item.name}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
        ) : (
          <div className="no-image">📷 No Image</div>
        )}
        {item.popular && <span className="badge-popular">Popular</span>}
      </div>
      <div className="product-info">
        <h3>{item.name}</h3>
        <p className="description">{item.description}</p>
        <div className="product-meta">
          <span className="prep-time">⏱️ {item.prepTime}</span>
          <span className="category">{item.category}</span>
        </div>
        <div className="product-footer">
          <span className="price">${item.price.toFixed(2)}</span>
          <button 
            className="btn-add-cart"
            onClick={() => onAddToCart(item)}
            disabled={!item.inStock}
          >
            {item.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;