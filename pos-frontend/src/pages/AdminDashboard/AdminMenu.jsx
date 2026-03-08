import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
import './AdminDashboard.css'
import './AdminProducts.css'
import './AdminMenu.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const AdminMenu = () => {
  const navigate        = useNavigate()
  const { user }        = useAuth()
  const [products,      setProducts]  = useState([])
  const [loading,       setLoading]   = useState(true)
  const [error,         setError]     = useState(null)
  const [notice,        setNotice]    = useState('')
  const [selectedCat,   setSelectedCat] = useState('all')
  const [search,        setSearch]    = useState('')
  const [updating,      setUpdating]  = useState(null)

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

  /* ── Image src helper ── */
  const imgSrc = p => {
    if (!p.image) return null
    if (p.image.startsWith('http')) return p.image
    return `${API_BASE}${p.image}`
  }

  /* ── Prep time display — handles "5", "5 min", "5 mins" from backend ── */
  const formatPrepTime = val => {
    if (!val && val !== 0) return null
    const str = String(val).trim()
    // Strip any existing "min" / "mins" suffix so we never double-render
    const num = str.replace(/\s*mins?\s*$/i, '').trim()
    return `${num} min`
  }

  /* ── Categories & filtered list ── */
  const categories = useMemo(
    () => ['all', ...new Set(products.map(p => p.category).filter(Boolean))],
    [products]
  )

  const visible = useMemo(() => {
    let list = [...products]
    if (selectedCat !== 'all') list = list.filter(p => p.category === selectedCat)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
      )
    }
    return list
  }, [products, selectedCat, search])

  const inStockCount  = products.filter(p => p.inStock).length
  const outStockCount = products.filter(p => !p.inStock).length

  /* ────────────────────── LOADING ────────────────────── */
  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-container">
          <div className="admin-loading">🔥 Loading the smokehouse menu…</div>
        </div>
      </div>
    )
  }

  /* ────────────────────── RENDER ────────────────────── */
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
          <div className="mnu-header-actions">
            <button className="btn-secondary" onClick={fetchProducts}>↻ Refresh</button>
            <button className="btn-primary" onClick={() => navigate('/admin/products')}>
              + Add Item
            </button>
          </div>
        </div>

        {notice && <div className="admin-notice">{notice}</div>}
        {error  && <div className="error-message">⚠ {error}</div>}

        {/* ── Stats row ── */}
        <div className="stats-grid mnu-stats">
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
              {cat === 'all'
                ? ` (${products.length})`
                : ` (${products.filter(p => p.category === cat).length})`
              }
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
            className="mnu-search-input"
          />
          {search && (
            <button className="btn-secondary" onClick={() => setSearch('')}>✕ Clear</button>
          )}
          <span className="mnu-result-count">
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
                    <th className="mnu-col-img">Image</th>
                    <th className="mnu-col-name">Name</th>
                    <th className="mnu-col-cat">Category</th>
                    <th className="mnu-col-price">Price</th>
                    <th className="mnu-col-prep">Prep Time</th>
                    <th className="mnu-col-stock">Stock</th>
                    <th className="mnu-col-action">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(p => (
                    <tr key={p._id} style={{ opacity: updating === p._id ? 0.6 : 1 }}>

                      {/* Image */}
                      <td className="mnu-col-img">
                        {imgSrc(p) ? (
                          <img src={imgSrc(p)} alt={p.name} className="product-thumb" />
                        ) : (
                          <div className="mnu-img-placeholder">🍖</div>
                        )}
                      </td>

                      {/* Name */}
                      <td className="mnu-col-name">
                        <strong>{p.name}</strong>
                      </td>

                      {/* Category */}
                      <td className="mnu-col-cat">
                        <span className="mnu-cat-badge">{p.category}</span>
                      </td>

                      {/* Price */}
                      <td className="mnu-col-price">
                        <strong>{formatPHP(p.price)}</strong>
                      </td>

                      {/* Prep time */}
                      <td className="mnu-col-prep">
                        {formatPrepTime(p.prepTime)
                          ? <span className="mnu-prep-value">{formatPrepTime(p.prepTime)}</span>
                          : <span className="mnu-prep-empty">—</span>
                        }
                      </td>

                      {/* Stock badge */}
                      <td className="mnu-col-stock">
                        <span className={`role-badge ${p.inStock ? 'in-stock' : 'out-stock'}`}>
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="mnu-col-action">
                        <div className="mnu-action-btns">
                          <button
                            className={p.inStock ? 'btn-delete' : 'btn-view'}
                            onClick={() => handleToggleStock(p)}
                            disabled={updating === p._id}
                          >
                            {p.inStock ? 'Mark Out' : 'Mark In'}
                          </button>
                          <button
                            className="btn-secondary mnu-edit-btn"
                            onClick={() => navigate(`/admin/products?edit=${p._id}`)}
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