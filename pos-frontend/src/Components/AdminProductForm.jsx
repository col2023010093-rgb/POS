import React, { useState } from 'react';
import api from '../api';
import './AdminProductForm.css';

const AdminProductForm = ({ onSuccess, existingProduct }) => {
  const [formData, setFormData] = useState({
    name: existingProduct?.name || '',
    description: existingProduct?.description || '',
    price: existingProduct?.price || '',
    category: existingProduct?.category || '',
    prepTime: existingProduct?.prepTime || '15 mins',
    ingredients: existingProduct?.ingredients?.join(', ') || '',
    inStock: existingProduct?.inStock !== undefined ? existingProduct.inStock : true,
    popular: existingProduct?.popular || false
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(existingProduct?.image || null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('prepTime', formData.prepTime);
      data.append('inStock', formData.inStock);
      data.append('popular', formData.popular);
      
      // Convert ingredients string to array
      const ingredientsArray = formData.ingredients
        .split(',')
        .map(i => i.trim())
        .filter(i => i);
      data.append('ingredients', JSON.stringify(ingredientsArray));
      
      if (imageFile) {
        data.append('image', imageFile);
      }

      let response;
      if (existingProduct) {
        response = await api.patch(`/api/products/${existingProduct._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Product updated successfully!');
      } else {
        response = await api.post('/api/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Product created successfully!');
      }

      onSuccess && onSuccess(response.data);
      
      if (!existingProduct) {
        // Reset form only for new products
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          prepTime: '15 mins',
          ingredients: '',
          inStock: true,
          popular: false
        });
        setImageFile(null);
        setPreview(null);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert(`Failed to ${existingProduct ? 'update' : 'create'} product: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-product-form">
      <h2>{existingProduct ? 'Edit Product' : 'Add New Product'}</h2>
      
      <div className="form-group">
        <label>Product Image</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={handleImageChange}
        />
        {preview && (
          <div className="image-preview">
            <img 
              src={preview.startsWith('blob:') ? preview : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${preview}`} 
              alt="Preview" 
            />
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Name *</label>
        <input 
          type="text" 
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea 
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Price *</label>
          <input 
            type="number" 
            name="price"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Category *</label>
          <select 
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select category</option>
            <option value="ribs">Ribs</option>
            <option value="brisket">Brisket</option>
            <option value="chicken">Chicken</option>
            <option value="pork">Pork</option>
            <option value="sides">Sides</option>
            <option value="drinks">Drinks</option>
            <option value="desserts">Desserts</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Prep Time</label>
        <input 
          type="text" 
          name="prepTime"
          value={formData.prepTime}
          onChange={handleChange}
          placeholder="e.g., 15 mins"
        />
      </div>

      <div className="form-group">
        <label>Ingredients (comma-separated)</label>
        <input 
          type="text" 
          name="ingredients"
          value={formData.ingredients}
          onChange={handleChange}
          placeholder="e.g., Beef, Salt, Pepper"
        />
      </div>

      <div className="form-row checkboxes">
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            name="inStock"
            checked={formData.inStock}
            onChange={handleChange}
          />
          In Stock
        </label>

        <label className="checkbox-label">
          <input 
            type="checkbox" 
            name="popular"
            checked={formData.popular}
            onChange={handleChange}
          />
          Popular Item
        </label>
      </div>

      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? 'Saving...' : existingProduct ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  );
};

export default AdminProductForm;