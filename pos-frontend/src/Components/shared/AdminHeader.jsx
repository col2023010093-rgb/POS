import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FaUser, FaChevronDown, FaBars, FaTimes, FaBell } from 'react-icons/fa'
import { io } from 'socket.io-client'
import logo from '../../assets/logo.png'
import './AdminHeader.css'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'

const AdminHeader = () => {
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

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/orders', label: 'Orders' },
    { path: '/admin/menu', label: 'Menu' },
    { path: '/admin/reservations', label: 'Reservations' },
    { path: '/admin/products', label: 'Products' },
    { path: '/admin/reports', label: 'Reports' },
    { path: '/admin/users', label: 'Users' }
  ]

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Real-time Socket.io connection for notifications
  useEffect(() => {
    if (!user || !token) return

    const userId = user._id || user.id

    // Load notifications from API
    const loadNotifications = async () => {
      try {
        const response = await api.get('/api/notifications', {
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

    // Socket.io connection
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true
    })

    socketRef.current.on('connect', () => {
      console.log('✅ Admin Socket connected')
      socketRef.current.emit('register', userId)
    })

    socketRef.current.on('notification', (newNotification) => {
      console.log('🔔 New admin notification:', newNotification)
      setNotifications(prev => [newNotification, ...prev])
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [user, token])

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = async (id) => {
    try {
      await fetch(`http://localhost:4000/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleLogout = (e) => {
    e.stopPropagation()
    logout()
    setIsProfileOpen(false)
    navigate('/')
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header className={`admin-header ${isLoaded ? 'loaded' : ''}`}>
        {/* LEFT - Logo & Title */}
        <div className="admin-header-left">
          <Link to="/admin/dashboard" className="admin-logo-link">
            <img src={logo} alt="Logo" className="admin-header-logo" />
            <div className="admin-header-branding">
              <span className="admin-brand-main">Texas Joe's</span>
              <span className="admin-brand-sub">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* CENTER - Navigation */}
        <nav className={`admin-header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {adminNavItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-btn ${location.pathname === item.path ? 'active' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={closeMobileMenu}
              title={item.label}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT - User & Actions */}
        <div className="admin-header-right">
          {/* Notifications */}
          <div className="admin-notif-wrapper" ref={notifRef}>
            <button
              className="admin-notif-btn"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              aria-label="Notifications"
            >
              <FaBell />
              {unreadCount > 0 && (
                <span className="admin-notif-badge">{unreadCount}</span>
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

          {/* Profile Dropdown */}
          <div
            className="admin-user-info"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            ref={profileRef}
          >
            <div className="admin-user-avatar">
              <FaUser />
            </div>
            <div className="admin-user-text">
              <h3>{user?.firstName || 'Admin'}</h3>
              <p>Administrator</p>
            </div>
            <FaChevronDown className={`admin-dropdown-arrow ${isProfileOpen ? 'open' : ''}`} />

            {isProfileOpen && (
              <div className="admin-profile-dropdown">
                <button className="admin-dropdown-item">My Settings</button>
                <button className="admin-dropdown-item">Account</button>
                <button className="admin-dropdown-item danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="admin-mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="admin-mobile-overlay" onClick={closeMobileMenu}></div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="admin-header-spacer"></div>
    </>
  )
}

export default AdminHeader