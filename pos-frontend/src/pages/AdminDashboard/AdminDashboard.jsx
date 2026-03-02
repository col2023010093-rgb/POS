import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom' // ✅ ADD THIS
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const navigate = useNavigate() // ✅ ADD THIS
  const { user, token } = useAuth() // ✅ ADD token here
  const [stats, setStats] = useState({})
  const [orders, setOrders] = useState([])
  const [reservations, setReservations] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState('')

  const [showProductModal, setShowProductModal] = useState(false)
  const [productError, setProductError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    prepTime: '',
    inStock: true
  })

  const [categories, setCategories] = useState([])
  const [prepTimes, setPrepTimes] = useState(['5 mins', '10 mins', '15 mins', '20 mins', '30 mins'])

  useEffect(() => {
    if (!user?.role || user?.role !== 'admin') {
      navigate('/')
      return
    }
    fetchData()
  }, [user, navigate])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [statsRes, ordersRes, usersRes, productsRes, reservationsRes] = await Promise.all([
        api.getStats(),
        api.getAllOrders(),
        api.getAllUsers(),
        api.getAdminProducts(),
        api.getReservations() // ✅ ADD THIS
      ])

      // ✅ Handle response structure:
      setStats(statsRes.data || {})
      
      const ordersData = Array.isArray(ordersRes.data) 
        ? ordersRes.data 
        : (ordersRes.data?.orders || []);
      setOrders(ordersData);
      
      const usersData = Array.isArray(usersRes.data) 
        ? usersRes.data 
        : (usersRes.data?.users || []);
      setUsers(usersData);
      
      const productsData = Array.isArray(productsRes.data) 
        ? productsRes.data 
        : (productsRes.data?.products || []);
      setProducts(productsData);
      
      const reservationsData = Array.isArray(reservationsRes.data) 
        ? reservationsRes.data 
        : (reservationsRes.data?.reservations || []);
      setReservations(reservationsData);
      
      console.log('✅ Fetched:', { 
        orders: ordersData.length, 
        users: usersData.length, 
        products: productsData.length 
      });
      
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      setError(err.message || 'Failed to load dashboard data'); // ✅ Changed from setNotice
      // ✅ Set empty arrays on error to prevent .map errors
      setOrders([]);
      setUsers([]);
      setProducts([]);
    } finally {
      setLoading(false)
    }
  }

  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target
    setProductForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result
      setImagePreview(base64)
      setProductForm(prev => ({ ...prev, image: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const openProductModal = (product = null) => {
    if (product) {
      setEditingId(product._id)
      setProductForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        image: product.image || '',
        prepTime: product.prepTime || '',
        inStock: product.inStock ?? true
      })
      setImagePreview(product.image || '')
    } else {
      setEditingId(null)
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        prepTime: '',
        inStock: true
      })
      setImagePreview('')
    }
    setProductError('')
    setShowProductModal(true)
  }

  const closeProductModal = () => {
    setShowProductModal(false)
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    setProductError('')
    try {
      const payload = { ...productForm, price: Number(productForm.price) }
      if (editingId) {
        await api.updateProduct(editingId, payload, token)
      } else {
        await api.createProduct(payload, token)
      }
      closeProductModal()
      fetchData()
    } catch (error) {
      setProductError(error.message || 'Failed to save product')
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    await api.deleteProduct(id, token)
    fetchData()
  }

  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      console.log('📝 Updating order:', orderId, 'to status:', status)
      
      await api.updateOrderStatus(orderId, status)
      
      console.log('✅ Order status updated')
      showNotice(`Order status updated to "${status}"`)
      fetchData() // ✅ Refresh data
    } catch (error) {
      console.error('❌ Error updating order status:', error)
      setError(error.message || 'Failed to update order status')
    }
  }

  const handleReservationStatusUpdate = async (reservationId, status) => {
    try {
      console.log('📝 Updating reservation:', reservationId, 'to status:', status)
      
      await api.updateReservationStatus(reservationId, status)
      
      console.log('✅ Reservation status updated')
      showNotice(`Reservation status updated to "${status}"`)
      fetchData() // ✅ Refresh data
    } catch (error) {
      console.error('❌ Error updating reservation status:', error)
      setError(error.message || 'Failed to update reservation status')
    }
  }

  const formatPHP = (value) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0))

  const showNotice = (msg) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 2500)
  }

  if (loading) return <div className="admin-loading">Loading...</div>

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <h1>Admin Dashboard</h1>

        <div className="admin-tabs">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Orders</button>
          <button className={activeTab === 'reservations' ? 'active' : ''} onClick={() => setActiveTab('reservations')}>Reservations</button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
          <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>Products</button>
        </div>

        {notice && <div className="admin-notice">{notice}</div>}

        {activeTab === 'dashboard' && stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Orders</h3>
              <p className="stat-number">{stats.totalOrders || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-number">{formatPHP(stats.totalRevenue || 0)}</p>
            </div>
            <div className="stat-card">
              <h3>Total Products</h3>
              <p className="stat-number">{stats.totalProducts || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Customers</h3>
              <p className="stat-number">{stats.totalCustomers || stats.totalUsers || 0}</p>
            </div>
            <div className="stat-card alert">
              <h3>Pending Orders</h3>
              <p className="stat-number">{stats.pendingOrders || 0}</p>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="admin-table-section">
            <h2>All Orders</h2>
            <table className="admin-table">
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Action</th></tr>
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
                        onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                        className={`status-select ${order.status}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td><button className="btn-view">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="admin-table-section">
            <h2>All Reservations</h2>
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Date</th><th>Time</th><th>Guests</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {reservations.map(res => (
                  <tr key={res._id}>
                    <td>{res.firstName} {res.lastName}</td>
                    <td>{new Date(res.date).toLocaleDateString()}</td>
                    <td>{res.time}</td>
                    <td>{res.guests}</td>
                    <td>
                      <select
                        value={res.status}
                        onChange={(e) => handleReservationStatusUpdate(res._id, e.target.value)}
                        className={`status-select ${res.status}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td><button className="btn-view">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-table-section">
            <h2>All Users</h2>
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Action</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.firstName} {u.lastName}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '-'}</td>
                    <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn-delete">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="admin-table-section">
            <div className="products-header">
              <h2>Manage Products</h2>
              <button className="btn-view" onClick={() => openProductModal()}>+ Add Product</button>
            </div>

            <table className="admin-table">
              <thead>
                <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>{p.image ? <img src={p.image} alt={p.name} className="product-thumb" /> : '-'}</td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{formatPHP(p.price)}</td>
                    <td>{p.inStock ? 'In Stock' : 'Out of Stock'}</td>
                    <td>
                      <button className="btn-view" onClick={() => openProductModal(p)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDeleteProduct(p._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {showProductModal && (
              <div className="modal-backdrop" onClick={closeProductModal}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>{editingId ? 'Edit Product' : 'Add Product'}</h3>
                    <button className="modal-close" onClick={closeProductModal}>×</button>
                  </div>

                  <form className="product-form" onSubmit={handleProductSubmit}>
                    {productError && <div className="error-message">{productError}</div>}

                    <input name="name" placeholder="Name" value={productForm.name} onChange={handleProductChange} required />
                    <input
                      name="category"
                      list="category-list"
                      placeholder="Category"
                      value={productForm.category}
                      onChange={handleProductChange}
                      required
                    />
                    <datalist id="category-list">
                      {categories.map(cat => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>

                    <input name="price" type="number" step="0.01" placeholder="Price" value={productForm.price} onChange={handleProductChange} required />
                    <input
                      name="prepTime"
                      list="preptime-list"
                      placeholder="Prep Time (e.g. 15 mins)"
                      value={productForm.prepTime}
                      onChange={handleProductChange}
                    />
                    <datalist id="preptime-list">
                      {prepTimes.map(t => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>

                    <input name="description" placeholder="Description" value={productForm.description} onChange={handleProductChange} />

                    <label className="file-input">
                      <span>Upload Image</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} />
                    </label>

                    {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}

                    <label className="checkbox">
                      <input type="checkbox" name="inStock" checked={productForm.inStock} onChange={handleProductChange} />
                      In Stock
                    </label>

                    <div className="modal-actions">
                      <button type="button" className="btn-delete" onClick={closeProductModal}>Cancel</button>
                      <button type="submit" className="btn-view">
                        {editingId ? 'Update Product' : 'Add Product'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard