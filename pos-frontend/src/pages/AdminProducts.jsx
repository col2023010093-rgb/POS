import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminProductForm from '../Components/AdminProductForm';
import api from '../api';
import './AdminProducts.css';

const formatPrice = (value) => {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n);
};

const AdminProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // ✅ Remove useMenu() - use local state instead
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // ✅ Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      alert('❌ Admin access only');
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/products');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ close modal with ESC + lock background scroll
  useEffect(() => {
    if (!showForm) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowForm(false);
        setEditingProduct(null);
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showForm]);

  const handleSuccess = () => {
    fetchMenu();
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;

    try {
      await api.delete(`/api/products/${id}`);
      alert('✅ Product deleted!');
      fetchMenu();
    } catch (error) {
      alert('❌ Failed to delete');
    }
  };

  // ✅ Safe filter
  const filteredProducts = (products || []).filter(product => {
    if (selectedCategory === 'all') return true;
    return product.category === selectedCategory;
  });

  const categories = ['all', ...new Set((products || []).map(p => p.category).filter(Boolean))];

  if (loading) return <div className="admin-products"><p>Loading...</p></div>;

  return (
    <div className="admin-products">
      <div className="admin-header">
        <div>
          <h1>📦 Product Management</h1>
          <p className="admin-user">👤 Admin: {user?.firstName}</p>
        </div>
        <button
          className="btn-add-new"
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
        >
          + Add Product
        </button>
      </div>

      {showForm && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-label={editingProduct ? 'Edit product' : 'Add product'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <AdminProductForm
                onSuccess={handleSuccess}
                existingProduct={editingProduct}
              />
            </div>
          </div>
        </div>
      )}

      <div className="products-filter">
        {categories.map(cat => (
          <button 
            key={cat}
            className={selectedCategory === cat ? 'active' : ''}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)} 
            {cat !== 'all' && ` (${products.filter(p => p.category === cat).length})`}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="no-products">No products found</div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product._id} className="product-admin-card">
              <div className="product-image">
                {product.image ? (
                  <img 
                    src={`http://localhost:4000${product.image}`}
                    alt={product.name}
                    onError={(e) => e.target.src = 'https://via.placeholder.com/200x150'}
                  />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="product-details">
                <h3>{product.name}</h3>
                <p className="category">{product.category}</p>
                <p className="price">{formatPrice(product.price)}</p>
                <div className="product-actions">
                  <button className="btn-edit" onClick={() => handleEdit(product)}>
                    ✏️ Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(product._id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;