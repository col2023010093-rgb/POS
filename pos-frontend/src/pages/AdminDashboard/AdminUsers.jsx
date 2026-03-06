import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import './AdminDashboard.css';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!user?.role || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getAllUsers();
      const data = Array.isArray(res.data) ? res.data : (res.data?.users || []);
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
      setNotice('User deleted successfully');
      setTimeout(() => setNotice(''), 2500);
    } catch (err) {
      setError('Failed to delete user: ' + err.message);
    }
  };

  if (loading) return <div className="admin-loading">Loading users...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="dashboard-header">
          <h1>User Management</h1>
          <p className="dashboard-subtitle">{users.length} registered users</p>
        </div>

        {notice && <div className="admin-notice">{notice}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="admin-table-section">
          <h2>All Users</h2>
          {users.length === 0 ? (
            <p className="admin-loading">No users found</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.firstName} {u.lastName}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '-'}</td>
                    <td>
                      <span className={`role-badge ${u.role}`}>{u.role}</span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-delete" onClick={() => handleDeleteUser(u._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;