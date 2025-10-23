import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminUsers: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const usersData = response.data;
      setUsers(usersData);
      
      // Calculate stats
      const stats = {
        totalUsers: usersData.length,
        activeUsers: usersData.filter(user => user.status === 'active').length,
        inactiveUsers: usersData.filter(user => user.status === 'inactive').length,
        adminUsers: usersData.filter(user => user.role === 'admin').length
      };
      setUserStats(stats);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    setFilteredUsers(filtered);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
      
      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(users.filter(user => user._id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const StatCard = ({ title, value, icon, color, bgColor }) => (
    <div style={{
      background: bgColor,
      padding: '24px',
      borderRadius: '16px',
      border: `2px solid ${color}20`,
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        background: color,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px'
      }}>
        {icon}
      </div>
      <div>
        <h3 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          margin: 0,
          color: '#1f2937'
        }}>
          {value}
        </h3>
        <p style={{ 
          color: '#6b7280', 
          margin: 0,
          fontSize: '14px'
        }}>
          {title}
        </p>
      </div>
    </div>
  );

  const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{ margin: 0, color: '#1f2937' }}>User Details</h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ fontWeight: '600', color: '#374151' }}>Name</label>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>{user.name || 'N/A'}</p>
            </div>
            
            <div>
              <label style={{ fontWeight: '600', color: '#374151' }}>Email</label>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>{user.email || 'N/A'}</p>
            </div>
            
            <div>
              <label style={{ fontWeight: '600', color: '#374151' }}>Role</label>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>{user.role || 'user'}</p>
            </div>
            
            <div>
              <label style={{ fontWeight: '600', color: '#374151' }}>Status</label>
              <span style={{
                display: 'inline-block',
                marginTop: '4px',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                background: user.status === 'active' ? '#dcfce7' : '#fee2e2',
                color: user.status === 'active' ? '#16a34a' : '#dc2626'
              }}>
                {user.status || 'inactive'}
              </span>
            </div>
            
            <div>
              <label style={{ fontWeight: '600', color: '#374151' }}>Created At</label>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        marginLeft: '280px',
        padding: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginLeft: '280px', padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#1f2937',
          margin: '0 0 8px 0'
        }}>
          User Management
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Manage system users and their permissions
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        <StatCard
          title="Total Users"
          value={userStats.totalUsers}
          icon="👥"
          color="#3b82f6"
          bgColor="#dbeafe"
        />
        <StatCard
          title="Active Users"
          value={userStats.activeUsers}
          icon="✅"
          color="#10b981"
          bgColor="#d1fae5"
        />
        <StatCard
          title="Inactive Users"
          value={userStats.inactiveUsers}
          icon="⏸️"
          color="#f59e0b"
          bgColor="#fef3c7"
        />
        <StatCard
          title="Admin Users"
          value={userStats.adminUsers}
          icon="👑"
          color="#8b5cf6"
          bgColor="#ede9fe"
        />
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Search Users
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Users</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: 0, color: '#1f2937' }}>
            Users ({filteredUsers.length})
          </h3>
        </div>

        {filteredUsers.length === 0 ? (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
            <p>No users found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                    User
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                    Email
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                    Role
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                    Status
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                    Joined
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user._id || index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: '#3b82f6',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1f2937' }}>
                            {user.name || 'Unnamed User'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            ID: {user._id ? user._id.slice(-8) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>
                      {user.email || 'No email'}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: user.role === 'admin' ? '#ede9fe' : '#f3f4f6',
                        color: user.role === 'admin' ? '#8b5cf6' : '#6b7280'
                      }}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: user.status === 'active' ? '#dcfce7' : '#fee2e2',
                        color: user.status === 'active' ? '#16a34a' : '#dc2626'
                      }}>
                        {user.status || 'inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                          style={{
                            padding: '6px 12px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleStatusChange(
                            user._id, 
                            user.status === 'active' ? 'inactive' : 'active'
                          )}
                          style={{
                            padding: '6px 12px',
                            background: user.status === 'active' ? '#f59e0b' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
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
        )}
      </div>

      {/* User Details Modal */}
      {showModal && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminUserManagement;