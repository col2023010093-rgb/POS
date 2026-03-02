import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import './Orders.css'

const Orders = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchOrders()
  }, [user])

  const fetchOrders = async () => {
    try {
      const res = await api.getOrders()
      const data = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : [])
      setOrders(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const map = { pending: '#ffb400', completed: '#28a745', cancelled: '#dc3545' }
    return map[status] || '#6c757d'
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1>My Orders</h1>

        {loading ? (
          <p className="loading">Loading orders...</p>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <h3>Order #{order.orderNumber}</h3>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span 
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="order-items">
                  <h4>Items:</h4>
                  <ul>
                    {Array.isArray(order.items) && order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} x {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="order-footer">
                  <div>
                    <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
                    <p><strong>Payment:</strong> {order.paymentMethod}</p>
                    <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                  </div>
                  {order.notes && (
                    <p><strong>Notes:</strong> {order.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
