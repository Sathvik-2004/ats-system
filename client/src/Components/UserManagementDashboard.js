import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './UserManagementDashboard.css';
import { toast } from 'react-toastify';
import LoadingSpinner from './common/LoadingSpinner';
import RequestErrorState from './common/RequestErrorState';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const UserManagementDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'candidate', password: 'password123' });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState('');

  const authConfig = useMemo(() => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const fetchUsers = async () => {
    try {
      setError('');
      const response = await axios.get(`${API_URL}/api/users`, authConfig);
      setUsers(response.data?.data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Users fetch error:', error);
      const message = error?.response?.data?.message || 'Failed to load users';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 20000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = !search || `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase());
    const normalizedRole = user.role === 'user' ? 'candidate' : user.role;
    const matchesRole = roleFilter === 'all' || normalizedRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const createUser = async () => {
    try {
      await axios.post(`${API_URL}/api/users`, newUser, authConfig);
      setNewUser({ name: '', email: '', role: 'candidate', password: 'password123' });
      await fetchUsers();
      toast.success('User created');
    } catch (error) {
      console.error('Create user error:', error);
      toast.error(error?.response?.data?.message || 'Failed to create user');
    }
  };

  const changeRole = async (id, role) => {
    try {
      await axios.put(`${API_URL}/api/users/${id}/role`, { role }, authConfig);
      await fetchUsers();
    } catch (error) {
      console.error('Role update error:', error);
      toast.error(error?.response?.data?.message || 'Failed to update role');
    }
  };

  const toggleActive = async (id, isActive) => {
    try {
      await axios.put(`${API_URL}/api/users/${id}/active`, { isActive }, authConfig);
      await fetchUsers();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error?.response?.data?.message || 'Failed to update user status');
    }
  };

  const bulkUpdate = async (isActive) => {
    if (selectedUsers.length === 0) return;
    try {
      await axios.post(`${API_URL}/api/users/bulk/active`, { userIds: selectedUsers, isActive }, authConfig);
      setSelectedUsers([]);
      await fetchUsers();
    } catch (error) {
      console.error('Bulk update error:', error);
      toast.error(error?.response?.data?.message || 'Bulk update failed');
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading users..." />;
  }

  return (
    <div className="umd-page">
      <h2 className="umd-title">User Management</h2>
      <p className="umd-subtitle">Real-time user role and activation management.</p>

      <div className="umd-controls-row">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users" className="umd-input" />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="umd-input">
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="recruiter">Recruiter</option>
          <option value="candidate">Candidate</option>
        </select>
        <button onClick={() => bulkUpdate(true)} className="umd-btn umd-btn-success">Bulk Activate</button>
        <button onClick={() => bulkUpdate(false)} className="umd-btn umd-btn-danger">Bulk Deactivate</button>
        <button onClick={fetchUsers} className="umd-btn umd-btn-secondary">Refresh</button>
        <span className="umd-updated">Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}</span>
      </div>

      <div className="umd-create-grid">
        <input className="umd-input" value={newUser.name} onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))} placeholder="Name" />
        <input className="umd-input" value={newUser.email} onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" />
        <select className="umd-input" value={newUser.role} onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}>
          <option value="candidate">Candidate</option>
          <option value="recruiter">Recruiter</option>
          <option value="admin">Admin</option>
        </select>
        <input className="umd-input" value={newUser.password} onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))} placeholder="Password" />
        <button onClick={createUser} className="umd-btn umd-btn-primary">Add</button>
      </div>

      {error && <RequestErrorState compact message={error} onRetry={fetchUsers} />}

      <div className="umd-table-wrap">
        <table className="umd-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                  onChange={(e) => setSelectedUsers(e.target.checked ? filteredUsers.map((u) => u._id) : [])}
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={(e) => setSelectedUsers((prev) => e.target.checked ? [...prev, user._id] : prev.filter((id) => id !== user._id))}
                  />
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select className="umd-input" value={user.role === 'user' ? 'candidate' : user.role} onChange={(e) => changeRole(user._id, e.target.value)}>
                    <option value="candidate">Candidate</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => toggleActive(user._id, user.isActive === false)} className="umd-btn umd-btn-secondary">
                    {user.isActive === false ? 'Activate' : 'Deactivate'}
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan={5}><div className="umd-empty-state">No users found.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementDashboard;
