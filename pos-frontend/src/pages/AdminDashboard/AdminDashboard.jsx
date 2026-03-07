import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const [stats,   setStats]   = useState({})
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!user?.role || user?.role !== 'admin') { navigate('/'); return }
    fetchData()
  }, [user, navigate])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, ordersRes] = await Promise.allSettled([
        api.getStats(),
        api.getAllOrders(),
      ])
      if (statsRes.status  === 'fulfilled') setStats(statsRes.value.data || {})
      if (ordersRes.status === 'fulfilled') {
        const d = ordersRes.value.data
        setOrders(Array.isArray(d) ? d : (d?.orders || []))
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const formatPHP = v =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(v || 0))

  /* ── derive today's orders from the orders array ── */
  const todayStr = new Date().toDateString()
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === todayStr)
  const todayRevenue = todayOrders
    .filter(o => o.status === 'completed')
    .reduce((s, o) => s + Number(o.totalAmount || 0), 0)

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8)

  const statusColor = {
    pending:   '#b85c00', preparing: '#1a6fa8', ready: '#1d7a4a',
    completed: '#5b2d8e', cancelled: '#b01c1c',
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-container">
          <div className="admin-loading">🔥 Loading the smokehouse dashboard…</div>
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
            <h1>Smokehouse Command</h1>
            <p className="dashboard-subtitle">
              Welcome back, {user?.firstName} — here's what's smokin' today
            </p>
          </div>
          <button className="btn-secondary" onClick={fetchData}>↻ Refresh</button>
        </div>

        {error && <div className="error-message">⚠ {error}</div>}

        {/* ── Stats Grid ── */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <h3>Total Orders</h3>
            <p className="stat-number">{stats.totalOrders || orders.length || 0}</p>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <h3>Total Revenue</h3>
            <p className="stat-number">{formatPHP(stats.totalRevenue || 0)}</p>
          </div>
          <div className="stat-card success">
            <span className="stat-icon">📅</span>
            <h3>Today's Orders</h3>
            <p className="stat-number">{todayOrders.length}</p>
          </div>
          <div className="stat-card success">
            <span className="stat-icon">🤑</span>
            <h3>Today's Revenue</h3>
            <p className="stat-number">{formatPHP(todayRevenue)}</p>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🍖</span>
            <h3>Menu Items</h3>
            <p className="stat-number">{stats.totalProducts || 0}</p>
          </div>
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <h3>Customers</h3>
            <p className="stat-number">{stats.totalCustomers || stats.totalUsers || 0}</p>
          </div>
          <div className="stat-card alert">
            <span className="stat-icon">⏳</span>
            <h3>Pending Orders</h3>
            <p className="stat-number">{stats.pendingOrders || 0}</p>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="quick-actions">
          <button className="btn-primary"  onClick={() => navigate('/admin/orders')}>
            📋 Manage Orders
          </button>
          <button className="btn-primary"  onClick={() => navigate('/admin/reservations')}>
            📅 Reservations
          </button>
          <button className="btn-secondary" onClick={() => navigate('/admin/products')}>
            🍖 Menu Items
          </button>
          <button className="btn-secondary" onClick={() => navigate('/admin/users')}>
            👥 Users
          </button>
          <button className="btn-secondary" onClick={() => navigate('/admin/reports')}>
            📊 Reports
          </button>
        </div>

        {/* ── Recent Orders ── */}
        <div className="admin-table-section">
          <div className="section-header-row">
            <h2>Recent Orders</h2>
            <button className="btn-secondary" onClick={() => navigate('/admin/orders')}>
              View All →
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🪵</div>
              <p>No orders yet — the fire's ready when they are.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order._id}>
                      <td><strong>#{order.orderNumber || order._id.slice(-6).toUpperCase()}</strong></td>
                      <td>{order.customerId?.firstName} {order.customerId?.lastName}</td>
                      <td>{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</td>
                      <td><strong>{formatPHP(order.totalAmount)}</strong></td>
                      <td>
                        <span className={`badge badge-${order.status}`}>{order.status}</span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
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

export default AdminDashboard