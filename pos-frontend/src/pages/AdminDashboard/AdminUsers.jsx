import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
import './AdminDashboard.css'

const AdminUsers = () => {
  const navigate      = useNavigate()
  const { user }      = useAuth()
  const [users,       setUsers]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [notice,      setNotice]      = useState('')
  const [search,      setSearch]      = useState('')
  const [filterRole,  setFilterRole]  = useState('')
  const [confirmId,   setConfirmId]   = useState(null) // id to delete

  useEffect(() => {
    if (!user?.role || user?.role !== 'admin') { navigate('/'); return }
    fetchUsers()
  }, [user, navigate])

  const fetchUsers = async () => {
    setLoading(true); setError(null)
    try {
      const res  = await api.getAllUsers()
      const data = Array.isArray(res.data) ? res.data : (res.data?.users || [])
      setUsers(data)
    } catch (err) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const showNotice = msg => { setNotice(msg); setTimeout(() => setNotice(''), 3000) }

  const handleDeleteUser = async () => {
    if (!confirmId) return
    try {
      await api.deleteUser(confirmId)
      setUsers(prev => prev.filter(u => u._id !== confirmId))
      showNotice('✅ User deleted successfully')
    } catch (err) {
      setError('Failed to delete user: ' + err.message)
    } finally {
      setConfirmId(null)
    }
  }

  /* ── helpers ── */
  const initials = u =>
    `${(u.firstName || '')[0] || ''}${(u.lastName || '')[0] || ''}`.toUpperCase() || '?'

  /* ── filtered list ── */
  const visible = useMemo(() => {
    let list = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (filterRole) list = list.filter(u => u.role === filterRole)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(u =>
        (`${u.firstName} ${u.lastName}`).toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q)
      )
    }
    return list
  }, [users, filterRole, search])

  const roles     = [...new Set(users.map(u => u.role).filter(Boolean))]
  const confirmUser = users.find(u => u._id === confirmId)

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-container">
          <div className="admin-loading">🔥 Loading user roster…</div>
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
            <h1>User Management</h1>
            <p className="dashboard-subtitle">{users.length} registered guests & crew</p>
          </div>
          <button className="btn-secondary" onClick={fetchUsers}>↻ Refresh</button>
        </div>

        {notice && <div className="admin-notice">{notice}</div>}
        {error  && <div className="error-message">⚠ {error}</div>}

        {/* ── Role filter tabs ── */}
        <div className="admin-tabs">
          <button className={filterRole === '' ? 'active' : ''} onClick={() => setFilterRole('')}>
            All ({users.length})
          </button>
          {roles.map(r => (
            <button key={r} className={filterRole === r ? 'active' : ''} onClick={() => setFilterRole(r)}>
              {r.charAt(0).toUpperCase() + r.slice(1)} ({users.filter(u => u.role === r).length})
            </button>
          ))}
        </div>

        {/* ── Search bar ── */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by name, email, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 220 }}
          />
          {(search || filterRole) && (
            <button className="btn-secondary" onClick={() => { setSearch(''); setFilterRole('') }}>
              ✕ Clear
            </button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--brand-tan)', fontWeight: 600 }}>
            {visible.length} result{visible.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Table ── */}
        <div className="admin-table-section">
          <h2>All Users</h2>

          {visible.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🤠</div>
              <p>No users match your search.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div className="user-avatar">{initials(u)}</div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--brand-dark)' }}>
                              {u.firstName} {u.lastName}
                            </div>
                            {u._id === user?._id && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--brand-copper)', fontWeight: 600 }}>
                                (You)
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--brand-tan)' }}>{u.email}</td>
                      <td>{u.phone || <span style={{ color: 'var(--brand-tan)', fontSize: '0.82rem' }}>—</span>}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>{u.role}</span>
                      </td>
                      <td>
                        {new Date(u.createdAt).toLocaleDateString('en-PH', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>
                      <td>
                        {u._id !== user?._id ? (
                          <button className="btn-delete" onClick={() => setConfirmId(u._id)}>
                            Delete
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--brand-tan)', fontStyle: 'italic' }}>
                            Current admin
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ── Delete Confirm Modal ── */}
      {confirmId && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setConfirmId(null)}>
          <div className="modal-card" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button className="modal-close" onClick={() => setConfirmId(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="confirm-body">
                <div className="confirm-icon">🗑️</div>
                <p>
                  Are you sure you want to permanently delete{' '}
                  <strong>{confirmUser?.firstName} {confirmUser?.lastName}</strong>?
                  <br />
                  <span style={{ fontSize: '0.85rem', color: 'var(--brand-tan)' }}>
                    This action cannot be undone.
                  </span>
                </p>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setConfirmId(null)}>Cancel</button>
                <button className="btn-delete"    onClick={handleDeleteUser}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers