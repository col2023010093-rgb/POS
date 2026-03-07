import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
import './AdminDashboard.css'

const STATUS_OPTIONS = ['pending', 'preparing', 'ready', 'completed', 'cancelled']

const AdminOrders = () => {
  const navigate      = useNavigate()
  const { user }      = useAuth()
  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [notice,      setNotice]      = useState('')
  const [search,      setSearch]      = useState('')
  const [filterStatus,setFilterStatus]= useState('')
  const [viewOrder,   setViewOrder]   = useState(null)
  const [updating,    setUpdating]    = useState(null)

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

  /* ── filtered + searched list ── */
  const visible = useMemo(() => {
    let list = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (filterStatus) list = list.filter(o => o.status === filterStatus)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(o =>
        (o.orderNumber || '').toLowerCase().includes(q) ||
        (`${o.customerId?.firstName} ${o.customerId?.lastName}`).toLowerCase().includes(q) ||
        o.customerId?.email?.toLowerCase().includes(q)
      )
    }
    return list
  }, [orders, filterStatus, search])

  /* ── status counts for quick tabs ── */
  const counts = useMemo(() => {
    const c = { all: orders.length }
    STATUS_OPTIONS.forEach(s => { c[s] = orders.filter(o => o.status === s).length })
    return c
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

        {/* ── Search / filter bar ── */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by order #, customer, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 220 }}
          />
          {(search || filterStatus) && (
            <button className="btn-secondary" onClick={() => { setSearch(''); setFilterStatus('') }}>
              ✕ Clear
            </button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--brand-tan)', fontWeight: 600 }}>
            {visible.length} result{visible.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Table ── */}
        <div className="admin-table-section">
          <h2>Orders</h2>

          {visible.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🪵</div>
              <p>No orders match your filters.</p>
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
                  {visible.map(order => (
                    <tr key={order._id} style={{ opacity: updating === order._id ? 0.6 : 1 }}>
                      <td><strong>#{order.orderNumber || order._id.slice(-6).toUpperCase()}</strong></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {order.customerId?.firstName} {order.customerId?.lastName}
                        </div>
                        {order.customerId?.email && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--brand-tan)' }}>
                            {order.customerId.email}
                          </div>
                        )}
                      </td>
                      <td>{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</td>
                      <td><strong>{formatPHP(order.totalAmount)}</strong></td>
                      <td>
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
                      <td>
                        {new Date(order.createdAt).toLocaleDateString('en-PH', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>
                      <td>
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

      {/* ── Order Detail Modal ── */}
      {viewOrder && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setViewOrder(null)}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>Order #{viewOrder.orderNumber || viewOrder._id.slice(-6).toUpperCase()}</h3>
              <button className="modal-close" onClick={() => setViewOrder(null)}>×</button>
            </div>
            <div className="modal-body">

              {/* Status update inside modal */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem',
                            padding: '0.75rem 1rem', background: 'var(--brand-smoke)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--brand-copper)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Status:
                </span>
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

              {/* Customer info */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--brand-copper)', marginBottom: '0.5rem' }}>
                  Customer
                </div>
                <div style={{ fontWeight: 600, color: 'var(--brand-dark)' }}>
                  {viewOrder.customerId?.firstName} {viewOrder.customerId?.lastName}
                </div>
                {viewOrder.customerId?.email && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--brand-tan)' }}>{viewOrder.customerId.email}</div>
                )}
                {viewOrder.customerId?.phone && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--brand-tan)' }}>{viewOrder.customerId.phone}</div>
                )}
              </div>

              {/* Items */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--brand-copper)', marginBottom: '0.75rem' }}>
                  Order Items
                </div>
                <ul className="order-items-list">
                  {(viewOrder.items || []).map((item, i) => (
                    <li className="order-item" key={i}>
                      <span className="order-item-name">{item.productId?.name || item.name || 'Item'}</span>
                      <span className="order-item-qty">× {item.quantity || 1}</span>
                      <span className="order-item-price">
                        {formatPHP(Number(item.price || 0) * Number(item.quantity || 1))}
                      </span>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem',
                              borderTop: '2px solid var(--brand-smoke)', paddingTop: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--brand-saddle)', fontFamily: 'Playfair Display, serif' }}>
                    Total: {formatPHP(viewOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Timestamps */}
              <div style={{ fontSize: '0.78rem', color: 'var(--brand-tan)' }}>
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