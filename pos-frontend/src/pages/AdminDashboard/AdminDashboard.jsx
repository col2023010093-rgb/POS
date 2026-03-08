import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
import './AdminDashboard.css'

const STATUS_OPTIONS = ['pending', 'preparing', 'ready', 'completed', 'cancelled']

const AdminDashboard = () => {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const [stats,   setStats]   = useState({})
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [viewOrder,   setViewOrder]   = useState(null)
  const [updating,    setUpdating]    = useState(null)
  const [notice,      setNotice]      = useState('')

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

  const showNotice = msg => { setNotice(msg); setTimeout(() => setNotice(''), 3000) }

  const handleStatusUpdate = async (orderId, status) => {
    setUpdating(orderId)
    try {
      await api.updateOrderStatus(orderId, status)
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o))
      if (viewOrder?._id === orderId) setViewOrder(v => ({ ...v, status }))
      showNotice(`✅ Order status updated to "${status}"`)
    } catch (err) {
      setError(err.message || 'Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const formatPHP = v =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(v || 0))

  const getOrderLabel = order =>
    order.orderNumber
      ? `#${order.orderNumber}`
      : `#ORD-${order._id.slice(-6).toUpperCase()}`

  const getCustomerName = order => {
    const c = order.customerId
    if (!c) return '—'
    const name = `${c.firstName || ''} ${c.lastName || ''}`.trim()
    return name || c.email || '—'
  }

  /* ── derive today's orders from the orders array ── */
  const todayStr     = new Date().toDateString()
  const todayOrders  = orders.filter(o => new Date(o.createdAt).toDateString() === todayStr)
  const todayRevenue = todayOrders
    .filter(o => o.status === 'completed')
    .reduce((s, o) => s + Number(o.totalAmount || 0), 0)

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8)

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-container">
          <div className="admin-loading">🔥 Loading the smokehouse dashboard…</div>
        </div>
      </div>
    )
  }

{/* ── Inline SVG icon components — clean, stroke-based, no emoji ── */}
const IconBox       = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
const IconRevenue   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
const IconCalendar  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IconTodayRev  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/><path d="M19 8l2 2-2 2"/></svg>
const IconMenu      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2h18v4H3zM3 10h18v4H3zM3 18h18v4H3z" opacity="0"/><rect x="3" y="3" width="18" height="4" rx="1"/><rect x="3" y="10" width="12" height="4" rx="1"/><rect x="3" y="17" width="15" height="4" rx="1"/></svg>
const IconUsers     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconClock     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  
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

        {error  && <div className="error-message">⚠ {error}</div>}
        {notice && <div className="admin-notice">{notice}</div>}

        {/* ── Stats Grid ── */}
        <div className="stats-grid">
  <div className="stat-card">
    <span className="stat-icon"><IconBox /></span>
    <h3>Total Orders</h3>
    <p className="stat-number">{stats.totalOrders || orders.length || 0}</p>
  </div>
  <div className="stat-card">
    <span className="stat-icon"><IconRevenue /></span>
    <h3>Total Revenue</h3>
    <p className="stat-number">{formatPHP(stats.totalRevenue || 0)}</p>
  </div>
  <div className="stat-card success">
    <span className="stat-icon"><IconCalendar /></span>
    <h3>Today's Orders</h3>
    <p className="stat-number">{todayOrders.length}</p>
  </div>
  <div className="stat-card success">
    <span className="stat-icon"><IconTodayRev /></span>
    <h3>Today's Revenue</h3>
    <p className="stat-number">{formatPHP(todayRevenue)}</p>
  </div>
  <div className="stat-card">
    <span className="stat-icon"><IconMenu /></span>
    <h3>Menu Items</h3>
    <p className="stat-number">{stats.totalProducts || 0}</p>
  </div>
  <div className="stat-card">
    <span className="stat-icon"><IconUsers /></span>
    <h3>Customers</h3>
    <p className="stat-number">{stats.totalCustomers || stats.totalUsers || 0}</p>
  </div>
  <div className="stat-card alert">
    <span className="stat-icon"><IconClock /></span>
    <h3>Pending Orders</h3>
    <p className="stat-number">{stats.pendingOrders || 0}</p>
  </div>
