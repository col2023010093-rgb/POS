import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
// AdminProducts.css removed — AdminMenu.css is now fully self-contained
import './AdminDashboard.css'
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

  /* ────────────────── GUARDS & DATA FETCH ────────────────── */
  useEffect(() => {
    if (!user?.role || user?.role !== 'admin') { navigate('/'); return }
    fetchProducts()
  }, [user, navigate])

 const fetchProducts = async () => {
    setLoading(true); setError(null)
    try {
      const res  = await api.get('/api/admin/products')
      const data = Array.isArray(res.data) ? res.data : (res.data?.products || [])
      setProducts(data)
    } catch (err) {
      setError(err.message || 'Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  const showNotice = msg => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 3000)
  }

  /* ────────────────── STOCK TOGGLE ────────────────── */
  const handleToggleStock = async (product) => {
    setUpdating(product._id)
    try {
      await api.patch(`/api/admin/products/${product._id}`, { inStock: !product.inStock })
      setProducts(prev =>
        prev.map(p => p._id === product._id ? { ...p, inStock: !p.inStock } : p)
      )
      showNotice(`✅ ${product.name} marked as ${!product.inStock ? 'In Stock' : 'Out of Stock'}`)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update product')
    } finally {
      setUpdating(null)
    }
  }

  /* ────────────────── HELPERS ────────────────── */
  const formatPHP = v =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(v || 0))

  const imgSrc = p => {
    if (!p.image) return null
    if (p.image.startsWith('http')) return p.image
    return `${API_BASE}${p.image}`
  }

  const formatPrepTime = val => {
    if (!val && val !== 0) return null
    const str = String(val).trim()
    const num = str.replace(/\s*mins?\s*$/i, '').trim()
    return `${num} min`
  }

  /* ────────────────── DERIVED STATE ────────────────── */
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

  const inStockCount  = products.filter(p =>  p.inStock).length
  const outStockCount = products.filter(p => !p.inStock).length

  /* ────────────────── LOADING ────────────────── */
  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-container">
          <div className="admin-loading">🔥 Loading the smokehouse menu…</div>
        </div>
      </div>
    )
  }

  /* ────────────────── RENDER ────────────────── */
  return (
    <div className="admin-dashboard">
      <div className="admin-container">

        {/* ══════════════════════════════════════════════
            PAGE HEADER
        ════════════════════════════════════════════════ */}
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

        {/* ── Notices ── */}
        {notice && <div className="admin-notice">{notice}</div>}
        {error  && <div className="error-message">⚠ {error}</div>}

        {/* ══════════════════════════════════════════════
            STAT CARDS  (ord-stat-card markup = AdminOrders)
        ════════════════════════════════════════════════ */}
        <div className="mnu-stats">
          <div className="ord-stat-card stat-total">
            <span className="ord-stat-label">Total Items</span>
            <span className="ord-stat-value">{products.length}</span>
            <span className="ord-stat-sub">on the menu</span>
          </div>
          <div className="ord-stat-card stat-instock">
            <span className="ord-stat-label">In Stock</span>
            <span className="ord-stat-value">{inStockCount}</span>
            <span className="ord-stat-sub">available now</span>
          </div>
          <div className="ord-stat-card stat-outstock">
            <span className="ord-stat-label">Out of Stock</span>
            <span className="ord-stat-value">{outStockCount}</span>
            <span className="ord-stat-sub">unavailable</span>
          </div>
          <div className="ord-stat-card stat-categories">
            <span className="ord-stat-label">Categories</span>
            <span className="ord-stat-value">{categories.length - 1}</span>
            <span className="ord-stat-sub">on the menu</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            CATEGORY TABS
        ════════════════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════════════
            SEARCH / FILTER BAR
        ════════════════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════════════
            MENU ITEMS TABLE
        ════════════════════════════════════════════════ */}
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
                    <th className="mnu-col-img"    scope="col">Img</th>
                    <th className="mnu-col-name"   scope="col">Name</th>
                    <th className="mnu-col-cat"    scope="col">Category</th>
                    <th className="mnu-col-price"  scope="col">Price</th>
                    <th className="mnu-col-prep"   scope="col">Prep Time</th>
                    <th className="mnu-col-stock"  scope="col">Stock</th>
                    <th className="mnu-col-action" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(p => (
                    <tr key={p._id} style={{ opacity: updating === p._id ? 0.6 : 1 }}>

                      {/* — Image — */}
                      <td className="mnu-col-img">
                        {imgSrc(p) ? (
                          <img src={imgSrc(p)} alt={p.name} className="product-thumb" loading="lazy" />
                        ) : (
                          <div className="mnu-img-placeholder">🍖</div>
                        )}
                      </td>

                      {/* — Name — */}
                      <td className="mnu-col-name">
                        <strong>{p.name}</strong>
                      </td>

                      {/* — Category — */}
                      <td className="mnu-col-cat">
                        <span className="mnu-cat-badge">{p.category}</span>
                      </td>

                      {/* — Price — */}
                      <td className="mnu-col-price">
                        <strong>{formatPHP(p.price)}</strong>
                      </td>

                      {/* — Prep Time — */}
                      <td className="mnu-col-prep">
                        {formatPrepTime(p.prepTime)
                          ? <span className="mnu-prep-value">{formatPrepTime(p.prepTime)}</span>
                          : <span className="mnu-prep-empty">—</span>
                        }
                      </td>

                      {/* — Stock Badge — */}
                      <td className="mnu-col-stock">
                        <span className={`role-badge ${p.inStock ? 'in-stock' : 'out-stock'}`}>
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>

                      {/* — Actions — */}
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
                            className="mnu-edit-btn"
                            onClick={() => navigate(`/admin/products?edit=${p._id}`)}
                          >
                            ✎ Edit
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