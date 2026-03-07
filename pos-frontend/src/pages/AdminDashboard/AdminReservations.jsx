import React, { useState, useEffect, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || ''

const STATUS_COLORS = {
  pending:   { bg: '#fff3cd', text: '#856404', border: '#ffc107' },
  confirmed: { bg: '#d1e7dd', text: '#0a5c36', border: '#198754' },
  cancelled: { bg: '#f8d7da', text: '#842029', border: '#dc3545' },
  completed: { bg: '#cff4fc', text: '#055160', border: '#0dcaf0' },
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled', 'completed']

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
}

const Badge = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'capitalize',
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
    }}>
      {status}
    </span>
  )
}

const AdminReservations = () => {
  const [reservations, setReservations] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [updating,     setUpdating]     = useState(null) // id of item being updated

  // Filters
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate,   setFilterDate]   = useState('')
  const [search,       setSearch]       = useState('')

  // Pagination
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const LIMIT = 15

  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

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

      // Support both { reservations, pagination } and plain array responses
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

  // ── Client-side search filter (name / email / phone) ──────────────────────
  const visible = reservations.filter(r => {
    if (!search.trim()) return true
    const q   = search.toLowerCase()
    const name = `${r.firstName} ${r.lastName}`.toLowerCase()
    return (
      name.includes(q)          ||
      r.email?.toLowerCase().includes(q) ||
      r.phone?.includes(q)
    )
  })

  // ── Styles ─────────────────────────────────────────────────────────────────
  const s = {
    wrap:     { padding: '24px', fontFamily: 'inherit' },
    header:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
    title:    { fontSize: 22, fontWeight: 700, margin: 0 },
    filters:  { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 },
    input:    { padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, minWidth: 160 },
    select:   { padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 },
    table:    { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
    th:       { textAlign: 'left', padding: '10px 12px', background: '#f8f9fa', fontWeight: 600, borderBottom: '2px solid #e9ecef', whiteSpace: 'nowrap' },
    td:       { padding: '10px 12px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' },
    statusSel:{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, cursor: 'pointer' },
    delBtn:   { padding: '4px 10px', borderRadius: 6, background: '#fff0f0', border: '1px solid #f5c2c7', color: '#dc3545', fontSize: 12, cursor: 'pointer', fontWeight: 600 },
    pager:    { display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, justifyContent: 'flex-end' },
    pgBtn:    { padding: '6px 14px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer', fontSize: 13 },
    empty:    { textAlign: 'center', padding: 40, color: '#888' },
    err:      { background: '#fff5f5', border: '1px solid #f5c6cb', borderRadius: 8, padding: 16, color: '#842029', marginBottom: 16 },
  }

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <h2 style={s.title}>Reservations</h2>
        <button style={{ ...s.pgBtn, background: '#f0fdf4', borderColor: '#86efac', color: '#166534' }}
          onClick={fetchReservations}>
          ↻ Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={s.filters}>
        <input
          style={s.input} type="text" placeholder="Search name, email, phone…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select style={s.select} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(st => (
            <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>
          ))}
        </select>
        <input
          style={s.input} type="date" value={filterDate}
          onChange={e => { setFilterDate(e.target.value); setPage(1) }}
        />
        {(filterStatus || filterDate || search) && (
          <button style={{ ...s.pgBtn, color: '#666' }} onClick={() => { setFilterStatus(''); setFilterDate(''); setSearch(''); setPage(1) }}>
            ✕ Clear
          </button>
        )}
      </div>

      {error && <div style={s.err}>⚠ {error}</div>}

      {loading ? (
        <div style={s.empty}>Loading reservations…</div>
      ) : visible.length === 0 ? (
        <div style={s.empty}>No reservations found.</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Guest', 'Contact', 'Date', 'Time', 'Guests', 'Occasion', 'Seating', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map(r => (
                  <tr key={r._id} style={{ opacity: updating === r._id ? 0.6 : 1 }}>
                    <td style={s.td}>
                      <strong>{r.firstName} {r.lastName}</strong>
                      {r.specialRequests && (
                        <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}
                          title={r.specialRequests}>
                          📝 Special request
                        </div>
                      )}
                    </td>
                    <td style={s.td}>
                      <div>{r.email}</div>
                      <div style={{ color: '#666', fontSize: 12 }}>{r.phone}</div>
                    </td>
                    <td style={{ ...s.td, whiteSpace: 'nowrap' }}>{formatDate(r.date)}</td>
                    <td style={{ ...s.td, whiteSpace: 'nowrap' }}>{r.time}</td>
                    <td style={{ ...s.td, textAlign: 'center' }}>{r.guests}</td>
                    <td style={s.td}>{r.occasion && r.occasion !== 'none' ? r.occasion : '—'}</td>
                    <td style={s.td}>{r.seatingPreference || '—'}</td>
                    <td style={s.td}>
                      <select
                        style={s.statusSel}
                        value={r.status}
                        disabled={updating === r._id}
                        onChange={e => handleStatusChange(r._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(st => (
                          <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ ...s.td, whiteSpace: 'nowrap', color: '#888', fontSize: 12 }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td style={s.td}>
                      <button style={s.delBtn} onClick={() => handleDelete(r._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={s.pager}>
              <span style={{ fontSize: 13, color: '#666' }}>Page {page} of {totalPages}</span>
              <button style={s.pgBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
              <button style={s.pgBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminReservations