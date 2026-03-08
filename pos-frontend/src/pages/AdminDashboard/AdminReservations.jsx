import React, { useState, useEffect, useCallback } from 'react'
import './AdminDashboard.css'
import './AdminReservations.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

/* ── Status options ─────────────────────────────────────────────────── */
const STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled', 'completed']

/* ── Date formatter ─────────────────────────────────────────────────── */
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
}

/* ────────────────────────────────────────────────────────────────────── */
const AdminReservations = () => {
  const [reservations, setReservations] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [updating,     setUpdating]     = useState(null)

  /* Filters */
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate,   setFilterDate]   = useState('')
  const [search,       setSearch]       = useState('')

  /* Pagination */
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const LIMIT = 15

  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  /* ── DATA FETCH (logic unchanged) ───────────────────────────────────── */
  const fetchReservations = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page, limit: LIMIT })
      if (filterStatus) params.set('status', filterStatus)
      if (filterDate)   params.set('date',   filterDate)

      const res = await fetch(`${API_BASE}/api/reservations?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load reservations.')
      const data = await res.json()

      if (Array.isArray(data)) {
        setReservations(data)
        setTotalPages(1)
      } else {
        setReservations(data.reservations || [])
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, filterStatus, filterDate, token])

  useEffect(() => { fetchReservations() }, [fetchReservations])

  /* ── STATUS UPDATE (logic unchanged) ────────────────────────────────── */
  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id)
    try {
      const res = await fetch(`${API_BASE}/api/reservations/${id}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status.')
      const updated = await res.json()
      setReservations(prev =>
        prev.map(r => (r._id === id ? { ...r, status: updated.status } : r))
      )
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(null)
    }
  }

  /* ── DELETE (logic unchanged) ───────────────────────────────────────── */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this reservation?')) return
    try {
      const res = await fetch(`${API_BASE}/api/reservations/${id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to delete reservation.')
      setReservations(prev => prev.filter(r => r._id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  /* ── CLIENT-SIDE SEARCH (logic unchanged) ───────────────────────────── */
  const visible = reservations.filter(r => {
    if (!search.trim()) return true
    const q    = search.toLowerCase()
    const name = `${r.firstName} ${r.lastName}`.toLowerCase()
    return (
      name.includes(q)                    ||
      r.email?.toLowerCase().includes(q)  ||
      r.phone?.includes(q)
    )
  })

  /* ── DERIVED STATS ───────────────────────────────────────────────────── */
  const today      = new Date().toDateString()
  const totalCount = reservations.length
  const pendCount  = reservations.filter(r => r.status === 'pending').length
  const confCount  = reservations.filter(r => r.status === 'confirmed').length
  const cancCount  = reservations.filter(r => r.status === 'cancelled').length
  const todayCount = reservations.filter(r =>
    new Date(r.date).toDateString() === today
  ).length

  const hasFilters = filterStatus || filterDate || search

  /* ── RENDER ─────────────────────────────────────────────────────────── */
  return (
    <div className="admin-dashboard">
      <div className="admin-container">

        {/* ══════════════════════════════════════════════
            PAGE HEADER
        ════════════════════════════════════════════════ */}
        <div className="dashboard-header">
          <div>
            <h1>Reservation Management</h1>
            <p className="dashboard-subtitle">
              {totalCount} total reservations — {confCount} confirmed, {pendCount} pending
            </p>
          </div>
          <div className="res-header-actions">
            <button className="btn-secondary" onClick={fetchReservations}>
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && <div className="error-message">⚠ {error}</div>}

        {/* ══════════════════════════════════════════════
            STAT CARDS
        ════════════════════════════════════════════════ */}
        <div className="res-stats">
          <div className="ord-stat-card stat-total">
            <span className="ord-stat-label">Total</span>
            <span className="ord-stat-value">{totalCount}</span>
            <span className="ord-stat-sub">all reservations</span>
          </div>
          <div className="ord-stat-card stat-pending">
            <span className="ord-stat-label">Pending</span>
            <span className="ord-stat-value">{pendCount}</span>
            <span className="ord-stat-sub">awaiting confirmation</span>
          </div>
          <div className="ord-stat-card stat-confirmed">
            <span className="ord-stat-label">Confirmed</span>
            <span className="ord-stat-value">{confCount}</span>
            <span className="ord-stat-sub">ready to seat</span>
          </div>
          <div className="ord-stat-card stat-cancelled">
            <span className="ord-stat-label">Cancelled</span>
            <span className="ord-stat-value">{cancCount}</span>
            <span className="ord-stat-sub">this period</span>
          </div>
          <div className="ord-stat-card stat-today">
            <span className="ord-stat-label">Today</span>
            <span className="ord-stat-value">{todayCount}</span>
            <span className="ord-stat-sub">arriving today</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            FILTER BAR
        ════════════════════════════════════════════════ */}
        <div className="filter-bar">
          {/* Search */}
          <input
            type="text"
            placeholder="Search name, email, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="res-search-input"
          />

          <span className="res-filter-sep" aria-hidden="true" />

          {/* Status filter */}
          <select
            className="res-filter-select"
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(st => (
              <option key={st} value={st}>
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </option>
            ))}
          </select>

          <span className="res-filter-sep" aria-hidden="true" />

          {/* Date filter */}
          <input
            type="date"
            className="res-filter-date"
            value={filterDate}
            onChange={e => { setFilterDate(e.target.value); setPage(1) }}
          />

          {/* Clear filters */}
          {hasFilters && (
            <button
              className="btn-secondary"
              onClick={() => { setFilterStatus(''); setFilterDate(''); setSearch(''); setPage(1) }}
            >
              ✕ Clear
            </button>
          )}

          {/* Result count */}
          <span className="res-result-count">
            {visible.length} reservation{visible.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ══════════════════════════════════════════════
            TABLE SECTION
        ════════════════════════════════════════════════ */}
        <div className="admin-table-section">
          <h2>Reservations</h2>

          {/* Loading */}
          {loading ? (
            <div className="admin-loading">🍖 Loading reservations…</div>
          ) : visible.length === 0 ? (
            /* Empty state */
            <div className="empty-state">
              <div className="empty-state-icon">🪑</div>
              <p>No reservations found.</p>
            </div>
          ) : (
            <>
              {/* ── TABLE ── */}
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="res-col-guest"    scope="col">Guest</th>
                      <th className="res-col-contact"  scope="col">Contact</th>
                      <th className="res-col-date"     scope="col">Date</th>
                      <th className="res-col-time"     scope="col">Time</th>
                      <th className="res-col-guests"   scope="col">Guests</th>
                      <th className="res-col-occasion" scope="col">Occasion</th>
                      <th className="res-col-seating"  scope="col">Seating</th>
                      <th className="res-col-status"   scope="col">Status</th>
                      <th className="res-col-created"  scope="col">Created</th>
                      <th className="res-col-action"   scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map(r => (
                      <tr key={r._id} style={{ opacity: updating === r._id ? 0.6 : 1 }}>

                        {/* — Guest — */}
                        <td className="res-col-guest" data-label="Guest">
                          <span className="res-guest-name">
                            {r.firstName} {r.lastName}
                          </span>
                          {r.specialRequests && (
                            <span className="res-special-req" title={r.specialRequests}>
                              📝 Special request
                            </span>
                          )}
                        </td>

                        {/* — Contact — */}
                        <td className="res-col-contact" data-label="Contact">
                          <span className="res-contact-email">{r.email}</span>
                          <span className="res-contact-phone">{r.phone}</span>
                        </td>

                        {/* — Date — */}
                        <td className="res-col-date" data-label="Date">
                          {formatDate(r.date)}
                        </td>

                        {/* — Time — */}
                        <td className="res-col-time" data-label="Time">
                          {r.time}
                        </td>

                        {/* — Guests — */}
                        <td className="res-col-guests" data-label="Guests">
                          <span className="res-guest-count">
                            🪑 {r.guests}
                          </span>
                        </td>

                        {/* — Occasion — */}
                        <td className="res-col-occasion" data-label="Occasion">
                          {r.occasion && r.occasion !== 'none' ? r.occasion : '—'}
                        </td>

                        {/* — Seating — */}
                        <td className="res-col-seating" data-label="Seating">
                          {r.seatingPreference || '—'}
                        </td>

                        {/* — Status — */}
                        <td className="res-col-status" data-label="Status">
                          <select
                            className={`res-status-select ${r.status}`}
                            value={r.status}
                            disabled={updating === r._id}
                            onChange={e => handleStatusChange(r._id, e.target.value)}
                          >
                            {STATUS_OPTIONS.map(st => (
                              <option key={st} value={st}>
                                {st.charAt(0).toUpperCase() + st.slice(1)}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* — Created — */}
                        <td className="res-col-created" data-label="Created">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>

                        {/* — Actions — */}
                        <td className="res-col-action" data-label="Actions">
                          <div className="res-action-btns">
                            <button
                              className="res-btn-delete"
                              onClick={() => handleDelete(r._id)}
                              disabled={updating === r._id}
                            >
                              Delete
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── PAGINATION ── */}
              {totalPages > 1 && (
                <div className="res-pagination">
                  <span className="res-page-info">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="res-page-btn"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    ‹ Prev
                  </button>
                  <button
                    className="res-page-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>{/* /admin-container */}
    </div>/* /admin-dashboard */
  )
}

export default AdminReservations