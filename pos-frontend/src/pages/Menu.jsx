import React, { useState, useEffect, useCallback } from 'react'
import MenuItem from '../Components/Menu/Menuitem'
import MenuModal from '../Components/Menu/MenuModal'
import './Menu.css'
import { FaShoppingCart, FaSearch, FaTimes } from 'react-icons/fa'
import { api } from '../utils/api'
import { useMenuAnimation } from '../hooks/useMenuAnimation'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getImageSrc } from '../utils/image'

// ─── Category emoji map ──────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  'all':             '🍽️',
  'soups & starters':'🍲',
  'salads & wings':  '🥗',
  'spare ribs':      '🍖',
  'baby back ribs':  '🍖',
  'combo meals':     '🤠',
  'bbq platters':    '🥩',
  'sandwiches':      '🥪',
  'lighter meals':   '🌮',
  'steaks':          '🥩',
  'sides':           '🌽',
  'desserts':        '🍰',
  "kids' menu":      '🧒',
}

const getCategoryIcon = (cat) =>
  CATEGORY_ICONS[cat?.toLowerCase()] ?? '🍴'

// ─── Component ───────────────────────────────────────────────────────────────
const Menu = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, addToCart, updateQuantity } = useCart()

  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm]         = useState('')
  const [items, setItems]                   = useState([])
  const [categories, setCategories]         = useState([{ id: 'all', name: 'All', icon: '🍽️' }])
  const [showCart, setShowCart]             = useState(false)
  const [selectedItem, setSelectedItem]     = useState(null)
  const [showModal, setShowModal]           = useState(false)
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const { isLoaded } = useMenuAnimation(100)

  // ── Data fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get('/api/products')
        const data = Array.isArray(response.data) ? response.data : []
        setItems(data)
        const cats = Array.from(new Set(data.map(p => p.category).filter(Boolean)))
        setCategories([
          { id: 'all', name: 'All', icon: '🍽️' },
          ...cats.map(c => ({ id: c, name: c, icon: getCategoryIcon(c) }))
        ])
      } catch (err) {
        console.error('Failed to load products:', err)
        setError('Unable to load the menu. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Close cart / modal on Escape ────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showLoginPrompt) { setShowLoginPrompt(false); return }
        if (showCart)  setShowCart(false)
        if (showModal) closeModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showCart, showModal, showLoginPrompt])

  // ── Filtered items ──────────────────────────────────────────────────────────
  const filteredItems = items.filter(item => {
    const byCategory = activeCategory === 'all' || item.category === activeCategory
    const bySearch   = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return byCategory && bySearch
  })

  // ── Modal handlers ──────────────────────────────────────────────────────────
  const openModal = useCallback((item) => {
    setSelectedItem(item)
    setShowModal(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeModal = useCallback(() => {
    setShowModal(false)
    setTimeout(() => setSelectedItem(null), 300)
    document.body.style.overflow = 'auto'
  }, [])

  // ── Stock helpers ───────────────────────────────────────────────────────────
  const getStock = (item) => {
    const n = Number(item?.stock)
    return Number.isFinite(n) ? n : null
  }

  const isOutOfStock = (item) => {
    if (item.inStock === false) return true
    const stock = getStock(item)
    if (stock !== null && stock <= 0) return true
    return false
  }

  const getCartQty = (itemId) => {
    const found = cart.find(c => c._id === itemId)
    return found ? found.quantity : 0
  }

  const canAddToCart = (item, qtyToAdd = 1) => {
    if (isOutOfStock(item)) return false
    const stock = getStock(item)
    if (stock === null) return true
    return getCartQty(item._id) + qtyToAdd <= stock
  }

  const handleAddToCart = (item, qty = 1) => {
    if (!canAddToCart(item, qty)) {
      alert(isOutOfStock(item)
        ? '❌ This item is out of stock.'
        : '⚠️ Not enough stock available.')
      return
    }
    addToCart(item, qty)
  }

  // ── Checkout handler — requires login ───────────────────────────────────────
  const handleCheckout = () => {
    setShowCart(false)
    if (!user) {
      setShowLoginPrompt(true)
      return
    }
    navigate('/checkout')
  }

  // ── Cart totals ─────────────────────────────────────────────────────────────
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={`menu-page ${isLoaded ? 'loaded' : ''}`}>

      {/* ── Hero ── */}
      <section className="menu-hero" aria-label="Menu hero banner">
        <div className="menu-hero-overlay" aria-hidden="true" />
        <div className="menu-hero-content">
          <h1 className="animate-title">Our Menu</h1>
          <p className="animate-subtitle">Slow-Smoked Over Real Hickory Wood — Never Boiled</p>
        </div>
        <div className="hero-decoration" aria-hidden="true">
          <span className="floating-icon">🔥</span>
          <span className="floating-icon">🍖</span>
          <span className="floating-icon">🥩</span>
        </div>
      </section>

      {/* ── Main content ── */}
      <div className="menu-container">

        {/* Search + Cart */}
        <div className="menu-controls" role="search">
          <div className="search-bar">
            <FaSearch className="search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search the menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search menu items"
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <button
            className="cart-button"
            onClick={() => setShowCart(!showCart)}
            aria-label={`Open cart, ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
            aria-expanded={showCart}
          >
            <FaShoppingCart />
            {totalItems > 0 && (
              <span className="cart-count" aria-hidden="true">{totalItems}</span>
            )}
          </button>
        </div>

        {/* Category tabs */}
        <nav className="category-tabs" aria-label="Menu categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={activeCategory === cat.id ? 'active' : ''}
              onClick={() => setActiveCategory(cat.id)}
              aria-pressed={activeCategory === cat.id}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </nav>

        {/* Results count */}
        <div className="results-info" aria-live="polite" aria-atomic="true">
          <p>
            Showing <span>{filteredItems.length}</span>{' '}
            {filteredItems.length === 1 ? 'item' : 'items'}
            {activeCategory !== 'all' && ` in ${activeCategory}`}
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="no-results" role="status">
            <span className="no-results-icon">🔥</span>
            <h3>Firing up the smoker...</h3>
            <p>Loading the menu, partner</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="no-results" role="alert">
            <span className="no-results-icon">⚠️</span>
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Menu Grid */}
        {!loading && !error && (
          <div
            className="menu-items-grid"
            role="list"
            aria-label="Menu items"
          >
            {filteredItems.map((item, index) => (
              <MenuItem
                key={item._id}
                item={item}
                index={index}
                onAddToCart={(itm, qty) => handleAddToCart(itm, qty)}
                onItemClick={openModal}
                isOutOfStock={isOutOfStock(item)}
              />
            ))}

            {filteredItems.length === 0 && (
              <div className="no-results" role="status">
                <span className="no-results-icon">🔍</span>
                <h3>Nothing found, partner</h3>
                <p>Try a different search or category</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Item Detail Modal ── */}
      <MenuModal
        item={selectedItem}
        isOpen={showModal}
        onClose={closeModal}
        onAddToCart={(itm, qty) => handleAddToCart(itm, qty)}
        isOutOfStock={selectedItem ? isOutOfStock(selectedItem) : false}
      />

      {/* ── Cart Sidebar ── */}
      <aside
        className={`cart-sidebar ${showCart ? 'open' : ''}`}
        aria-label="Your cart"
        aria-hidden={!showCart}
      >
        <div className="cart-header">
          <h2>Your Order</h2>
          <button
            className="close-cart"
            onClick={() => setShowCart(false)}
            aria-label="Close cart"
          >
            <FaTimes />
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <span>🛒</span>
              <p>Your cart is empty, cowboy</p>
            </div>
          ) : (
            cart.map(item => {
              const stock = getStock(item)
              const atMax = stock !== null && item.quantity >= stock
              return (
                <div key={item._id} className="cart-item" role="listitem">
                  <img
                    src={getImageSrc(item.image)}
                    alt={item.name}
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p>₱{item.price.toFixed(2)}</p>
                  </div>
                  <div className="cart-item-quantity">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      −
                    </button>
                    <span aria-label={`${item.quantity} of ${item.name}`}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      disabled={atMax}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  {atMax && (
                    <span className="stock-warning" role="alert">⚠️ Max</span>
                  )}
                </div>
              )
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span>₱{totalPrice.toFixed(2)}</span>
            </div>
            <button
              className="checkout-btn"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>

      {/* Overlay */}
      {showCart && (
        <div
          className="cart-overlay"
          onClick={() => setShowCart(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Login prompt overlay ── */}
      {showLoginPrompt && (
        <div
          className="menu-login-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Sign in required"
          onClick={e => { if (e.target === e.currentTarget) setShowLoginPrompt(false) }}
        >
          <div className="menu-login-modal">
            <span className="menu-login-modal__icon">🔒</span>
            <h2 className="menu-login-modal__title">Sign In Required</h2>
            <p className="menu-login-modal__body">
              You need to be signed in to place an order.<br />
              Please sign in or create an account to continue.
            </p>
            <div className="menu-login-modal__actions">
              <button
                className="checkout-btn"
                style={{ width: 'auto', padding: '0.9rem 2rem' }}
                onClick={() => navigate('/login', { state: { from: '/menu' } })}
              >
                Sign In
              </button>
              <button
                className="menu-login-cancel-btn"
                onClick={() => setShowLoginPrompt(false)}
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Menu