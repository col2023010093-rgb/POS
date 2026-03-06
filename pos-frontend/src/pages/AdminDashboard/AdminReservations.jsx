import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
import './AdminDashboard.css'

const AdminReservations = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!user?.role || user?.role !== 'admin') {
      navigate('/')
      return
    }
    fetchReservations()
  }, [user, navigate])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const res = await api.getAdminReservations()
      const data = Array.isArray(res.data) ? res.data : (res.data?.reservations || [])
      setReservations(data)
    } catch (err) {
      console.error('Failed to fetch reservations:', err)
      setError(err.message || 'Failed to load reservations')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (reservationId, status) => {
    try {
      await api.updateReservationStatus(reservationId, status)
      setNotice(`Reservation status updated to "${status}"`)
      setTimeout(() => setNotice(''), 2500)
      fetchReservations()
    } catch (err) {
      console.error('Error updating reservation status:', err)
      setError(err.message || 'Failed to update reservation status')
    }
  }

  if (loading) return <div className="admin-loading">Loading reservations...</div>

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="dashboard-header">
          <h1>Reservation Management</h1>
          <p className="dashboard-subtitle">{reservations.length} total reservations</p>
        </div>

        {notice && <div className="admin-notice">{notice}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="admin-table-section">
          <h2>All Reservations</h2>
          {reservations.length === 0 ? (
            <p className="admin-loading">No reservations found</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
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
                        onChange={(e) => handleStatusUpdate(res._id, e.target.value)}
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
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminReservations