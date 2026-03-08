import React, { useState, useEffect } from 'react';
import api from '../api';
import './AdminProductForm.css';

// ✅ Fetch real categories from DB so they always match what's in the system
const FALLBACK_CATEGORIES = [
  'ribs', 'brisket', 'chicken', 'pork', 'sides', 'drinks', 'desserts'
];

const AdminProductForm = ({ onSuccess, existingProduct }) => {
  const [formData, setFormData] = useState({
    name:        existingProduct?.name        || '',
    description: existingProduct?.description || '',
    price:       existingProduct?.price       || '',
    category:    existingProduct?.category    || '',
    prepTime:    existingProduct?.prepTime    || '15 mins',
    ingredients: existingProduct?.ingredients?.join(', ') || '',
    inStock:     existingProduct?.inStock !== undefined ? existingProduct.inStock : true,
    popular:     existingProduct?.popular     || false,
  });

  const [imageFile,  setImageFile]  = useState(null);
  const [preview,    setPreview]    = useState(existingProduct?.image || null);
  const [loading,    setLoading]    = useState(false);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);

  // ✅ Load real categories from existing products in DB
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/api/admin/products');
        const products = Array.isArray(res.data) ? res.data : [];
        const dbCats = [...new Set(products.map(p => p.category).filter(Boolean))];
        if (dbCats.length > 0) setCategories(dbCats);
      } catch {
        // fallback to hardcoded list if fetch fails
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name',        formData.name);
      data.append('description', formData.description);
      data.append('price',       formData.price);
      data.append('category',    formData.category);
      data.append('prepTime',    formData.prepTime);
      data.append('inStock',     String(formData.inStock));
      data.append('popular',     String(formData.popular));

      const ingredientsArray = formData.ingredients
        .split(',').map(i => i.trim()).filter(i => i);
      data.append('ingredients', JSON.stringify(ingredientsArray));

      if (imageFile) data.append('image', imageFile);

      let response;
      if (existingProduct) {
        // ✅ Fixed: use /api/admin/products route (consistent with rest of admin)
        response = await api.patch(`/api/admin/products/${existingProduct._id}`, data);
        alert('✅ Product updated successfully!');
      } else {
        response = await api.post('/api/products', data);
        alert('✅ Product created successfully!');
      }

      onSuccess && onSuccess(response.data);

      if (!existingProduct) {
        setFormData({
          name: '', description: '', price: '', category: '',
          prepTime: '15 mins', ingredients: '', inStock: true, popular: false,
        });
        setImageFile(null);
        setPreview(null);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert(`❌ Failed to ${existingProduct ? 'update' : 'create'} product: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-product-form">
      <h2>{existingProduct ? 'Edit Product' : 'Add New Product'}</h2>

      <div className="form-group">
        <label>Product Image</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Name *</label>
        <input
          type="text" name="name"
          value={formData.name} onChange={handleChange} required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description" value={formData.description}
          onChange={handleChange} rows="3"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Price *</label>
          <input
            type="number" name="price" step="0.01" min="0"
            value={formData.price} onChange={handleChange} required
          />
        </div>

        <div className="form-group">
          <label>Category *</label>
          <select
            name="category" value={formData.category}
            onChange={handleChange} required
          >
            <option value="">Select category</option>
            {/* ✅ Dynamic categories from DB + allow typing a new one */}
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          {/* ✅ Allow adding a new category not yet in the list */}
          <input
            type="text" name="category"
            placeholder="Or type a new category…"
            value={formData.category}
            onChange={handleChange}
            style={{ marginTop: '6px', fontSize: '12px' }}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Prep Time</label>
        <input
          type="text" name="prepTime"
          value={formData.prepTime} onChange={handleChange}
          placeholder="e.g., 15 mins"
        />
      </div>

      <div className="form-group">
        <label>Ingredients (comma-separated)</label>
        <input
          type="text" name="ingredients"
          value={formData.ingredients} onChange={handleChange}
          placeholder="e.g., Beef, Salt, Pepper"
        />
      </div>

      <div className="form-row checkboxes">
        <label className="checkbox-label">
          <input
            type="checkbox" name="inStock"
            checked={formData.inStock} onChange={handleChange}
          />
          In Stock
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox" name="popular"
            checked={formData.popular} onChange={handleChange}
          />
          Popular Item
        </label>
      </div>

      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? 'Saving…' : existingProduct ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  );
};

export default AdminProductForm;