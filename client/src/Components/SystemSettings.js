import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const SystemSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('autoProcessing');
  const [message, setMessage] = useState('');
  const [pendingUpdates, setPendingUpdates] = useState({});

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Debug: Admin token:', token ? 'Found' : 'Not found');
      
      if (!token) {
        setMessage('No admin token found. Please login first.');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Debug: Making API call to fetch settings...');
      const response = await axios.get('http://localhost:5000/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({
        data: {
          settings: generateMockSettings()
        }
      }));
      
      console.log('🔍 Debug: API response:', response.data);
      setSettings(response.data.settings);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      console.error('❌ Error response:', error.response?.data);
      setMessage('Failed to load settings, using defaults');
      // Fallback to mock settings
      setSettings(generateMockSettings());
      setLoading(false);
    }
  };

  const generateMockSettings = () => {
    return {
      autoProcessing: {
        enabled: true,
        approvalThreshold: 85,
        interviewThreshold: 70,
        rejectionThreshold: 40,
        autoNotifyApplicants: true,
        autoScheduleInterviews: false,
        processingDelay: 24
      },
      application: {
        maxFileSizeMB: 10,
        allowedFileTypes: ['pdf', 'doc', 'docx'],
        autoCloseAfterDays: 30,
        requireCoverLetter: false,
        allowMultipleApplications: false,
        sendConfirmationEmail: true
      },
      system: {
        companyInfo: {
          name: 'Your Company',
          website: 'https://company.com',
          address: '123 Business St, City, State',
          phone: '(555) 123-4567',
          email: 'hr@company.com'
        },
        emailSettings: {
          smtpHost: 'smtp.company.com',
          smtpPort: 587,
          smtpUser: 'noreply@company.com',
          smtpSecure: true,
          fromName: 'HR Team',
          fromEmail: 'hr@company.com'
        },
        backupSettings: {
          autoBackup: true,
          backupFrequency: 'daily',
          retentionDays: 30,
          backupLocation: 'local'
        }
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        notifyOnNewApplication: true,
        notifyOnStatusChange: true,
        digestFrequency: 'daily'
      }
    };
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Debounce function to prevent too many API calls
  const debounce = useCallback((func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  // Debounced API call
  const debouncedUpdateSettings = useCallback(
    debounce(async (section, data) => {
      setSaving(true);
      try {
        const token = localStorage.getItem('token');
        const updateData = { [section]: data };
        
        const response = await axios.put('http://localhost:5000/api/admin/settings', updateData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update with server response to ensure consistency
        setSettings(response.data.settings);
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Error updating settings:', error);
        setMessage('Failed to save settings: ' + (error.response?.data?.message || error.message));
        // Revert to original settings on error
        fetchSettings();
      } finally {
        setSaving(false);
      }
    }, 500),
    [fetchSettings]
  );

  const validateSettings = (section, data) => {
    const errors = [];
    
    switch (section) {
      case 'autoProcessing':
        if (data.approvalThreshold <= data.interviewThreshold) {
          errors.push('Approval threshold must be higher than interview threshold');
        }
        if (data.interviewThreshold <= data.rejectionThreshold) {
          errors.push('Interview threshold must be higher than rejection threshold');
        }
        if (data.rejectionThreshold < 0 || data.rejectionThreshold > 100) {
          errors.push('Thresholds must be between 0 and 100');
        }
        break;
        
      case 'application':
        if (data.maxFileSizeMB < 1 || data.maxFileSizeMB > 50) {
          errors.push('File size must be between 1MB and 50MB');
        }
        if (data.autoCloseAfterDays < 1 || data.autoCloseAfterDays > 365) {
          errors.push('Auto-close days must be between 1 and 365');
        }
        if (!data.allowedFileTypes || data.allowedFileTypes.length === 0) {
          errors.push('At least one file type must be allowed');
        }
        break;
        
      case 'system':
        if (data.companyInfo && !data.companyInfo.name.trim()) {
          errors.push('Company name is required');
        }
        break;
        
      default:
        // No validation needed for unknown sections
        break;
    }
    
    return errors;
  };

  // Immediate UI update function for checkboxes
  const handleCheckboxChange = (section, path, value) => {
    console.log(`🔄 Checkbox change: ${section}.${path} = ${value}`);
    
    // Update local state immediately for responsive UI
    setSettings(prev => {
      const updated = { ...prev };
      const pathParts = path.split('.');
      let current = updated[section] = { ...updated[section] };
      
      // Navigate to the nested property
      for (let i = 0; i < pathParts.length - 1; i++) {
        current[pathParts[i]] = { ...current[pathParts[i]] };
        current = current[pathParts[i]];
      }
      
      // Set the final value
      current[pathParts[pathParts.length - 1]] = value;
      
      console.log(`✅ Updated settings:`, updated[section]);
      return updated;
    });
    
    // Prepare data for API call
    const updatedSectionData = { ...settings[section] };
    const pathParts = path.split('.');
    let current = updatedSectionData;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = value;
    
    // Debounce the API call
    debouncedUpdateSettings(section, updatedSectionData);
  };

  const updateSettings = async (section, data) => {
    // Validate before saving
    const validationErrors = validateSettings(section, data);
    if (validationErrors.length > 0) {
      setMessage('Validation errors: ' + validationErrors.join(', '));
      return;
    }
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const updateData = { [section]: data };
      
      const response = await axios.put('http://localhost:5000/api/admin/settings', updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSettings(response.data.settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage('Failed to save settings: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    if (!window.confirm('Are you sure you want to reset all settings to default values?')) {
      return;
    }
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/admin/settings/reset', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSettings(response.data.settings);
      setMessage('Settings reset to default values');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error resetting settings:', error);
      setMessage('Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading settings...</div>
      </div>
    );
  }

  const tabs = [
    { key: 'autoProcessing', label: '🤖 Auto-Processing', icon: '⚙️' },
    { key: 'application', label: '📝 Applications', icon: '📋' },
    { key: 'email', label: '📧 Email & Notifications', icon: '✉️' },
    { key: 'security', label: '🔒 Security', icon: '🛡️' },
    { key: 'system', label: '🏢 System Preferences', icon: '⚙️' },
    { key: 'dataManagement', label: '💾 Data Management', icon: '📊' },
    { key: 'integrations', label: '🔗 Integrations', icon: '🔌' }
  ];

  const renderAutoProcessingSettings = () => {
    if (!settings?.autoProcessing) {
      return <div>Loading auto-processing settings...</div>;
    }
    
    return (
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '20px', color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>
          🤖 Auto-Processing Settings
        </h3>
        
        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={settings.autoProcessing.enabled || false}
                onChange={(e) => updateSettings('autoProcessing', {
                  ...settings.autoProcessing,
                  enabled: e.target.checked
                })}
                style={{ transform: 'scale(1.2)' }}
              />
              <span style={{ fontWeight: '500', color: '#374151' }}>Enable Auto-Processing</span>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                Approval Threshold
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.autoProcessing.approvalThreshold || 70}
                onChange={(e) => updateSettings('autoProcessing', {
                  ...settings.autoProcessing,
                  approvalThreshold: parseInt(e.target.value)
                })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                Interview Threshold
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.autoProcessing.interviewThreshold || 60}
                onChange={(e) => updateSettings('autoProcessing', {
                  ...settings.autoProcessing,
                  interviewThreshold: parseInt(e.target.value)
                })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                Rejection Threshold
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.autoProcessing.rejectionThreshold || 40}
                onChange={(e) => updateSettings('autoProcessing', {
                  ...settings.autoProcessing,
                  rejectionThreshold: parseInt(e.target.value)
                })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderApplicationSettings = () => {
    if (!settings?.application) {
      return <div>Loading application settings...</div>;
    }
    
    return (
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '20px', color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>
          📝 Application Settings
        </h3>
        
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                Max File Size (MB)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.application.maxFileSizeMB || 5}
                onChange={(e) => updateSettings('application', {
                  ...settings.application,
                  maxFileSizeMB: parseInt(e.target.value)
                })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                Auto Close After (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={settings.application.autoCloseAfterDays || 30}
                onChange={(e) => updateSettings('application', {
                  ...settings.application,
                  autoCloseAfterDays: parseInt(e.target.value)
                })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSystemSettings = () => {
    if (!settings?.system) {
      return <div>Loading system settings...</div>;
    }
    
    return (
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '20px', color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>
          🏢 System Preferences
        </h3>
        
        <div style={{ display: 'grid', gap: '25px' }}>
          <div>
            <h4 style={{ marginBottom: '15px', color: '#374151', fontSize: '16px', fontWeight: '600' }}>
              Company Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={settings.system.companyInfo?.name || ''}
                  onChange={(e) => updateSettings('system', {
                    ...settings.system,
                    companyInfo: { 
                      ...settings.system.companyInfo, 
                      name: e.target.value 
                    }
                  })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                  Website
                </label>
                <input
                  type="url"
                  value={settings.system.companyInfo?.website || ''}
                  onChange={(e) => updateSettings('system', {
                    ...settings.system,
                    companyInfo: { 
                      ...settings.system.companyInfo, 
                      website: e.target.value 
                    }
                  })}
                  placeholder="https://company.com"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmailSettings = () => {
    if (!settings?.email) {
      return <div>Loading email settings...</div>;
    }
    
    return (
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '20px', color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>
          📧 Email & Notification Settings
        </h3>
        
        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={settings.email.enabled || false}
                onChange={(e) => handleCheckboxChange('email', 'enabled', e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
              <span style={{ fontWeight: '500', color: '#374151' }}>Enable Email Notifications</span>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                SMTP Server
              </label>
              <input
                type="text"
                value={settings.email.smtp?.host || ''}
                onChange={(e) => updateSettings('email', {
                  ...settings.email,
                  smtp: { ...settings.email.smtp, host: e.target.value }
                })}
                placeholder="smtp.gmail.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                Port
              </label>
              <input
                type="number"
                value={settings.email.smtp?.port || 587}
                onChange={(e) => updateSettings('email', {
                  ...settings.email,
                  smtp: { ...settings.email.smtp, port: parseInt(e.target.value) }
                })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                SMTP Username
              </label>
              <input
                type="text"
                value={settings.email.smtp?.username || ''}
                onChange={(e) => updateSettings('email', {
                  ...settings.email,
                  smtp: { ...settings.email.smtp, username: e.target.value }
                })}
                placeholder="your-email@gmail.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                SMTP Password
              </label>
              <input
                type="password"
                value={settings.email.smtp?.password || ''}
                onChange={(e) => updateSettings('email', {
                  ...settings.email,
                  smtp: { ...settings.email.smtp, password: e.target.value }
                })}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: '10px', color: '#374151', fontSize: '16px', fontWeight: '600' }}>
              Notification Types
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { key: 'newApplication', label: 'New Applications' },
                { key: 'systemAlerts', label: 'System Alerts' },
                { key: 'weeklyReport', label: 'Weekly Reports' }
              ].map(notif => (
                <label key={notif.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={settings.email.adminNotifications?.[notif.key] || false}
                    onChange={(e) => updateSettings('email', {
                      ...settings.email,
                      adminNotifications: {
                        ...settings.email.adminNotifications,
                        [notif.key]: e.target.checked
                      }
                    })}
                  />
                  <span style={{ fontSize: '14px', color: '#374151' }}>
                    {notif.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSecuritySettings = () => {
    if (!settings?.security) {
      return <div>Loading security settings...</div>;
    }
    
    return (
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '20px', color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>
          🔒 Security Settings
        </h3>
        
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                Password Min Length
              </label>
              <input
                type="number"
                min="6"
                max="32"
                value={settings.security.passwordRequirements?.minLength || 8}
                onChange={(e) => updateSettings('security', {
                  ...settings.security,
                  passwordRequirements: {
                    ...settings.security.passwordRequirements,
                    minLength: parseInt(e.target.value)
                  }
                })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                Session Timeout (Minutes)
              </label>
              <input
                type="number"
                min="15"
                max="1440"
                value={settings.security.sessionTimeoutMinutes || 120}
                onChange={(e) => updateSettings('security', {
                  ...settings.security,
                  sessionTimeoutMinutes: parseInt(e.target.value)
                })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: '10px', color: '#374151', fontSize: '16px', fontWeight: '600' }}>
              Password Requirements
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { key: 'requireUppercase', label: 'Require Uppercase' },
                { key: 'requireLowercase', label: 'Require Lowercase' },
                { key: 'requireNumbers', label: 'Require Numbers' },
                { key: 'requireSpecialChars', label: 'Require Special Characters' }
              ].map(req => (
                <label key={req.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={settings.security.passwordRequirements?.[req.key] || false}
                    onChange={(e) => {
                      handleCheckboxChange('security', `passwordRequirements.${req.key}`, e.target.checked);
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{req.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                checked={settings.security.twoFactorAuth || false}
                onChange={(e) => handleCheckboxChange('security', 'twoFactorAuth', e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
              <span style={{ fontWeight: '500', color: '#374151' }}>Enable Two-Factor Authentication</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderDataManagementSettings = () => {
    if (!settings?.dataManagement) {
      return <div>Loading data management settings...</div>;
    }
    
    return (
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '20px', color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>
          💾 Data Management Settings
        </h3>
        
        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={settings.dataManagement.backupSettings?.enabled || false}
                onChange={(e) => updateSettings('dataManagement', {
                  ...settings.dataManagement,
                  backupSettings: {
                    ...settings.dataManagement.backupSettings,
                    enabled: e.target.checked
                  }
                })}
                style={{ transform: 'scale(1.2)' }}
              />
              <span style={{ fontWeight: '500', color: '#374151' }}>Enable Automatic Backups</span>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                Backup Frequency
              </label>
              <select
                value={settings.dataManagement.backupSettings?.frequency || 'weekly'}
                onChange={(e) => updateSettings('dataManagement', {
                  ...settings.dataManagement,
                  backupSettings: {
                    ...settings.dataManagement.backupSettings,
                    frequency: e.target.value
                  }
                })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                Backup Retention (Days)
              </label>
              <input
                type="number"
                min="7"
                max="365"
                value={settings.dataManagement.backupSettings?.retentionDays || 30}
                onChange={(e) => updateSettings('dataManagement', {
                  ...settings.dataManagement,
                  backupSettings: {
                    ...settings.dataManagement.backupSettings,
                    retentionDays: parseInt(e.target.value)
                  }
                })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
              Data Retention Policy (Days)
            </label>
            <input
              type="number"
              min="30"
              max="2555"  
              value={settings.dataManagement.retentionPolicyDays || 365}
              onChange={(e) => updateSettings('dataManagement', {
                ...settings.dataManagement,
                retentionPolicyDays: parseInt(e.target.value)
              })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <h4 style={{ marginBottom: '10px', color: '#374151', fontSize: '16px', fontWeight: '600' }}>
              GDPR & Privacy
            </h4>
            <div style={{ display: 'grid', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={settings.dataManagement.gdprCompliance?.enabled || false}
                  onChange={(e) => updateSettings('dataManagement', {
                    ...settings.dataManagement,
                    gdprCompliance: {
                      ...settings.dataManagement.gdprCompliance,
                      enabled: e.target.checked
                    }
                  })}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>GDPR Compliance</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={settings.dataManagement.autoDeleteOldApplications || false}
                  onChange={(e) => updateSettings('dataManagement', {
                    ...settings.dataManagement,
                    autoDeleteOldApplications: e.target.checked
                  })}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>Auto-Delete Old Applications</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={settings.dataManagement.auditLogging || false}
                  onChange={(e) => updateSettings('dataManagement', {
                    ...settings.dataManagement,
                    auditLogging: e.target.checked
                  })}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>Enable Audit Logging</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderIntegrationsSettings = () => {
    if (!settings?.integrations) {
      return <div>Loading integrations settings...</div>;
    }
    
    return (
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '20px', color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>
          🔗 Integration Settings
        </h3>
        
        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <h4 style={{ marginBottom: '10px', color: '#374151', fontSize: '16px', fontWeight: '600' }}>
              Third-Party Services
            </h4>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
                  <input
                    type="checkbox"
                    checked={settings.integrations.jobBoards?.linkedin?.enabled || false}
                    onChange={(e) => updateSettings('integrations', {
                      ...settings.integrations,
                      jobBoards: {
                        ...settings.integrations.jobBoards,
                        linkedin: {
                          ...settings.integrations.jobBoards?.linkedin,
                          enabled: e.target.checked
                        }
                      }
                    })}
                  />
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                    LinkedIn Integration
                  </span>
                </label>
                <input
                  type="text"
                  value={settings.integrations.jobBoards?.linkedin?.apiKey || ''}
                  onChange={(e) => updateSettings('integrations', {
                    ...settings.integrations,
                    jobBoards: {
                      ...settings.integrations.jobBoards,
                      linkedin: {
                        ...settings.integrations.jobBoards?.linkedin,
                        apiKey: e.target.value
                      }
                    }
                  })}
                  placeholder="LinkedIn API Key"
                  disabled={!settings.integrations.jobBoards?.linkedin?.enabled}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: !settings.integrations.jobBoards?.linkedin?.enabled ? '#f9fafb' : '#fff'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
                  <input
                    type="checkbox"
                    checked={settings.integrations.jobBoards?.indeed?.enabled || false}
                    onChange={(e) => updateSettings('integrations', {
                      ...settings.integrations,
                      jobBoards: {
                        ...settings.integrations.jobBoards,
                        indeed: {
                          ...settings.integrations.jobBoards?.indeed,
                          enabled: e.target.checked
                        }
                      }
                    })}
                  />
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                    Indeed Integration
                  </span>
                </label>
                <input
                  type="text"
                  value={settings.integrations.jobBoards?.indeed?.apiKey || ''}
                  onChange={(e) => updateSettings('integrations', {
                    ...settings.integrations,
                    jobBoards: {
                      ...settings.integrations.jobBoards,
                      indeed: {
                        ...settings.integrations.jobBoards?.indeed,
                        apiKey: e.target.value
                      }
                    }
                  })}
                  placeholder="Indeed Publisher ID"
                  disabled={!settings.integrations.jobBoards?.indeed?.enabled}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: !settings.integrations.jobBoards?.indeed?.enabled ? '#f9fafb' : '#fff'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
                  <input
                    type="checkbox"
                    checked={settings.integrations.notifications?.slack?.enabled || false}
                    onChange={(e) => updateSettings('integrations', {
                      ...settings.integrations,
                      notifications: {
                        ...settings.integrations.notifications,
                        slack: {
                          ...settings.integrations.notifications?.slack,
                          enabled: e.target.checked
                        }
                      }
                    })}
                  />
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                    Slack Notifications
                  </span>
                </label>
                <input
                  type="text"
                  value={settings.integrations.notifications?.slack?.webhookUrl || ''}
                  onChange={(e) => updateSettings('integrations', {
                    ...settings.integrations,
                    notifications: {
                      ...settings.integrations.notifications,
                      slack: {
                        ...settings.integrations.notifications?.slack,
                        webhookUrl: e.target.value
                      }
                    }
                  })}
                  placeholder="Slack Webhook URL"
                  disabled={!settings.integrations.notifications?.slack?.enabled}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: !settings.integrations.notifications?.slack?.enabled ? '#f9fafb' : '#fff'
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: '10px', color: '#374151', fontSize: '16px', fontWeight: '600' }}>
              API Settings
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                  Calendar Integration
                </label>
                <select
                  value={settings.integrations.calendar?.provider || 'none'}
                  onChange={(e) => updateSettings('integrations', {
                    ...settings.integrations,
                    calendar: {
                      ...settings.integrations.calendar,
                      provider: e.target.value
                    }
                  })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="none">None</option>
                  <option value="google">Google Calendar</option>
                  <option value="outlook">Outlook Calendar</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={settings.integrations.analytics?.googleAnalytics?.enabled || false}
                    onChange={(e) => updateSettings('integrations', {
                      ...settings.integrations,
                      analytics: {
                        ...settings.integrations.analytics,
                        googleAnalytics: {
                          ...settings.integrations.analytics?.googleAnalytics,
                          enabled: e.target.checked
                        }
                      }
                    })}
                  />
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                    Google Analytics
                  </span>
                </label>
                {settings.integrations.analytics?.googleAnalytics?.enabled && (
                  <input
                    type="text"
                    value={settings.integrations.analytics?.googleAnalytics?.trackingId || ''}
                    onChange={(e) => updateSettings('integrations', {
                      ...settings.integrations,
                      analytics: {
                        ...settings.integrations.analytics,
                        googleAnalytics: {
                          ...settings.integrations.analytics?.googleAnalytics,
                          trackingId: e.target.value
                        }
                      }
                    })}
                    placeholder="GA Tracking ID"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      marginTop: '5px'
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'autoProcessing':
        return renderAutoProcessingSettings();
      case 'application':
        return renderApplicationSettings();
      case 'email':
        return renderEmailSettings();
      case 'security':
        return renderSecuritySettings();
      case 'system':
        return renderSystemSettings();
      case 'dataManagement':
        return renderDataManagementSettings();
      case 'integrations':
        return renderIntegrationsSettings();
      default:
        return renderAutoProcessingSettings();
    }
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          ⚙️ System Settings
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Configure system-wide settings and preferences
        </p>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '24px',
          background: message.includes('Failed') ? '#fee2e2' : '#d1fae5',
          color: message.includes('Failed') ? '#dc2626' : '#065f46',
          borderRadius: '8px',
          border: `1px solid ${message.includes('Failed') ? '#fecaca' : '#a7f3d0'}`
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Sidebar Navigation */}
        <div style={{
          width: '280px',
          background: '#fff',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          height: 'fit-content'
        }}>
          <h3 style={{ marginBottom: '16px', color: '#374151', fontSize: '16px', fontWeight: '600' }}>
            Settings Categories
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  border: 'none',
                  borderRadius: '6px',
                  background: activeTab === tab.key ? '#3b82f6' : 'transparent',
                  color: activeTab === tab.key ? '#fff' : '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab.key) {
                    e.target.style.background = '#f3f4f6';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.key) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={resetSettings}
              disabled={saving}
              style={{
                width: '100%',
                padding: '8px 16px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.5 : 1
              }}
            >
              🔄 Reset to Defaults
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: '600px' }}>
          {renderTabContent()}
          
          {saving && (
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 1000
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #e5e7eb',
                borderTop: '2px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span style={{ fontSize: '14px', color: '#374151' }}>Saving settings...</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SystemSettings;