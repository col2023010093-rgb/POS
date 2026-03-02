import React, { useState, useEffect, useContext, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { FaUser, FaChevronDown, FaBars, FaTimes, FaBell } from "react-icons/fa"
import { io } from "socket.io-client"
import logo from "../../assets/logo.png"
import "./HeaderGuest.css"
import { useAuth } from "../../context/AuthContext" // ✅ Change this line
import { api } from "../../utils/api"

const HeaderGuest = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const location = useLocation()
  const navigate = useNavigate()
  const { user, token, logout } = useAuth() // ✅ Use the hook instead
  const profileRef = useRef(null)
  const notifRef = useRef(null)
  const socketRef = useRef(null)

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
    { path: '/reservations', label: 'Reservations' }
  ]

  const adminNavItems = [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu' },
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/orders', label: 'Orders' },
    { path: '/reservations', label: 'Reservation' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/products', label: 'Products' }
  ]

  const displayedNavItems = user?.role === 'admin' ? adminNavItems : navItems

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Real-time Socket.io connection
  useEffect(() => {
    if (!user || !token) return

    const userId = user._id || user.id

    const loadNotifications = async () => {
      try {
        const response = await api.get('/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (Array.isArray(response.data)) {
          setNotifications(response.data)
        }
      } catch (error) {
        console.warn('Notifications unavailable:', error.message)
        setNotifications([])
      }
    }
    loadNotifications()

    socketRef.current = io('http://localhost:4000', {
      auth: { token }
    })

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected')
      socketRef.current.emit('register', userId)
    })

    socketRef.current.on('notification', (newNotification) => {
      console.log('🔔 New notification:', newNotification)
      setNotifications(prev => [newNotification, ...prev])
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [user, token])

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = async (id) => {
    await fetch(`http://localhost:4000/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    })
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
  }

  const handleUserClick = (e) => {
    e.stopPropagation(); // Prevent bubbling
    if (!user) {
      navigate('/login')
      return
    }
    setIsProfileOpen((prev) => !prev)
  }

  const handleLogout = (e) => {
    e.stopPropagation(); // Prevent bubbling
    logout()
    setIsProfileOpen(false)
    navigate('/')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header className={`header ${isLoaded ? 'loaded' : ''}`}>
        {/* LEFT - Logo & Title */}
        <div className="header-left">
          <Link to="/" className="logo-link">
            <img src={logo} alt="Logo" className="header-logo" />
            <div className="header-title">
              <span className="line1">Texas Joe's</span>
              <span className="line2">House of Ribs</span>
            </div>
          </Link>
        </div>

        {/* CENTER - Navigation */}
        <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {displayedNavItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-btn ${location.pathname === item.path ? 'active' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={closeMobileMenu}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT - User */}
        <div className="header-right">
          <div className="user-info" onClick={handleUserClick} ref={profileRef}>
            <div className="user-avatar">
              <FaUser className="user-icon" />
            </div>
            <div className="user-text">
              <h1>{user ? `${user.name || user.firstName || 'User'}` : 'Guest'}</h1>
              <p>{user ? 'My Account' : 'Sign In'}</p>
            </div>
            <FaChevronDown className={`dropdown-arrow ${isProfileOpen ? 'open' : ''}`} />

            {user && isProfileOpen && (
              <div className="profile-dropdown">
                <button
                  className="dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsProfileOpen(false)
                    navigate('/profile')
                  }}
                >
                  My Profile
                </button>
                <button
                  className="dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsProfileOpen(false)
                    navigate('/orders')
                  }}
                >
                  My Orders
                </button>
                <button
                  className="dropdown-item danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLogout(e)
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {user && (
            <div className="notif-wrapper" ref={notifRef}>
              <button className="notif-btn" onClick={() => setIsNotifOpen(prev => !prev)}>
                <FaBell />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>

              {isNotifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-title">Notifications</div>
                  {notifications.length === 0 && <div className="notif-empty">No notifications</div>}
                  {notifications.map(n => (
                    <div
                      key={n._id}
                      className={`notif-item ${n.read ? '' : 'unread'}`}
                      onClick={() => markRead(n._id)}
                    >
                      <div className="notif-message">{n.message}</div>
                      <div className="notif-time">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-overlay" onClick={closeMobileMenu}></div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="header-spacer"></div>
    </>
  )
}

export default HeaderGuest
