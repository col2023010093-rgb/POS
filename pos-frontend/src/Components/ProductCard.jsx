import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';
import { getImageSrc } from '../utils/image';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, 1);
    alert(`${product.name} added to cart!`);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        {product.image && !imageError ? (
          <img 
            src={getImageSrc(product.image)} 
            alt={product.name}
            onError={handleImageError}
          />
        ) : (
          <div className="image-placeholder">🍖</div>
        )}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="description">{product.description}</p>
        {product.ingredients && (
          <p className="ingredients">Ingredients: {product.ingredients.join(', ')}</p>
        )}
        <div className="product-footer">
          <span className="price">₱{product.price.toFixed(2)}</span>
          <button 
            className="btn-add-cart"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;