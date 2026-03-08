import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
import './AdminDashboard.css'
import './AdminOrders.css'

const STATUS_OPTIONS = ['pending', 'preparing', 'ready', 'completed', 'cancelled']

const AdminOrders = () => {
  const navigate        = useNavigate()
  const { user }        = useAuth()
  const [orders,        setOrders]       = useState([])
  const [loading,       setLoading]      = useState(true)
  const [error,         setError]        = useState(null)
  const [notice,        setNotice]       = useState('')
  const [search,        setSearch]       = useState('')
  const [filterStatus,  setFilterStatus] = useState('')
  const [viewOrder,     setViewOrder]    = useState(null)
  const [updating,      setUpdating]     = useState(null)

  useEffect(() => {
    if (!user?.role || user?.role !== 'admin') { navigate('/'); return }
    fetchOrders()
  }, [user, navigate])

  const fetchOrders = async () => {
    setLoading(true); setError(null)
    try {
      const res  = await api.getAllOrders()
      const data = Array.isArray(res.data) ? res.data : (res.data?.orders || [])
      setOrders(data)
    } catch (err) {
      setError(err.message || 'Failed to load orders')
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
      setError(err.message || 'Failed to update order status')
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

  const resolveCustomer = order =>
    order.customerId || order.userId || order.user || order.customer || null

  const getCustomerName = order => {
    const c = resolveCustomer(order)
    if (!c) return order.customerName || order.guestName || '—'
    if (typeof c === 'string') return order.customerName || order.customerEmail || '—'
    const name = `${c.firstName || ''} ${c.lastName || ''}`.trim()
    return name || c.name || c.email || '—'
  }

  const getCustomerEmail = order => {
    const c = resolveCustomer(order)
    if (!c || typeof c === 'string') return order.customerEmail || null
    return c.email || null
  }

  /* ── filtered + searched list ── */
  const visible = useMemo(() => {
    let list = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (filterStatus) list = list.filter(o => o.status === filterStatus)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(o =>
        (o.orderNumber || '').toLowerCase().includes(q) ||
        (o._id || '').toLowerCase().includes(q) ||
        getCustomerName(o).toLowerCase().includes(q) ||
        (getCustomerEmail(o) || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [orders, filterStatus, search])

  /* ── status counts ── */
  const counts = useMemo(() => {
    const c = { all: orders.length }
    STATUS_OPTIONS.forEach(s => { c[s] = orders.filter(o => o.status === s).length })
    return c
  }, [orders])

  /* ── today's revenue ── */
  const todayRevenue = useMemo(() => {
    const today = new Date().toDateString()
    return orders
      .filter(o => new Date(o.createdAt).toDateString() === today)
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)
  }, [orders])

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-container">
          <div className="admin-loading">🔥 Loading orders…</div>
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
            <h1>Order Management</h1>
            <p className="dashboard-subtitle">{orders.length} total orders in the pit</p>
          </div>
          <button className="btn-secondary" onClick={fetchOrders}>↻ Refresh</button>
        </div>

        {notice && <div className="admin-notice">{notice}</div>}
        {error  && <div className="error-message">⚠ {error}</div>}

        {/* ── Stats Cards ── */}
        <div className="ord-stats-row">
          <div className="ord-stat-card stat-total">
            <span className="ord-stat-label">Total Orders</span>
            <span className="ord-stat-value">{counts.all}</span>
          </div>
          <div className="ord-stat-card stat-pending">
            <span className="ord-stat-label">Pending</span>
            <span className="ord-stat-value">{counts.pending || 0}</span>
          </div>
          <div className="ord-stat-card stat-completed">
            <span className="ord-stat-label">Completed</span>
            <span className="ord-stat-value">{counts.completed || 0}</span>
          </div>
          <div className="ord-stat-card stat-cancelled">
            <span className="ord-stat-label">Cancelled</span>
            <span className="ord-stat-value">{counts.cancelled || 0}</span>
          </div>
          <div className="ord-stat-card stat-revenue">
            <span className="ord-stat-label">Revenue Today</span>
            <span className="ord-stat-value" style={{ fontSize: '1.1rem' }}>{formatPHP(todayRevenue)}</span>
          </div>
        </div>

        {/* ── Status quick filter tabs ── */}
        <div className="admin-tabs">
          <button className={filterStatus === '' ? 'active' : ''} onClick={() => setFilterStatus('')}>
            All ({counts.all})
          </button>
          {STATUS_OPTIONS.map(s => (
            <button key={s} className={filterStatus === s ? 'active' : ''} onClick={() => setFilterStatus(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s] || 0})
            </button>
          ))}
        </div>

        {/* ── Search bar ── */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by order #, customer, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {(search || filterStatus) && (
            <button className="btn-secondary" onClick={() => { setSearch(''); setFilterStatus('') }}>
              ✕ Clear
            </button>
          )}
          <span className="ord-result-count">
            {visible.length} result{visible.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Table ── */}
        <div className="admin-table-section">
          <h2>Orders</h2>

          {visible.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">🪵</span>
              <p>No orders match your filters.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="ord-col-id">Order #</th>
                    <th className="ord-col-customer">Customer</th>
                    <th className="ord-col-items">Items</th>
                    <th className="ord-col-total">Total</th>
                    <th className="ord-col-status">Status</th>
                    <th className="ord-col-date">Date</th>
                    <th className="ord-col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(order => (
                    <tr key={order._id} style={{ opacity: updating === order._id ? 0.6 : 1 }}>

                      <td className="ord-col-id">
                        <strong>{getOrderLabel(order)}</strong>
                      </td>

                      <td className="ord-col-customer">
                        <span className="ord-customer-name">{getCustomerName(order)}</span>
                        {getCustomerEmail(order) && (
                          <span className="ord-customer-email">{getCustomerEmail(order)}</span>
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
          ORDER DETAIL MODAL
          ══════════════════════════════════════ */}
      {viewOrder && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setViewOrder(null)}>
          <div className="modal-card ord-modal">

            <div className="modal-header">
              <h3>Order {getOrderLabel(viewOrder)}</h3>
              <button className="modal-close" onClick={() => setViewOrder(null)}>×</button>
            </div>

            <div className="modal-body">

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

              <div className="ord-modal-section">
                <div className="ord-modal-section-label">Customer</div>
                <div className="ord-modal-customer-name">{getCustomerName(viewOrder)}</div>
                {getCustomerEmail(viewOrder) && (
                  <div className="ord-modal-meta">{getCustomerEmail(viewOrder)}</div>
                )}
                {resolveCustomer(viewOrder)?.phone && (
                  <div className="ord-modal-meta">{resolveCustomer(viewOrder).phone}</div>
                )}
              </div>

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

export default AdminOrders