import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
import './AdminDashboard.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const AdminMenu = () => {
  const navigate        = useNavigate()
  const { user, token } = useAuth()
  const [products,      setProducts]      = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [notice,        setNotice]        = useState('')
  const [selectedCat,   setSelectedCat]   = useState('all')
  const [search,        setSearch]        = useState('')
  const [updating,      setUpdating]      = useState(null)

  useEffect(() => {
    if (!user?.role || user?.role !== 'admin') { navigate('/'); return }
    fetchProducts()
  }, [user, navigate])

  const fetchProducts = async () => {
    setLoading(true); setError(null)
    try {
      const res  = await api.getAdminProducts()
      const data = Array.isArray(res.data) ? res.data : (res.data?.products || [])
      setProducts(data)
    } catch (err) {
      setError(err.message || 'Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  const showNotice = msg => { setNotice(msg); setTimeout(() => setNotice(''), 3000) }

  const handleToggleStock = async (product) => {
    setUpdating(product._id)
    try {
      await api.updateProduct(product._id, { inStock: !product.inStock })
      setProducts(prev => prev.map(p =>
        p._id === product._id ? { ...p, inStock: !p.inStock } : p
      ))
      showNotice(`✅ ${product.name} marked as ${!product.inStock ? 'In Stock' : 'Out of Stock'}`)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update product')
    } finally {
      setUpdating(null)
    }
  }

  const formatPHP = v =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(v || 0))

  const imgSrc = p => {
    if (!p.image) return null
    if (p.image.startsWith('http')) return p.image
    return `${API_BASE}${p.image}`
  }

  /* ── categories & filtered list ── */
  const categories = useMemo(() => ['all', ...new Set(products.map(p => p.category).filter(Boolean))], [products])

  const visible = useMemo(() => {
    let list = [...products]
    if (selectedCat !== 'all') list = list.filter(p => p.category === selectedCat)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q))
    }
    return list
  }, [products, selectedCat, search])

  const inStockCount  = products.filter(p => p.inStock).length
  const outStockCount = products.filter(p => !p.inStock).length

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-container">
          <div className="admin-loading">🔥 Loading the smokehouse menu…</div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">

        {/* ── Header ── */}
        <div className="dashboard-header">
          <div>
            <h1>Menu Management</h1>
            <p className="dashboard-subtitle">
              {products.length} items on the menu — {inStockCount} in stock, {outStockCount} out
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button className="btn-secondary" onClick={fetchProducts}>↻ Refresh</button>
            <button className="btn-primary" onClick={() => navigate('/admin/products')}>
              + Add Item
            </button>
          </div>
        </div>

        {notice && <div className="admin-notice">{notice}</div>}
        {error  && <div className="error-message">⚠ {error}</div>}

        {/* ── Stats row ── */}
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <span className="stat-icon">🍖</span>
            <h3>Total Items</h3>
            <p className="stat-number">{products.length}</p>
          </div>
          <div className="stat-card success">
            <span className="stat-icon">✅</span>
            <h3>In Stock</h3>
            <p className="stat-number">{inStockCount}</p>
          </div>
          <div className="stat-card alert">
            <span className="stat-icon">🚫</span>
            <h3>Out of Stock</h3>
            <p className="stat-number">{outStockCount}</p>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏷️</span>
            <h3>Categories</h3>
            <p className="stat-number">{categories.length - 1}</p>
          </div>
        </div>

        {/* ── Category tabs ── */}
        <div className="admin-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={selectedCat === cat ? 'active' : ''}
              onClick={() => setSelectedCat(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
              {cat !== 'all' && ` (${products.filter(p => p.category === cat).length})`}
              {cat === 'all' && ` (${products.length})`}
            </button>
          ))}
        </div>

        {/* ── Search bar ── */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search menu items…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          {search && (
            <button className="btn-secondary" onClick={() => setSearch('')}>✕ Clear</button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--brand-tan)', fontWeight: 600 }}>
            {visible.length} item{visible.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Table ── */}
        <div className="admin-table-section">
          <h2>Menu Items</h2>

          {visible.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🍽️</div>
              <p>No items found for this category.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Prep Time</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(p => (
                    <tr key={p._id} style={{ opacity: updating === p._id ? 0.6 : 1 }}>
                      <td>
                        {imgSrc(p) ? (
                          <img src={imgSrc(p)} alt={p.name} className="product-thumb" />
                        ) : (
                          <div style={{
                            width: 48, height: 48, borderRadius: 10,
                            background: 'var(--brand-smoke)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.3rem', border: '1.5px solid rgba(196,168,130,.3)'
                          }}>🍖</div>
                        )}
                      </td>
                      <td><strong>{p.name}</strong></td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '0.25rem 0.65rem',
                          borderRadius: 50, fontSize: '0.75rem', fontWeight: 700,
                          background: 'var(--brand-smoke)', color: 'var(--brand-copper)',
                          textTransform: 'capitalize', border: '1px solid rgba(196,168,130,.35)'
                        }}>
                          {p.category}
                        </span>
                      </td>
                      <td><strong>{formatPHP(p.price)}</strong></td>
                      <td>{p.prepTime ? `${p.prepTime} min` : <span style={{ color: 'var(--brand-tan)' }}>—</span>}</td>
                      <td>
                        <span className={`role-badge ${p.inStock ? 'in-stock' : 'out-stock'}`}>
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button
                            className={p.inStock ? 'btn-delete' : 'btn-view'}
                            onClick={() => handleToggleStock(p)}
                            disabled={updating === p._id}
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}
                          >
                            {p.inStock ? 'Mark Out' : 'Mark In'}
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => navigate(`/admin/products?edit=${p._id}`)}
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default AdminMenu