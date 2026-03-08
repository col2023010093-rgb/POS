import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
import './AdminDashboard.css'

const AdminReports = () => {
  const navigate        = useNavigate()
  const { user }        = useAuth()
  const [stats,         setStats]     = useState({})
  const [orders,        setOrders]    = useState([])
  const [loading,       setLoading]   = useState(true)
  const [error,         setError]     = useState(null)
  const [timeFilter,    setTimeFilter]= useState('all')
  const [reportTab,     setReportTab] = useState('overview')

  useEffect(() => {
    if (!user?.role || user?.role !== 'admin') { navigate('/'); return }
    fetchReportData()
  }, [user, navigate])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      try {
        const statsRes = await api.getStats()
        setStats(statsRes.data || {})
      } catch { /* non-fatal */ }

      try {
        const ordersRes = await api.getAllOrders()
        const data = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.orders || [])
        setOrders(data)
      } catch (err) {
        setError('Failed to load orders')
      }
    } catch (err) {
      setError(err.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const formatPHP = v =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(v || 0))

  const now = new Date()
  const getStartOfDay   = d => { const x = new Date(d); x.setHours(0,0,0,0); return x }
  const getStartOfWeek  = d => { const x = new Date(d); const day = x.getDay(); x.setDate(x.getDate() - day + (day === 0 ? -6 : 1)); x.setHours(0,0,0,0); return x }
  const getStartOfMonth = d => new Date(d.getFullYear(), d.getMonth(), 1)
  const getStartOfYear  = d => new Date(d.getFullYear(), 0, 1)

  const getFilteredOrders = () => {
    if (timeFilter === 'all') return orders
    let startDate
    if (timeFilter === 'yesterday') {
      const y = new Date(now); y.setDate(y.getDate() - 1)
      const s = getStartOfDay(y)
      const e = new Date(s); e.setDate(e.getDate() + 1)
      return orders.filter(o => { const d = new Date(o.createdAt); return d >= s && d < e })
    }
    switch (timeFilter) {
      case 'today':  startDate = getStartOfDay(now);   break
      case 'week':   startDate = getStartOfWeek(now);  break
      case 'month':  startDate = getStartOfMonth(now); break
      case 'year':   startDate = getStartOfYear(now);  break
      case 'last7':  startDate = new Date(now); startDate.setDate(startDate.getDate() - 7);  break
      case 'last30': startDate = new Date(now); startDate.setDate(startDate.getDate() - 30); break
      case 'last90': startDate = new Date(now); startDate.setDate(startDate.getDate() - 90); break
      default: return orders
    }
    return orders.filter(o => new Date(o.createdAt) >= startDate)
  }

  const filteredOrders   = getFilteredOrders()
  const completedOrders  = filteredOrders.filter(o => o.status === 'completed')
  const cancelledOrders  = filteredOrders.filter(o => o.status === 'cancelled')
  const pendingOrders    = filteredOrders.filter(o => o.status === 'pending')
  const preparingOrders  = filteredOrders.filter(o => o.status === 'preparing')

  const filteredRevenue  = completedOrders.reduce((s, o) => s + Number(o.totalAmount || 0), 0)
  const avgOrderValue    = completedOrders.length > 0 ? filteredRevenue / completedOrders.length : 0
  const completionRate   = filteredOrders.length > 0 ? ((completedOrders.length / filteredOrders.length) * 100).toFixed(1) : 0
  const cancellationRate = filteredOrders.length > 0 ? ((cancelledOrders.length / filteredOrders.length) * 100).toFixed(1) : 0

  const getDailyBreakdown = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date     = new Date(now); date.setDate(date.getDate() - i)
      const dayStart = getStartOfDay(date)
      const dayEnd   = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1)
      const dayOrders    = orders.filter(o => { const d = new Date(o.createdAt); return d >= dayStart && d < dayEnd })
      const dayCompleted = dayOrders.filter(o => o.status === 'completed')
      days.push({
        label:     dayStart.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' }),
        orders:    dayOrders.length,
        completed: dayCompleted.length,
        revenue:   dayCompleted.reduce((s, o) => s + Number(o.totalAmount || 0), 0),
      })
    }
    return days
  }

  const getWeeklyBreakdown = () => {
    const weeks = []
    for (let i = 3; i >= 0; i--) {
      const weekEnd   = new Date(now); weekEnd.setDate(weekEnd.getDate() - i * 7)
      const weekStart = new Date(weekEnd); weekStart.setDate(weekStart.getDate() - 7)
      const weekOrders    = orders.filter(o => { const d = new Date(o.createdAt); return d >= weekStart && d < weekEnd })
      const weekCompleted = weekOrders.filter(o => o.status === 'completed')
      weeks.push({
        label:     `${weekStart.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`,
        orders:    weekOrders.length,
        completed: weekCompleted.length,
        revenue:   weekCompleted.reduce((s, o) => s + Number(o.totalAmount || 0), 0),
      })
    }
    return weeks
  }

  const getMonthlyBreakdown = () => {
    const months = []
    for (let i = 11; i >= 0; i--) {
      const date       = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd   = new Date(date.getFullYear(), date.getMonth() + 1, 1)
      const monthOrders    = orders.filter(o => { const d = new Date(o.createdAt); return d >= monthStart && d < monthEnd })
      const monthCompleted = monthOrders.filter(o => o.status === 'completed')
      months.push({
        label:     monthStart.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }),
        orders:    monthOrders.length,
        completed: monthCompleted.length,
        revenue:   monthCompleted.reduce((s, o) => s + Number(o.totalAmount || 0), 0),
      })
    }
    return months
  }

  const getTopProducts = () => {
    const map = {}
    completedOrders.forEach(order => {
      ;(order.items || []).forEach(item => {
        const name = item.productId?.name || item.name || 'Unknown'
        if (!map[name]) map[name] = { name, quantity: 0, revenue: 0 }
        map[name].quantity += Number(item.quantity || 1)
        map[name].revenue  += Number(item.price || 0) * Number(item.quantity || 1)
      })
    })
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
  }

  const getPeakHours = () => {
    const hourMap = Array(24).fill(0)
    filteredOrders.forEach(o => { hourMap[new Date(o.createdAt).getHours()]++ })
    const maxOrders = Math.max(...hourMap, 1)
    return hourMap
      .map((count, hour) => ({
        hour:  `${String(hour).padStart(2, '0')}:00`,
        label: hour < 12 ? `${hour === 0 ? 12 : hour} AM` : `${hour === 12 ? 12 : hour - 12} PM`,
        count,
        percentage: ((count / maxOrders) * 100).toFixed(0),
      }))
      .filter(h => h.count > 0)
  }

  const dailyData   = getDailyBreakdown()
  const weeklyData  = getWeeklyBreakdown()
  const monthlyData = getMonthlyBreakdown()
  const topProducts = getTopProducts()
  const peakHours   = getPeakHours()

  const maxDailyRev   = Math.max(...dailyData.map(d => d.revenue),   1)
  const maxWeeklyRev  = Math.max(...weeklyData.map(w => w.revenue),  1)
  const maxMonthlyRev = Math.max(...monthlyData.map(m => m.revenue), 1)
  const maxProdRev    = Math.max(...topProducts.map(p => p.revenue), 1)

  const TotalsRow = ({ data }) => (
    <tr style={{ fontWeight: 700, borderTop: '2.5px solid var(--brand-tan)' }}>
      <td>Total</td>
      <td>{data.reduce((s, d) => s + d.orders, 0)}</td>
      <td>{data.reduce((s, d) => s + d.completed, 0)}</td>
      <td>{formatPHP(data.reduce((s, d) => s + d.revenue, 0))}</td>
    </tr>
  )

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-container">
          <div className="admin-loading">🔥 Crunching the numbers…</div>
        </div>
      </div>
    )
  }

  const IconRevenue        = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  const IconOrders         = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
  const IconCompleted      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  const IconCancelled      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
  const IconPending        = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  const IconPreparing      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10"/><path d="M12 6v6l4 2"/><path d="M18 2v4M20 4h-4"/></svg>
  const IconAvgOrder       = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
  const IconCompletionRate = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><path d="M3 20h18"/></svg>
  const IconCancelRate     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="14"/><line x1="12" y1="20" x2="12" y2="10"/><line x1="6" y1="20" x2="6" y2="16"/><path d="M3 20h18"/><line x1="4" y1="4" x2="20" y2="4" strokeWidth="1.25" strokeDasharray="2 2"/><line x1="3" y1="3" x2="21" y2="21" strokeWidth="1.5"/></svg>

  return (
    <div className="admin-dashboard">
      <div className="admin-container">

        {/* ── Header ── */}
        <div className="dashboard-header">
          <div>
            <h1>Reports & Analytics</h1>
            <p className="dashboard-subtitle">Business performance — smokehouse by the numbers</p>
          </div>
          <button className="btn-secondary" onClick={fetchReportData}>↻ Refresh</button>
        </div>

        {error && <div className="error-message">⚠ {error}</div>}

        {/* ── Time filter ── */}
        <div className="report-filters">
          <div className="filter-group">
            <label>Time Period</label>
            <div className="admin-tabs" style={{ marginBottom: 0 }}>
              {[
                { value: 'today',     label: 'Today'      },
                { value: 'yesterday', label: 'Yesterday'  },
                { value: 'week',      label: 'This Week'  },
                { value: 'month',     label: 'This Month' },
                { value: 'last7',     label: 'Last 7 Days'},
                { value: 'last30',    label: 'Last 30 Days'},
                { value: 'last90',    label: 'Last 90 Days'},
                { value: 'year',      label: 'This Year'  },
                { value: 'all',       label: 'All Time'   },
              ].map(f => (
                <button key={f.value} className={timeFilter === f.value ? 'active' : ''} onClick={() => setTimeFilter(f.value)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Report tabs ── */}
        <div className="admin-tabs">
          {[
            { value: 'overview',  label: '📊 Overview'       },
            { value: 'daily',     label: '📅 Daily'           },
            { value: 'weekly',    label: '📆 Weekly'          },
            { value: 'monthly',   label: '🗓️ Monthly'        },
            { value: 'products',  label: '🍖 Top Products'   },
            { value: 'hours',     label: '⏰ Peak Hours'     },
          ].map(tab => (
            <button key={tab.value} className={reportTab === tab.value ? 'active' : ''} onClick={() => setReportTab(tab.value)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========== OVERVIEW ========== */}
        {reportTab === 'overview' && (
          <>
            <div className="stats-grid">
              {[
                { icon: <IconRevenue />,        label: 'Revenue',           value: formatPHP(filteredRevenue), alert: false },
                { icon: <IconOrders />,         label: 'Total Orders',      value: filteredOrders.length,       alert: false },
                { icon: <IconCompleted />,      label: 'Completed',         value: completedOrders.length,      alert: false },
                { icon: <IconCancelled />,      label: 'Cancelled',         value: cancelledOrders.length,      alert: true  },
                { icon: <IconPending />,        label: 'Pending',           value: pendingOrders.length,        alert: false },
                { icon: <IconPreparing />,      label: 'Preparing',         value: preparingOrders.length,      alert: false },
                { icon: <IconAvgOrder />,       label: 'Avg Order Value',   value: formatPHP(avgOrderValue),    alert: false },
                { icon: <IconCompletionRate />, label: 'Completion Rate',   value: `${completionRate}%`,        alert: false },
                { icon: <IconCancelRate />,     label: 'Cancellation Rate', value: `${cancellationRate}%`,      alert: true  },
              ].map((s, i) => (
                <div className={`stat-card${s.alert ? ' alert' : ''}`} key={i}>
                  <span className="stat-icon">{s.icon}</span>
                  <h3>{s.label}</h3>
                  <p className="stat-number">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="admin-table-section">
              <h2>Recent Completed Orders</h2>
              {completedOrders.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">🪵</div><p>No completed orders for this period.</p></div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {completedOrders.slice(0, 20).map(order => (
                        <tr key={order._id}>
                          <td><strong>#{order.orderNumber || order._id.slice(-6).toUpperCase()}</strong></td>
                          <td>{order.customerId?.firstName} {order.customerId?.lastName}</td>
                          <td>{order.items?.length || 0} items</td>
                          <td><strong>{formatPHP(order.totalAmount)}</strong></td>
                          <td>{new Date(order.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ========== DAILY ========== */}
        {reportTab === 'daily' && (
          <div className="admin-table-section">
            <h2>Daily Sales — Last 7 Days</h2>
            <div className="report-chart">
              {dailyData.map((day, i) => (
                <div key={i} className="chart-bar-row">
                  <span className="chart-label">{day.label}</span>
                  <div className="chart-bar-container">
                    <div className="chart-bar" style={{ width: `${(day.revenue / maxDailyRev) * 100}%` }}>
                      <span className="chart-bar-value">{formatPHP(day.revenue)}</span>
                    </div>
                  </div>
                  <span className="chart-meta">{day.completed}/{day.orders} orders</span>
                </div>
              ))}
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>Day</th><th>Total Orders</th><th>Completed</th><th>Revenue</th></tr></thead>
                <tbody>
                  {dailyData.map((d, i) => <tr key={i}><td>{d.label}</td><td>{d.orders}</td><td>{d.completed}</td><td><strong>{formatPHP(d.revenue)}</strong></td></tr>)}
                  <TotalsRow data={dailyData} />
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== WEEKLY ========== */}
        {reportTab === 'weekly' && (
          <div className="admin-table-section">
            <h2>Weekly Sales — Last 4 Weeks</h2>
            <div className="report-chart">
              {weeklyData.map((week, i) => (
                <div key={i} className="chart-bar-row">
                  <span className="chart-label">{week.label}</span>
                  <div className="chart-bar-container">
                    <div className="chart-bar" style={{ width: `${(week.revenue / maxWeeklyRev) * 100}%` }}>
                      <span className="chart-bar-value">{formatPHP(week.revenue)}</span>
                    </div>
                  </div>
                  <span className="chart-meta">{week.completed}/{week.orders} orders</span>
                </div>
              ))}
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>Week</th><th>Total Orders</th><th>Completed</th><th>Revenue</th></tr></thead>
                <tbody>
                  {weeklyData.map((w, i) => <tr key={i}><td>{w.label}</td><td>{w.orders}</td><td>{w.completed}</td><td><strong>{formatPHP(w.revenue)}</strong></td></tr>)}
                  <TotalsRow data={weeklyData} />
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== MONTHLY ========== */}
        {reportTab === 'monthly' && (
          <div className="admin-table-section">
            <h2>Monthly Sales — Last 12 Months</h2>
            <div className="report-chart">
              {monthlyData.map((month, i) => (
                <div key={i} className="chart-bar-row">
                  <span className="chart-label">{month.label}</span>
                  <div className="chart-bar-container">
                    <div className="chart-bar" style={{ width: `${(month.revenue / maxMonthlyRev) * 100}%` }}>
                      <span className="chart-bar-value">{formatPHP(month.revenue)}</span>
                    </div>
                  </div>
                  <span className="chart-meta">{month.completed}/{month.orders} orders</span>
                </div>
              ))}
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>Month</th><th>Total Orders</th><th>Completed</th><th>Revenue</th></tr></thead>
                <tbody>
                  {monthlyData.map((m, i) => <tr key={i}><td>{m.label}</td><td>{m.orders}</td><td>{m.completed}</td><td><strong>{formatPHP(m.revenue)}</strong></td></tr>)}
                  <TotalsRow data={monthlyData} />
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== TOP PRODUCTS ========== */}
        {reportTab === 'products' && (
          <div className="admin-table-section">
            <h2>Top Selling Products</h2>
            {topProducts.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">🍖</div><p>No product data for this period.</p></div>
            ) : (
              <>
                <div className="report-chart">
                  {topProducts.map((p, i) => (
                    <div key={i} className="chart-bar-row">
                      <span className="chart-label">#{i + 1} {p.name}</span>
                      <div className="chart-bar-container">
                        <div className="chart-bar product-bar" style={{ width: `${(p.revenue / maxProdRev) * 100}%` }}>
                          <span className="chart-bar-value">{formatPHP(p.revenue)}</span>
                        </div>
                      </div>
                      <span className="chart-meta">{p.quantity} sold</span>
                    </div>
                  ))}
                </div>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead><tr><th>Rank</th><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
                    <tbody>
                      {topProducts.map((p, i) => (
                        <tr key={i}><td>#{i + 1}</td><td>{p.name}</td><td>{p.quantity}</td><td><strong>{formatPHP(p.revenue)}</strong></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========== PEAK HOURS ========== */}
        {reportTab === 'hours' && (
          <div className="admin-table-section">
            <h2>Peak Ordering Hours</h2>
            {peakHours.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">⏰</div><p>No order data for this period.</p></div>
            ) : (
              <>
                <div className="report-chart">
                  {peakHours.map((h, i) => (
                    <div key={i} className="chart-bar-row">
                      <span className="chart-label">{h.label}</span>
                      <div className="chart-bar-container">
                        <div className="chart-bar hours-bar" style={{ width: `${h.percentage}%` }}>
                          <span className="chart-bar-value">{h.count} orders</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead><tr><th>Time</th><th>Orders</th><th>% of Peak</th></tr></thead>
                    <tbody>
                      {[...peakHours].sort((a, b) => b.count - a.count).map((h, i) => (
                        <tr key={i}><td>{h.label}</td><td>{h.count}</td><td>{h.percentage}%</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminReports