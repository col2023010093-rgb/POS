import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
// AdminProducts.css removed — AdminMenu.css is now fully self-contained
import './AdminDashboard.css'
import './AdminMenu.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const AdminMenu = () => {
  const navigate      = useNavigate()
  const { user }      = useAuth()
  const [products,    setProducts]  = useState([])
  const [loading,     setLoading]   = useState(true)
  const [error,       setError]     = useState(null)
  const [notice,      setNotice]    = useState('')
  const [selectedCat, setSelectedCat] = useState('all')
  const [search,      setSearch]    = useState('')
  const [updating,    setUpdating]  = useState(null)

  /* ────────────────── GUARDS & DATA FETCH ────────────────── */
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

  const showNotice = msg => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 3000)
  }

  /* ────────────────── STOCK TOGGLE ────────────────── */
  const handleToggleStock = async (product) => {
    setUpdating(product._id)
    try {
      await api.updateProduct(product._id, { inStock: !product.inStock })
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
      <div className="mnu-page">
        <div className="mnu-container">
          <div className="mnu-loading">
            <div className="mnu-loading-spinner" />
            🔥 Loading the smokehouse menu…
          </div>
        </div>
      </div>
    )
  }

  /* ────────────────── RENDER ────────────────── */
  return (
    <div className="mnu-page">
      <div className="mnu-container">

        {/* ══════════════════════════════════════════════
            PAGE HEADER
        ════════════════════════════════════════════════ */}
        <header className="mnu-header">
          <div className="mnu-header-title-group">
            {/* Eyebrow label */}
            <div className="mnu-header-eyebrow">
              <span className="mnu-header-eyebrow-icon">🤠</span>
              Texas Joe's  ·  Admin Panel
            </div>
            <h1>Menu Management</h1>
            <p className="mnu-header-subtitle">
              {products.length} items on the menu —&nbsp;
              {inStockCount} in stock,&nbsp;{outStockCount} out
            </p>
          </div>

          {/* Action buttons */}
          <div className="mnu-header-actions">
            <button
              className="mnu-btn mnu-btn-secondary"
              onClick={fetchProducts}
              title="Refresh menu data"
            >
              ↻ Refresh
            </button>
            <button
              className="mnu-btn mnu-btn-primary"
              onClick={() => navigate('/admin/products')}
              title="Add a new menu item"
            >
              + Add Item
            </button>
          </div>
        </header>

        {/* ── Notice / Error banners ── */}
        {notice && (
          <div className="mnu-notice" role="status" aria-live="polite">
            {notice}
          </div>
        )}
        {error && (
          <div className="mnu-error" role="alert">
            ⚠ {error}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STAT CARDS
        ════════════════════════════════════════════════ */}
        <div className="mnu-stats-grid" aria-label="Menu statistics">
          <div className="mnu-stat-card">
            <span className="mnu-stat-icon">🍖</span>
            <div className="mnu-stat-label">Total Items</div>
            <div className="mnu-stat-value">{products.length}</div>
          </div>
          <div className="mnu-stat-card mnu-stat-success">
            <span className="mnu-stat-icon">✅</span>
            <div className="mnu-stat-label">In Stock</div>
            <div className="mnu-stat-value">{inStockCount}</div>
          </div>
          <div className="mnu-stat-card mnu-stat-alert">
            <span className="mnu-stat-icon">🚫</span>
            <div className="mnu-stat-label">Out of Stock</div>
            <div className="mnu-stat-value">{outStockCount}</div>
          </div>
          <div className="mnu-stat-card">
            <span className="mnu-stat-icon">🏷️</span>
            <div className="mnu-stat-label">Categories</div>
            <div className="mnu-stat-value">{categories.length - 1}</div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            CATEGORY TABS
        ════════════════════════════════════════════════ */}
        <nav className="mnu-tabs-bar" aria-label="Filter by category">
          {categories.map(cat => (
            <button
              key={cat}
              className={`mnu-tab-btn${selectedCat === cat ? ' active' : ''}`}
              onClick={() => setSelectedCat(cat)}
              aria-pressed={selectedCat === cat}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
              <span className="mnu-tab-count">
                {cat === 'all'
                  ? products.length
                  : products.filter(p => p.category === cat).length
                }
              </span>
            </button>
          ))}
        </nav>

        {/* ══════════════════════════════════════════════
            SEARCH / FILTER BAR
        ════════════════════════════════════════════════ */}
        <div className="mnu-filter-bar" role="search">
          <div className="mnu-search-wrap">
            {/* SVG icon — inline so no external request */}
            <svg
              className="mnu-search-icon"
              viewBox="0 0 24 24"
              width="15" height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              id="mnu-search"
              type="text"
              placeholder="Search menu items…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mnu-search-input"
              aria-label="Search menu items"
            />
          </div>

          {search && (
            <button
              className="mnu-btn mnu-btn-secondary mnu-btn-sm"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              ✕ Clear
            </button>
          )}

          <span className="mnu-result-count" aria-live="polite">
            {visible.length} item{visible.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ══════════════════════════════════════════════
            MENU ITEMS TABLE
        ════════════════════════════════════════════════ */}
        <section className="mnu-table-section" aria-label="Menu items table">

          {/* Section heading */}
          <div className="mnu-section-heading">
            <h2 className="mnu-section-title">Menu Items</h2>
          </div>

          {/* Empty state */}
          {visible.length === 0 ? (
            <div className="mnu-empty">
              <div className="mnu-empty-icon">🍽️</div>
              <p className="mnu-empty-text">No items found for this category.</p>
            </div>
          ) : (
            /* Table wrapper — enables horizontal scroll on small screens */
            <div className="mnu-table-wrapper">
              <table className="mnu-table" aria-label="Menu items">

                {/* ── THEAD ── */}
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

                {/* ── TBODY ── */}
                <tbody>
                  {visible.map(p => (
                    <tr
                      key={p._id}
                      className={updating === p._id ? 'mnu-row-updating' : ''}
                    >

                      {/* — Image — */}
                      <td className="mnu-col-img" data-label="Image">
                        {imgSrc(p) ? (
                          <img
                            src={imgSrc(p)}
                            alt={p.name}
                            className="mnu-thumb"
                            loading="lazy"
                          />
                        ) : (
                          <div className="mnu-img-placeholder" aria-hidden="true">🍖</div>
                        )}
                      </td>

                      {/* — Name — */}
                      <td className="mnu-col-name" data-label="Name">
                        <span className="mnu-item-name">{p.name}</span>
                      </td>

                      {/* — Category — */}
                      <td className="mnu-col-cat" data-label="Category">
                        <span className="mnu-cat-badge">{p.category}</span>
                      </td>

                      {/* — Price — */}
                      <td className="mnu-col-price" data-label="Price">
                        <span className="mnu-price">{formatPHP(p.price)}</span>
                      </td>

                      {/* — Prep Time — */}
                      <td className="mnu-col-prep" data-label="Prep Time">
                        {formatPrepTime(p.prepTime)
                          ? <span className="mnu-prep-value">{formatPrepTime(p.prepTime)}</span>
                          : <span className="mnu-prep-empty">—</span>
                        }
                      </td>

                      {/* — Stock Status — */}
                      <td className="mnu-col-stock" data-label="Stock">
                        <span className={`mnu-stock-badge ${p.inStock ? 'in-stock' : 'out-stock'}`}>
                          <span className="mnu-stock-dot" aria-hidden="true" />
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>

                      {/* — Actions — */}
                      <td className="mnu-col-action" data-label="Actions">
                        <div className="mnu-action-btns">
                          {/* Toggle availability */}
                          <button
                            className={`mnu-btn mnu-btn-sm ${p.inStock ? 'mnu-btn-danger' : 'mnu-btn-success'}`}
                            onClick={() => handleToggleStock(p)}
                            disabled={updating === p._id}
                            aria-label={`Mark ${p.name} as ${p.inStock ? 'out of stock' : 'in stock'}`}
                          >
                            {p.inStock ? 'Mark Out' : 'Mark In'}
                          </button>

                          {/* Edit */}
                          <button
                            className="mnu-btn mnu-btn-secondary mnu-btn-sm"
                            onClick={() => navigate(`/admin/products?edit=${p._id}`)}
                            aria-label={`Edit ${p.name}`}
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
        </section>

      </div>{/* /mnu-container */}
    </div>/* /mnu-page */
  )
}

export default AdminMenu