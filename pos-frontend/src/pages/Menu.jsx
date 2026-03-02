import React, { useState, useEffect, useContext } from 'react'
import MenuItem from '../Components/Menu/Menuitem'
import MenuModal from '../Components/Menu/MenuModal'
import './Menu.css'
import { FaShoppingCart, FaSearch, FaTimes } from 'react-icons/fa'
import { api } from '../utils/api'
import { useMenuAnimation } from '../hooks/useMenuAnimation'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext' // ✅ replace CartContext import
import { getImageSrc } from '../utils/image'

const Menu = () => {
  const navigate = useNavigate()
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart() // ✅ use hook
  
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([{ id: 'all', name: 'All', icon: '🍽️' }])
  const [showCart, setShowCart] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
  
  const { isLoaded } = useMenuAnimation(100)

  useEffect(() => {
    const load = async () => {
      const response = await api.getProducts()
      const data = Array.isArray(response.data) ? response.data : []
      setItems(data)
      const cats = Array.from(new Set(data.map(p => p.category).filter(Boolean)))
      setCategories([{ id: 'all', name: 'All', icon: '🍽️' }, ...cats.map(c => ({ id: c, name: c, icon: '🍖' }))])
    }
    load()
  }, [])

  const filteredItems = Array.isArray(items) ? items.filter(item => {
    const byCategory = activeCategory === 'all' || item.category === activeCategory
    const bySearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    return byCategory && bySearch
  }) : []

  const openModal = (item) => {
    setSelectedItem(item)
    setShowModal(true)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setShowModal(false)
    setTimeout(() => setSelectedItem(null), 300)
    document.body.style.overflow = 'auto'
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className={`menu-page ${isLoaded ? 'loaded' : ''}`}>
      {/* Hero Banner */}
      <section className="menu-hero">
        <div className="menu-hero-overlay"></div>
        <div className="menu-hero-content">
          <h1 className="animate-title">Our Menu</h1>
          <p className="animate-subtitle">Authentic Texas BBQ, Slow-Smoked to Perfection</p>
        </div>
        <div className="hero-decoration">
          <span className="floating-icon">🔥</span>
          <span className="floating-icon">🍖</span>
          <span className="floating-icon">🥩</span>
        </div>
      </section>

      {/* Menu Content */}
      <div className="menu-container">
        {/* Search and Filter Bar */}
        <div className="menu-controls">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search our menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <FaTimes />
              </button>
            )}
          </div>
          <button className="cart-button" onClick={() => setShowCart(!showCart)}>
            <FaShoppingCart />
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </button>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          {categories.map((cat) => (
            <button 
              key={cat.id} 
              className={activeCategory === cat.id ? 'active' : ''}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="results-info">
          <p>Showing <span>{filteredItems.length}</span> items</p>
        </div>

        {/* Menu Grid */}
        <div className="menu-items-grid">
          {filteredItems.map((item, index) => (
            <MenuItem
              key={item._id}
              item={item}
              index={index}
              onAddToCart={(itm, qty) => addToCart(itm, qty)}
              onItemClick={openModal}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="no-results">
            <span className="no-results-icon">🔍</span>
            <h3>No items found</h3>
            <p>Try a different search term or category</p>
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      <MenuModal 
        item={selectedItem}
        isOpen={showModal}
        onClose={closeModal}
        onAddToCart={(itm, qty) => addToCart(itm, qty)}
      />

      {/* Cart Sidebar */}
      <div className={`cart-sidebar ${showCart ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Your Order</h2>
          <button className="close-cart" onClick={() => setShowCart(false)}>
            <FaTimes />
          </button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <span>🛒</span>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item._id} className="cart-item">
                <img
                  src={getImageSrc(item.image)}
                  alt={item.name}
                  style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }}
                />
                <div className="cart-item-details">
                  <h4>{item.name}</h4>
                  <p>₱{item.price.toFixed(2)}</p>
                </div>
                <div className="cart-item-quantity">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>₱{totalPrice.toFixed(2)}</span>
            </div>
            <button 
              className="checkout-btn"
              onClick={() => {
                setShowCart(false)
                navigate('/checkout')
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      {/* Cart Overlay */}
      {showCart && <div className="cart-overlay" onClick={() => setShowCart(false)}></div>}
    </div>
  )
}

export default Menu