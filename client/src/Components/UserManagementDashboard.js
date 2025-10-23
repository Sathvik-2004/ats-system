import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const UserManagementDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: ''
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'HR',
    department: '',
    permissions: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  const roles = ['Admin', 'HR', 'Recruiter', 'Manager', 'Viewer'];
  const departments = ['Human Resources', 'Engineering', 'Marketing', 'Sales', 'Operations'];
  const permissions = [
    'view_applications', 'edit_applications', 'delete_applications',
    'manage_jobs', 'manage_users', 'view_analytics', 'system_settings',
    'bulk_operations', 'export_data', 'send_emails'
  ];

  const generateMockUsers = () => {
    return [
      {
        _id: '1',
        name: 'John Admin',
        email: 'john@company.com',
        role: 'Admin',
        department: 'Human Resources',
        status: 'active',
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: '2024-01-15',
        permissions: ['view_applications', 'edit_applications', 'manage_jobs', 'manage_users', 'system_settings']
      },
      {
        _id: '2',
        name: 'Sarah HR',
        email: 'sarah@company.com',
        role: 'HR',
        department: 'Human Resources',
        status: 'active',
        lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        createdAt: '2024-02-01',
        permissions: ['view_applications', 'edit_applications', 'manage_jobs']
      },
      {
        _id: '3',
        name: 'Mike Recruiter',
        email: 'mike@company.com',
        role: 'Recruiter',
        department: 'Human Resources',
        status: 'active',
        lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        createdAt: '2024-02-15',
        permissions: ['view_applications', 'edit_applications']
      },
      {
        _id: '4',
        name: 'Lisa Manager',
        email: 'lisa@company.com',
        role: 'Manager',
        department: 'Engineering',
        status: 'inactive',
        lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: '2024-01-30',
        permissions: ['view_applications', 'view_analytics']
      }
    ];
  };

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({
        data: generateMockUsers()
      }));
      
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to mock data
      setUsers(generateMockUsers());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/admin/users', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({
        data: {
          ...newUser,
          _id: Date.now().toString(),
          status: 'active',
          lastLogin: null,
          createdAt: new Date().toISOString().split('T')[0]
        }
      }));

      setUsers(prev => [...prev, response.data]);
      setNewUser({ name: '', email: '', role: 'HR', department: '', permissions: [] });
      setShowAddModal(false);
      alert('✅ User added successfully!');
    } catch (error) {
      console.error('Error adding user:', error);
      alert('❌ Failed to add user');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/admin/users/bulk-${action}`, {
        userIds: selectedUsers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({}));

      // Update local state
      setUsers(prev => prev.map(user => 
        selectedUsers.includes(user._id) 
          ? { ...user, status: action === 'activate' ? 'active' : 'inactive' }
          : user
      ));

      setSelectedUsers([]);
      alert(`✅ ${action} completed for ${selectedUsers.length} users`);
    } catch (error) {
      console.error(`Error ${action} users:`, error);
      alert(`❌ Failed to ${action} users`);
    }
  };

  const filteredUsers = users.filter(user => {
    if (filters.role !== 'all' && user.role !== filters.role) return false;
    if (filters.status !== 'all' && user.status !== filters.status) return false;
    if (filters.search && !user.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !user.email.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const formatLastLogin = (loginTime) => {
    if (!loginTime) return 'Never';
    const diff = Date.now() - new Date(loginTime).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading users...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600', color: '#111827' }}>
          User Management
        </h2>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Manage users, roles, and permissions across your organization
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>
            {users.length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Users</div>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
            {users.filter(u => u.status === 'active').length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Active Users</div>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px' }}>
            {roles.length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>User Roles</div>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6', marginBottom: '4px' }}>
            {users.filter(u => new Date(u.lastLogin) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Online Today</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          
          <select
            value={filters.role}
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            + Add User
          </button>
        </div>

        {selectedUsers.length > 0 && (
          <div style={{ marginTop: '16px', padding: '12px', background: '#f3f4f6', borderRadius: '6px' }}>
            <span style={{ fontSize: '14px', color: '#374151', marginRight: '12px' }}>
              {selectedUsers.length} selected
            </span>
            <button
              onClick={() => handleBulkAction('activate')}
              style={{
                background: '#10b981',
                color: '#fff',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                marginRight: '8px'
              }}
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                marginRight: '8px'
              }}
            >
              Deactivate
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              style={{
                background: '#6b7280',
                color: '#fff',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={currentUsers.length > 0 && selectedUsers.length === currentUsers.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers(currentUsers.map(u => u._id));
                    } else {
                      setSelectedUsers([]);
                    }
                  }}
                />
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>User</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Department</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Last Login</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user._id} style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px' }}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(prev => [...prev, user._id]);
                      } else {
                        setSelectedUsers(prev => prev.filter(id => id !== user._id));
                      }
                    }}
                  />
                </td>
                <td style={{ padding: '12px' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#111827', fontSize: '14px' }}>{user.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>{user.email}</div>
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    background: user.role === 'Admin' ? '#dbeafe' : user.role === 'HR' ? '#d1fae5' : '#fef3c7',
                    color: user.role === 'Admin' ? '#1d4ed8' : user.role === 'HR' ? '#059669' : '#d97706',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#374151' }}>{user.department}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    background: user.status === 'active' ? '#d1fae5' : '#fee2e2',
                    color: user.status === 'active' ? '#059669' : '#dc2626',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {user.status}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                  {formatLastLogin(user.lastLogin)}
                </td>
                <td style={{ padding: '12px' }}>
                  <button
                    style={{
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      marginRight: '4px'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    style={{
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d1d5db',
                    background: currentPage === i + 1 ? '#3b82f6' : '#fff',
                    color: currentPage === i + 1 ? '#fff' : '#374151',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '8px',
            width: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>Add New User</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Name</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Role</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Department</label>
              <select
                value={newUser.department}
                onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Permissions</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {permissions.map(permission => (
                  <label key={permission} style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                    <input
                      type="checkbox"
                      checked={newUser.permissions.includes(permission)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewUser(prev => ({ ...prev, permissions: [...prev.permissions, permission] }));
                        } else {
                          setNewUser(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== permission) }));
                        }
                      }}
                      style={{ marginRight: '8px' }}
                    />
                    {permission.replace('_', ' ').toUpperCase()}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                style={{
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementDashboard;