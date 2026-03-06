import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
import './AdminDashboard.css'

const AdminMenu = () => {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    if (!user?.role || user?.role !== 'admin') {
      navigate('/')
      return
    }
    fetchProducts()
  }, [user, navigate])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await api.getAdminProducts()
      const data = Array.isArray(res.data) ? res.data : (res.data?.products || [])
      setProducts(data)
    } catch (err) {
      console.error('Failed to fetch products:', err)
      setError(err.message || 'Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStock = async (product) => {
    try {
      await api.updateProduct(product._id, { inStock: !product.inStock })
      setNotice(`${product.name} marked as ${!product.inStock ? 'In Stock' : 'Out of Stock'}`)
      setTimeout(() => setNotice(''), 2500)
      fetchProducts()
    } catch (err) {
      console.error('Failed to update product:', err)
      setError(err.response?.data?.message || err.message || 'Failed to update product')
    }
  }

  const formatPHP = (value) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0))

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]

  const filteredProducts = products.filter(p => {
    if (selectedCategory === 'all') return true
    return p.category === selectedCategory
  })

  if (loading) return <div className="admin-loading">Loading menu...</div>

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="dashboard-header">
          <h1>Menu Overview</h1>
          <p className="dashboard-subtitle">{products.length} items on the menu</p>
        </div>

        {notice && <div className="admin-notice">{notice}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="admin-tabs">
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

        <div className="admin-table-section">
          <h2>Menu Items</h2>
          {filteredProducts.length === 0 ? (
            <p className="admin-loading">No items found</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Prep Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p._id}>
                    <td>
                      {p.image ? (
                        <img src={p.image.startsWith('http') ? p.image : `http://localhost:4000${p.image}`} alt={p.name} className="product-thumb" />
                      ) : '-'}
                    </td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{formatPHP(p.price)}</td>
                    <td>{p.prepTime || '-'}</td>
                    <td>
                      <span className={`role-badge ${p.inStock ? 'staff' : 'admin'}`}>
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-view" onClick={() => handleToggleStock(p)}>
                        {p.inStock ? 'Mark Out' : 'Mark In'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminMenu