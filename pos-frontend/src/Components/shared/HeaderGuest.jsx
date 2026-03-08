import React, { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { FaUser, FaChevronDown, FaBars, FaTimes, FaBell, FaSignInAlt, FaUserShield } from "react-icons/fa"
import { io } from "socket.io-client"
import logo from "../../assets/logo.png"
import "./HeaderGuest.css"
import { useAuth } from "../../context/AuthContext"
import { api } from "../../utils/api"

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const HeaderGuest = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const location = useLocation()
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const profileRef = useRef(null)
  const notifRef = useRef(null)
  const socketRef = useRef(null)

  const isAdmin = user?.role === 'admin'

  const navItems = [
    { path: '/',             label: 'Home'         },
    { path: '/menu',         label: 'Menu'         },
    { path: '/about',        label: 'About'        },
    { path: '/contact',      label: 'Contact'      },
    { path: '/reservations', label: 'Reservations' },
  ]

  // Admins browsing the public site still get public nav
  // Their main workspace is AdminHeader — keep this simple
  const displayedNavItems = navItems

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const onClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false)
      if (notifRef.current  && !notifRef.current.contains(e.target))  setIsNotifOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Reset dropdowns on logout
  useEffect(() => {
    if (!user) {
      setIsProfileOpen(false)
      setIsNotifOpen(false)
      setNotifications([])
    }
  }, [user])

  // Socket.io + notifications
  useEffect(() => {
    if (!user || !token) return
    const userId = user._id || user.id

    const loadNotifications = async () => {
      try {
        const response = await api.get('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (Array.isArray(response.data)) setNotifications(response.data)
      } catch (error) {
        console.warn('Notifications unavailable:', error.message)
        setNotifications([])
      }
    }
    loadNotifications()

    socketRef.current = io(BASE_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })
    socketRef.current.on('connect', () => {
      socketRef.current.emit('register', userId)
    })
    socketRef.current.on('notification', (n) => {
      setNotifications(prev => [n, ...prev])
    })

    return () => socketRef.current?.disconnect()
  }, [user, token])

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = async (id) => {
    try {
      await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const handleUserClick = (e) => {
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }
    // Admin: clicking the avatar goes straight to dashboard
    if (isAdmin) {
      navigate('/admin/dashboard')
      return
    }
    setIsProfileOpen(prev => !prev)
  }

  const handleLogout = (e) => {
    e.stopPropagation()
    logout()
    setIsProfileOpen(false)
    navigate('/')
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      <header className={`header ${isLoaded ? 'loaded' : ''}`}>

        {/* LEFT — Logo */}
        <div className="header-left">
          <Link to="/" className="logo-link">
            <img src={logo} alt="Logo" className="header-logo" />
            <div className="header-title">
              <span className="line1">Texas Joe's</span>
              <span className="line2">House of Ribs</span>
            </div>
          </Link>
        </div>

        {/* CENTER — Navigation */}
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

        {/* RIGHT — Notifications + User */}
        <div className="header-right">

          {/* Notifications — logged-in users only */}
          {user && (
            <div className="notif-wrapper" ref={notifRef}>
              <button
                className="notif-btn"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                aria-label="Notifications"
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount}</span>
                )}
              </button>

              {isNotifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-title">Notifications</div>
                  {notifications.length === 0
                    ? <div className="notif-empty">No notifications</div>
                    : notifications.map(n => (
                        <div
                          key={n._id}
                          className={`notif-item ${n.read ? '' : 'unread'}`}
                          onClick={() => markRead(n._id)}
                        >
                          <div className="notif-message">{n.message}</div>
                          <div className="notif-time">
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))
                  }
                </div>
              )}
            </div>
          )}

          {/* User profile / Sign In */}
          <div
            className={`user-info ${isAdmin ? 'user-info--admin' : ''}`}
            onClick={handleUserClick}
            ref={profileRef}
            title={isAdmin ? 'Go to Admin Dashboard' : undefined}
          >
            <div className="user-avatar">
              {!user   && <FaSignInAlt />}
              {user && !isAdmin && <FaUser />}
              {isAdmin && <FaUserShield />}
            </div>

            <div className="user-text">
              <h1>{user ? user.firstName : 'Sign In'}</h1>
              {/* ── KEY FIX: admins see "Administrator", others see "My Account" ── */}
              {user && <p>{isAdmin ? 'Administrator' : 'My Account'}</p>}
            </div>

            {/* Chevron + dropdown — regular users only; admins click straight to dashboard */}
            {user && !isAdmin && (
              <>
                <FaChevronDown className={`dropdown-arrow ${isProfileOpen ? 'open' : ''}`} />
                {isProfileOpen && (
                  <div className="profile-dropdown">
                    <button className="dropdown-item" onClick={() => navigate('/profile')}>
                      Profile
                    </button>
                    <button className="dropdown-item" onClick={() => navigate('/orders')}>
                      Orders
                    </button>
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Admin: separate small dropdown with dashboard link + logout */}
            {isAdmin && (
              <>
                <FaChevronDown className={`dropdown-arrow ${isProfileOpen ? 'open' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setIsProfileOpen(p => !p) }}
                />
                {isProfileOpen && (
                  <div className="profile-dropdown">
                    <button
                      className="dropdown-item"
                      onClick={(e) => { e.stopPropagation(); navigate('/admin/dashboard') }}
                    >
                      Admin Dashboard
                    </button>
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="mobile-overlay" onClick={closeMobileMenu} />
        )}
      </header>

      <div className="header-spacer" />
    </>
  )
}

export default HeaderGuest