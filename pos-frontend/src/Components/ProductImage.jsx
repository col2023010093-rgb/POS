import React, { useState } from 'react';
import { getImageSrc } from '../utils/image';

const ProductImage = ({ 
  image, 
  alt = 'Product', 
  placeholder = '🍖',
  className = '',
  style = {},
  onError = null 
}) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    console.warn(`❌ Failed to load image: ${image}`);
    setHasError(true);
    onError?.();
  };

  if (!image || hasError) {
    return (
      <div 
        className={`image-placeholder ${className}`}
        style={style}
      >
        {placeholder}
      </div>
    );
  }

  return (
    <img 
      src={getImageSrc(image)} 
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      onLoad={() => console.log(`✅ Loaded image: ${image}`)}
    />
  );
};

export default ProductImage;
