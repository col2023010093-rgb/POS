import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
import './AdminDashboard.css'

const AdminReports = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeFilter, setTimeFilter] = useState('all')
  const [reportTab, setReportTab] = useState('overview')

  useEffect(() => {
    if (!user?.role || user?.role !== 'admin') {
      navigate('/')
      return
    }
    fetchReportData()
  }, [user, navigate])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats and orders separately so one failing doesn't break both
      let statsData = {}
      let ordersData = []

      try {
        const statsRes = await api.getStats()
        statsData = statsRes.data || {}
      } catch (err) {
        console.warn('Stats endpoint not available, using order data instead')
      }

      try {
        const ordersRes = await api.getAllOrders()
        ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.orders || [])
      } catch (err) {
        console.error('Failed to fetch orders:', err)
        setError('Failed to load orders')
      }

      setStats(statsData)
      setOrders(ordersData)
    } catch (err) {
      console.error('Failed to fetch report data:', err)
      setError(err.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const formatPHP = (value) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0))

  // ========== DATE HELPERS ==========
  const now = new Date()

  const getStartOfDay = (date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
  }

  const getStartOfWeek = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
  }

  const getStartOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  const getStartOfYear = (date) => {
    return new Date(date.getFullYear(), 0, 1)
  }

  // ========== FILTERED ORDERS ==========
  const getFilteredOrders = () => {
    if (timeFilter === 'all') return orders

    let startDate
    switch (timeFilter) {
      case 'today':
        startDate = getStartOfDay(now)
        break
      case 'yesterday':
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        startDate = getStartOfDay(yesterday)
        const endOfYesterday = new Date(startDate)
        endOfYesterday.setDate(endOfYesterday.getDate() + 1)
        return orders.filter(o => {
          const d = new Date(o.createdAt)
          return d >= startDate && d < endOfYesterday
        })
      case 'week':
        startDate = getStartOfWeek(now)
        break
      case 'month':
        startDate = getStartOfMonth(now)
        break
      case 'year':
        startDate = getStartOfYear(now)
        break
      case 'last7':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'last30':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 30)
        break
      case 'last90':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 90)
        break
      default:
        return orders
    }
    return orders.filter(o => new Date(o.createdAt) >= startDate)
  }

  const filteredOrders = getFilteredOrders()
  const completedOrders = filteredOrders.filter(o => o.status === 'completed')
  const cancelledOrders = filteredOrders.filter(o => o.status === 'cancelled')
  const pendingOrders = filteredOrders.filter(o => o.status === 'pending')
  const preparingOrders = filteredOrders.filter(o => o.status === 'preparing')

  const filteredRevenue = completedOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)
  const avgOrderValue = completedOrders.length > 0 ? filteredRevenue / completedOrders.length : 0
  const completionRate = filteredOrders.length > 0
    ? ((completedOrders.length / filteredOrders.length) * 100).toFixed(1)
    : 0
  const cancellationRate = filteredOrders.length > 0
    ? ((cancelledOrders.length / filteredOrders.length) * 100).toFixed(1)
    : 0

  // ========== DAILY BREAKDOWN (last 7 days) ==========
  const getDailyBreakdown = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dayStart = getStartOfDay(date)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const dayOrders = orders.filter(o => {
        const d = new Date(o.createdAt)
        return d >= dayStart && d < dayEnd
      })
      const dayCompleted = dayOrders.filter(o => o.status === 'completed')
      const dayRevenue = dayCompleted.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)

      days.push({
        label: dayStart.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' }),
        orders: dayOrders.length,
        completed: dayCompleted.length,
        revenue: dayRevenue
      })
    }
    return days
  }

  // ========== WEEKLY BREAKDOWN (last 4 weeks) ==========
  const getWeeklyBreakdown = () => {
    const weeks = []
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date(now)
      weekEnd.setDate(weekEnd.getDate() - (i * 7))
      const weekStart = new Date(weekEnd)
      weekStart.setDate(weekStart.getDate() - 7)

      const weekOrders = orders.filter(o => {
        const d = new Date(o.createdAt)
        return d >= weekStart && d < weekEnd
      })
      const weekCompleted = weekOrders.filter(o => o.status === 'completed')
      const weekRevenue = weekCompleted.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)

      weeks.push({
        label: `${weekStart.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`,
        orders: weekOrders.length,
        completed: weekCompleted.length,
        revenue: weekRevenue
      })
    }
    return weeks
  }

  // ========== MONTHLY BREAKDOWN (last 12 months) ==========
  const getMonthlyBreakdown = () => {
    const months = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1)

      const monthOrders = orders.filter(o => {
        const d = new Date(o.createdAt)
        return d >= monthStart && d < monthEnd
      })
      const monthCompleted = monthOrders.filter(o => o.status === 'completed')
      const monthRevenue = monthCompleted.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)

      months.push({
        label: monthStart.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }),
        orders: monthOrders.length,
        completed: monthCompleted.length,
        revenue: monthRevenue
      })
    }
    return months
  }

  // ========== TOP PRODUCTS ==========
  const getTopProducts = () => {
    const productMap = {}
    completedOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const name = item.productId?.name || item.name || 'Unknown'
        if (!productMap[name]) {
          productMap[name] = { name, quantity: 0, revenue: 0 }
        }
        productMap[name].quantity += Number(item.quantity || 1)
        productMap[name].revenue += Number(item.price || 0) * Number(item.quantity || 1)
      })
    })
    return Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }

  // ========== PEAK HOURS ==========
  const getPeakHours = () => {
    const hourMap = Array(24).fill(0)
    filteredOrders.forEach(o => {
      const hour = new Date(o.createdAt).getHours()
      hourMap[hour]++
    })
    const maxOrders = Math.max(...hourMap, 1)
    return hourMap.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      label: hour < 12 ? `${hour === 0 ? 12 : hour} AM` : `${hour === 12 ? 12 : hour - 12} PM`,
      count,
      percentage: ((count / maxOrders) * 100).toFixed(0)
    })).filter(h => h.count > 0)
  }

  const dailyData = getDailyBreakdown()
  const weeklyData = getWeeklyBreakdown()
  const monthlyData = getMonthlyBreakdown()
  const topProducts = getTopProducts()
  const peakHours = getPeakHours()

  // Find max revenue for bar chart scaling
  const maxDailyRevenue = Math.max(...dailyData.map(d => d.revenue), 1)
  const maxWeeklyRevenue = Math.max(...weeklyData.map(w => w.revenue), 1)
  const maxMonthlyRevenue = Math.max(...monthlyData.map(m => m.revenue), 1)
  const maxProductRevenue = Math.max(...topProducts.map(p => p.revenue), 1)

  if (loading) return <div className="admin-loading">Loading reports...</div>

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="dashboard-header">
          <h1>Reports & Analytics</h1>
          <p className="dashboard-subtitle">Business performance overview</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Time Filter */}
        <div className="report-filters">
          <div className="filter-group">
            <label>Time Period:</label>
            <div className="admin-tabs">
              {[
                { value: 'today', label: 'Today' },
                { value: 'yesterday', label: 'Yesterday' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'last7', label: 'Last 7 Days' },
                { value: 'last30', label: 'Last 30 Days' },
                { value: 'last90', label: 'Last 90 Days' },
                { value: 'year', label: 'This Year' },
                { value: 'all', label: 'All Time' }
              ].map(f => (
                <button
                  key={f.value}
                  className={timeFilter === f.value ? 'active' : ''}
                  onClick={() => setTimeFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="admin-tabs" style={{ marginBottom: '1.5rem' }}>
          {[
            { value: 'overview', label: '📊 Overview' },
            { value: 'daily', label: '📅 Daily' },
            { value: 'weekly', label: '📆 Weekly' },
            { value: 'monthly', label: '🗓️ Monthly' },
            { value: 'products', label: '🍖 Top Products' },
            { value: 'hours', label: '⏰ Peak Hours' }
          ].map(tab => (
            <button
              key={tab.value}
              className={reportTab === tab.value ? 'active' : ''}
              onClick={() => setReportTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========== OVERVIEW TAB ========== */}
        {reportTab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <h3>Revenue</h3>
                <p className="stat-number">{formatPHP(filteredRevenue)}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <h3>Total Orders</h3>
                <p className="stat-number">{filteredOrders.length}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <h3>Completed</h3>
                <p className="stat-number">{completedOrders.length}</p>
              </div>
              <div className="stat-card alert">
                <div className="stat-icon">❌</div>
                <h3>Cancelled</h3>
                <p className="stat-number">{cancelledOrders.length}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <h3>Pending</h3>
                <p className="stat-number">{pendingOrders.length}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🍳</div>
                <h3>Preparing</h3>
                <p className="stat-number">{preparingOrders.length}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💵</div>
                <h3>Avg Order Value</h3>
                <p className="stat-number">{formatPHP(avgOrderValue)}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <h3>Completion Rate</h3>
                <p className="stat-number">{completionRate}%</p>
              </div>
              <div className="stat-card alert">
                <div className="stat-icon">📉</div>
                <h3>Cancellation Rate</h3>
                <p className="stat-number">{cancellationRate}%</p>
              </div>
            </div>

            {/* Recent Completed Orders */}
            <div className="admin-table-section">
              <h2>Recent Completed Orders</h2>
              {completedOrders.length === 0 ? (
                <p className="admin-loading">No completed orders for this period</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedOrders.slice(0, 20).map(order => (
                      <tr key={order._id}>
                        <td>{order.orderNumber || order._id.slice(-6)}</td>
                        <td>{order.customerId?.firstName} {order.customerId?.lastName}</td>
                        <td>{order.items?.length || 0} items</td>
                        <td>{formatPHP(order.totalAmount)}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ========== DAILY TAB ========== */}
        {reportTab === 'daily' && (
          <div className="admin-table-section">
            <h2>Daily Sales (Last 7 Days)</h2>
            <div className="report-chart">
              {dailyData.map((day, i) => (
                <div key={i} className="chart-bar-row">
                  <span className="chart-label">{day.label}</span>
                  <div className="chart-bar-container">
                    <div
                      className="chart-bar"
                      style={{ width: `${(day.revenue / maxDailyRevenue) * 100}%` }}
                    >
                      <span className="chart-bar-value">{formatPHP(day.revenue)}</span>
                    </div>
                  </div>
                  <span className="chart-meta">{day.completed}/{day.orders} orders</span>
                </div>
              ))}
            </div>

            <table className="admin-table" style={{ marginTop: '1.5rem' }}>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Total Orders</th>
                  <th>Completed</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.map((day, i) => (
                  <tr key={i}>
                    <td>{day.label}</td>
                    <td>{day.orders}</td>
                    <td>{day.completed}</td>
                    <td>{formatPHP(day.revenue)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: '700', borderTop: '2px solid #d4a574' }}>
                  <td>Total</td>
                  <td>{dailyData.reduce((s, d) => s + d.orders, 0)}</td>
                  <td>{dailyData.reduce((s, d) => s + d.completed, 0)}</td>
                  <td>{formatPHP(dailyData.reduce((s, d) => s + d.revenue, 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ========== WEEKLY TAB ========== */}
        {reportTab === 'weekly' && (
          <div className="admin-table-section">
            <h2>Weekly Sales (Last 4 Weeks)</h2>
            <div className="report-chart">
              {weeklyData.map((week, i) => (
                <div key={i} className="chart-bar-row">
                  <span className="chart-label">{week.label}</span>
                  <div className="chart-bar-container">
                    <div
                      className="chart-bar"
                      style={{ width: `${(week.revenue / maxWeeklyRevenue) * 100}%` }}
                    >
                      <span className="chart-bar-value">{formatPHP(week.revenue)}</span>
                    </div>
                  </div>
                  <span className="chart-meta">{week.completed}/{week.orders} orders</span>
                </div>
              ))}
            </div>

            <table className="admin-table" style={{ marginTop: '1.5rem' }}>
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Total Orders</th>
                  <th>Completed</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {weeklyData.map((week, i) => (
                  <tr key={i}>
                    <td>{week.label}</td>
                    <td>{week.orders}</td>
                    <td>{week.completed}</td>
                    <td>{formatPHP(week.revenue)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: '700', borderTop: '2px solid #d4a574' }}>
                  <td>Total</td>
                  <td>{weeklyData.reduce((s, w) => s + w.orders, 0)}</td>
                  <td>{weeklyData.reduce((s, w) => s + w.completed, 0)}</td>
                  <td>{formatPHP(weeklyData.reduce((s, w) => s + w.revenue, 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ========== MONTHLY TAB ========== */}
        {reportTab === 'monthly' && (
          <div className="admin-table-section">
            <h2>Monthly Sales (Last 12 Months)</h2>
            <div className="report-chart">
              {monthlyData.map((month, i) => (
                <div key={i} className="chart-bar-row">
                  <span className="chart-label">{month.label}</span>
                  <div className="chart-bar-container">
                    <div
                      className="chart-bar"
                      style={{ width: `${(month.revenue / maxMonthlyRevenue) * 100}%` }}
                    >
                      <span className="chart-bar-value">{formatPHP(month.revenue)}</span>
                    </div>
                  </div>
                  <span className="chart-meta">{month.completed}/{month.orders} orders</span>
                </div>
              ))}
            </div>

            <table className="admin-table" style={{ marginTop: '1.5rem' }}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total Orders</th>
                  <th>Completed</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month, i) => (
                  <tr key={i}>
                    <td>{month.label}</td>
                    <td>{month.orders}</td>
                    <td>{month.completed}</td>
                    <td>{formatPHP(month.revenue)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: '700', borderTop: '2px solid #d4a574' }}>
                  <td>Total</td>
                  <td>{monthlyData.reduce((s, m) => s + m.orders, 0)}</td>
                  <td>{monthlyData.reduce((s, m) => s + m.completed, 0)}</td>
                  <td>{formatPHP(monthlyData.reduce((s, m) => s + m.revenue, 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ========== TOP PRODUCTS TAB ========== */}
        {reportTab === 'products' && (
          <div className="admin-table-section">
            <h2>Top Selling Products</h2>
            {topProducts.length === 0 ? (
              <p className="admin-loading">No product data available for this period</p>
            ) : (
              <>
                <div className="report-chart">
                  {topProducts.map((product, i) => (
                    <div key={i} className="chart-bar-row">
                      <span className="chart-label">#{i + 1} {product.name}</span>
                      <div className="chart-bar-container">
                        <div
                          className="chart-bar product-bar"
                          style={{ width: `${(product.revenue / maxProductRevenue) * 100}%` }}
                        >
                          <span className="chart-bar-value">{formatPHP(product.revenue)}</span>
                        </div>
                      </div>
                      <span className="chart-meta">{product.quantity} sold</span>
                    </div>
                  ))}
                </div>

                <table className="admin-table" style={{ marginTop: '1.5rem' }}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Product</th>
                      <th>Qty Sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, i) => (
                      <tr key={i}>
                        <td>#{i + 1}</td>
                        <td>{product.name}</td>
                        <td>{product.quantity}</td>
                        <td>{formatPHP(product.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {/* ========== PEAK HOURS TAB ========== */}
        {reportTab === 'hours' && (
          <div className="admin-table-section">
            <h2>Peak Ordering Hours</h2>
            {peakHours.length === 0 ? (
              <p className="admin-loading">No order data available for this period</p>
            ) : (
              <>
                <div className="report-chart">
                  {peakHours.map((h, i) => (
                    <div key={i} className="chart-bar-row">
                      <span className="chart-label">{h.label}</span>
                      <div className="chart-bar-container">
                        <div
                          className="chart-bar hours-bar"
                          style={{ width: `${h.percentage}%` }}
                        >
                          <span className="chart-bar-value">{h.count} orders</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <table className="admin-table" style={{ marginTop: '1.5rem' }}>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Orders</th>
                      <th>% of Peak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {peakHours.sort((a, b) => b.count - a.count).map((h, i) => (
                      <tr key={i}>
                        <td>{h.label}</td>
                        <td>{h.count}</td>
                        <td>{h.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminReports