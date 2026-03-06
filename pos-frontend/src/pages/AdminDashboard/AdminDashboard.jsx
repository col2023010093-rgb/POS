import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user?.role || user?.role !== 'admin') {
      navigate('/')
      return
    }
    fetchStats()
  }, [user, navigate])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await api.getStats()
      setStats(res.data || {})
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatPHP = (value) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0))

  if (loading) return <div className="admin-loading">Loading...</div>

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <p className="dashboard-subtitle">Welcome back, {user?.firstName}!</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <h3>Total Orders</h3>
            <p className="stat-number">{stats.totalOrders || 0}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <h3>Total Revenue</h3>
            <p className="stat-number">{formatPHP(stats.totalRevenue || 0)}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🍖</div>
            <h3>Total Products</h3>
            <p className="stat-number">{stats.totalProducts || 0}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <h3>Total Customers</h3>
            <p className="stat-number">{stats.totalCustomers || stats.totalUsers || 0}</p>
          </div>
          <div className="stat-card alert">
            <div className="stat-icon">⏳</div>
            <h3>Pending Orders</h3>
            <p className="stat-number">{stats.pendingOrders || 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard