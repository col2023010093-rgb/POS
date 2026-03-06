import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/orders');
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0));

  const getStatusIcon = (status) => '';
  const getPaymentIcon = (method) => '';

  const getStatusStep = (status) => {
    const steps = ['pending', 'preparing', 'ready', 'completed'];
    return steps.indexOf(status);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="orders-page">
      <div className="orders-container">
        <header className="orders-topbar">
          <div className="orders-topbar-content">
            <h1>📦 My Orders</h1>
            <p>Track your recent purchases and order status.</p>
          </div>

        </header>

        {/* Filter Tabs */}
        <div className="orders-filter-tabs">
          {['all', 'pending', 'preparing', 'ready', 'completed', 'cancelled'].map(tab => (
            <button
              key={tab}
              className={`filter-tab ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {orderCounts[tab] > 0 && <span className="tab-count">{orderCounts[tab]}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">🛒</div>
            <h3>No orders found</h3>
            <p>{filter === 'all' ? "You haven't placed any orders yet." : `No ${filter} orders.`}</p>
            <button className="browse-menu-btn" onClick={() => navigate('/menu')}>
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map(order => (
              <article key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-header-left">
                    <p className="order-number">
                      {order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`}
                    </p>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="order-header-right">
                    <span className={`order-status ${order.status || 'pending'}`}>
                      {order.status || 'pending'}
                    </span>
                  </div>
                </div>

                <div className="order-items-preview">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="order-item-preview">
                      <span className="item-name">{item.name} × {item.quantity}</span>
                      <span className="item-price">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="more-items">+{order.items.length - 3} more item(s)</p>
                  )}
                </div>

                <div className="order-footer">
                  <div className="order-footer-left">
                    <span className="payment-badge">
                      {order.paymentMethod || 'cash'}
                    </span>
                    <span className={`payment-status ${order.paymentStatus || 'pending'}`}>
                      {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Unpaid'}
                    </span>
                  </div>
                  <div className="order-footer-right">
                    <span className="order-total">{formatCurrency(order.totalAmount)}</span>
                    <button className="view-details-btn" onClick={() => setSelectedOrder(order)}>
                      View Details
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedOrder(null)}>✕</button>

            <div className="modal-header">
              <h2>Order Details</h2>
              <p className="modal-order-number">
                {selectedOrder.orderNumber || `#${selectedOrder._id.slice(-6).toUpperCase()}`}
              </p>
            </div>

            {/* Status Tracker */}
            {selectedOrder.status !== 'cancelled' && (
              <div className="status-tracker">
                <h3>Order Progress</h3>
                <div className="tracker-steps">
                  {['pending', 'preparing', 'ready', 'completed'].map((step, idx) => (
                    <div
                      key={step}
                      className={`tracker-step ${
                        getStatusStep(selectedOrder.status) >= idx ? 'active' : ''
                      } ${selectedOrder.status === step ? 'current' : ''}`}
                    >
                      <div className="step-circle">
                        {getStatusStep(selectedOrder.status) > idx ? '' : idx + 1}
                      </div>
                      <span className="step-label">{step.charAt(0).toUpperCase() + step.slice(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedOrder.status === 'cancelled' && (
              <div className="cancelled-banner">
                <p>This order has been cancelled</p>
              </div>
            )}

            {/* Order Info */}
            <div className="modal-info-grid">
              <div className="info-item">
                <span className="info-label">Order Date</span>
                <span className="info-value">{formatDate(selectedOrder.createdAt)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status</span>
                <span className={`info-value status-text ${selectedOrder.status}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Payment Method</span>
                <span className="info-value">
                  {selectedOrder.paymentMethod || 'Cash'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Payment Status</span>
                <span className={`info-value ${selectedOrder.paymentStatus === 'paid' ? 'text-green' : 'text-orange'}`}>
                  {selectedOrder.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Items List */}
            <div className="modal-items">
              <h3>Items Ordered ({selectedOrder.items.length})</h3>
              <div className="modal-items-list">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="modal-item">
                    <div className="modal-item-info">
                      <span className="modal-item-name">{item.name}</span>
                      <span className="modal-item-qty">Qty: {item.quantity}</span>
                    </div>
                    <div className="modal-item-pricing">
                      <span className="modal-item-unit">{formatCurrency(item.price)} each</span>
                      <span className="modal-item-total">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="modal-price-breakdown">
              <div className="price-row">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
              </div>
              {selectedOrder.deliveryFee > 0 && (
                <div className="price-row">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                </div>
              )}
              <div className="price-row total">
                <span>Total</span>
                <span>{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="modal-notes">
                <h3>Notes</h3>
                <p>{selectedOrder.notes}</p>
              </div>
            )}

            {/* Delivery Address */}
            {selectedOrder.deliveryAddress && (
              <div className="modal-address">
                <h3>Delivery Address</h3>
                <p>{selectedOrder.deliveryAddress}</p>
              </div>
            )}

            {/* Actions */}
            <div className="modal-actions">
              <button className="btn-reorder" onClick={() => {
                setSelectedOrder(null);
                navigate('/menu');
              }}>
                Order Again
              </button>
              <button className="btn-close-modal" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
