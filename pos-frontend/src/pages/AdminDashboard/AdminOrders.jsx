import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
import './AdminDashboard.css'

const AdminOrders = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!user?.role || user?.role !== 'admin') {
      navigate('/')
      return
    }
    fetchOrders()
  }, [user, navigate])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await api.getAllOrders()
      const data = Array.isArray(res.data) ? res.data : (res.data?.orders || [])
      setOrders(data)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.updateOrderStatus(orderId, status)
      setNotice(`Order status updated to "${status}"`)
      setTimeout(() => setNotice(''), 2500)
      fetchOrders()
    } catch (err) {
      console.error('Error updating order status:', err)
      setError(err.message || 'Failed to update order status')
    }
  }

  const formatPHP = (value) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0))

  if (loading) return <div className="admin-loading">Loading orders...</div>

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="dashboard-header">
          <h1>Order Management</h1>
          <p className="dashboard-subtitle">{orders.length} total orders</p>
        </div>

        {notice && <div className="admin-notice">{notice}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="admin-table-section">
          <h2>All Orders</h2>
          {orders.length === 0 ? (
            <p className="admin-loading">No orders found</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.customerId?.firstName} {order.customerId?.lastName}</td>
                    <td>{formatPHP(order.totalAmount)}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className={`status-select ${order.status}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn-view">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminOrders