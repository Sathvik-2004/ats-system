import React, { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import ApplicationsTable from './ApplicationsTable';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="admin-panel">
      {/* Navigation Tabs */}
      <nav className="admin-nav">
        <div className="nav-container">
          <h1 className="admin-logo">🎯 ATS Admin Panel</h1>
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              title="Analytics Dashboard"
            >
              📊 Dashboard
            </button>
            <button
              className={`nav-tab ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
              title="Applications Management"
            >
              📋 Applications
            </button>
            <button
              className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
              disabled
              title="Coming Soon"
            >
              ⚙️ Settings (Coming Soon)
            </button>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <div className="admin-content">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'applications' && <ApplicationsTable />}
        {activeTab === 'settings' && (
          <div className="settings-placeholder">
            <p>⚙️ Settings coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