</div>

        {/* ── Recent Orders ── identical layout to /admin/orders ── */}
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order._id} style={{ opacity: updating === order._id ? 0.6 : 1 }}>

                      <td className="ord-col-id">
                        <strong>{getOrderLabel(order)}</strong>
                      </td>

                      <td className="ord-col-customer">
                        <div className="ord-customer-name">{getCustomerName(order)}</div>
                        {order.customerId?.email && (
                          <div className="ord-customer-email">{order.customerId.email}</div>
                        )}
                      </td>

                      <td className="ord-col-items">
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </td>

                      <td className="ord-col-total">
                        <strong>{formatPHP(order.totalAmount)}</strong>
                      </td>

                      <td className="ord-col-status">
                        <select
                          value={order.status}
                          onChange={e => handleStatusUpdate(order._id, e.target.value)}
                          className={`status-select ${order.status}`}
                          disabled={updating === order._id}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>

                      <td className="ord-col-date">
                        {new Date(order.createdAt).toLocaleDateString('en-PH', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>

                      <td className="ord-col-actions">
                        <button className="btn-view" onClick={() => setViewOrder(order)}>
                          View
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ══════════════════════════════════════
          ORDER DETAIL MODAL  (same as AdminOrders)
          ══════════════════════════════════════ */}
      {viewOrder && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setViewOrder(null)}>
          <div className="modal-card ord-modal">

            <div className="modal-header">
              <h3>Order {getOrderLabel(viewOrder)}</h3>
              <button className="modal-close" onClick={() => setViewOrder(null)}>×</button>
            </div>

            <div className="modal-body">

              {/* Status bar */}
              <div className="ord-modal-status-bar">
                <span className="ord-modal-status-label">Status:</span>
                <select
                  value={viewOrder.status}
                  onChange={e => handleStatusUpdate(viewOrder._id, e.target.value)}
                  className={`status-select ${viewOrder.status}`}
                  disabled={updating === viewOrder._id}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Customer */}
              <div className="ord-modal-section">
                <div className="ord-modal-section-label">Customer</div>
                <div className="ord-modal-customer-name">{getCustomerName(viewOrder)}</div>
                {viewOrder.customerId?.email && (
                  <div className="ord-modal-meta">{viewOrder.customerId.email}</div>
                )}
                {viewOrder.customerId?.phone && (
                  <div className="ord-modal-meta">{viewOrder.customerId.phone}</div>
                )}
              </div>

              {/* Items */}
              <div className="ord-modal-section">
                <div className="ord-modal-section-label">Order Items</div>

                {(!viewOrder.items || viewOrder.items.length === 0) ? (
                  <div className="ord-modal-empty">No items recorded for this order.</div>
                ) : (
                  <ul className="order-items-list">
                    {viewOrder.items.map((item, i) => {
                      const name  = item.productId?.name || item.name || 'Item'
                      const qty   = Number(item.quantity || 1)
                      const price = Number(item.price || item.productId?.price || 0)
                      return (
                        <li className="order-item" key={i}>
                          <span className="order-item-name">{name}</span>
                          <span className="order-item-qty">× {qty}</span>
                          <span className="order-item-price">{formatPHP(price * qty)}</span>
                        </li>
                      )
                    })}
                  </ul>
                )}

                <div className="ord-modal-total-row">
                  <span className="ord-modal-total-label">Total</span>
                  <span className="ord-modal-total-value">{formatPHP(viewOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Timestamp */}
              <div className="ord-modal-timestamp">
                Placed: {new Date(viewOrder.createdAt).toLocaleString('en-PH')}
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setViewOrder(null)}>Close</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard