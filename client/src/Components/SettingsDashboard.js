import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const SettingsDashboard = () => {
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      jobAlerts: true,
      applicationUpdates: true,
      weeklyDigest: false,
      marketingEmails: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowRecruiterContact: true,
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
    },
    jobAlerts: {
      enabled: true,
      keywords: ['Software Engineer', 'Developer', 'Frontend'],
      locations: ['Remote', 'New York', 'San Francisco'],
      salaryMin: 80000,
      salaryMax: 150000,
      jobTypes: ['Full-time', 'Contract'],
    }
  });
  const [loading, setLoading] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const loadSettings = useCallback(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleArrayAdd = (category, field, value, newValueState, setNewValueState) => {
    if (value.trim() && !settings[category][field].includes(value.trim())) {
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: [...prev[category][field], value.trim()]
        }
      }));
      setNewValueState('');
    }
  };

  const handleArrayRemove = (category, field, valueToRemove) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: prev[category][field].filter(item => item !== valueToRemove)
      }
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      localStorage.removeItem('userSettings');
      loadSettings();
      toast.info('Settings reset to default');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (window.confirm('This will permanently delete all your data. Type "DELETE" to confirm.')) {
        // In a real app, this would call an API to delete the account
        toast.error('Account deletion would be processed here');
      }
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' 
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '48px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              backdropFilter: 'blur(10px)',
            }}>
              ⚙️
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: 40,
                fontWeight: 700,
                marginBottom: '8px',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}>
                Settings
              </h1>
              <p style={{
                margin: 0,
                fontSize: 18,
                opacity: 0.9,
                fontWeight: 300,
              }}>
                Customize your experience and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px',
        display: 'grid',
        gap: '24px',
      }}>
        {/* Notification Settings */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{
            color: '#1f2937',
            fontWeight: 700,
            fontSize: '24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            🔔 Notification Settings
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}>
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}>
                <div>
                  <h4 style={{
                    color: '#1f2937',
                    fontWeight: 600,
                    margin: '0 0 4px 0',
                    fontSize: '16px',
                  }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h4>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    margin: 0,
                  }}>
                    {key === 'emailNotifications' && 'Receive notifications via email'}
                    {key === 'jobAlerts' && 'Get alerts for new job opportunities'}
                    {key === 'applicationUpdates' && 'Updates on your application status'}
                    {key === 'weeklyDigest' && 'Weekly summary of activities'}
                    {key === 'marketingEmails' && 'Promotional and marketing content'}
                  </p>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '60px',
                  height: '34px',
                }}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: value ? '#667eea' : '#ccc',
                    borderRadius: '34px',
                    transition: '0.4s',
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '',
                      height: '26px',
                      width: '26px',
                      left: value ? '30px' : '4px',
                      bottom: '4px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: '0.4s',
                    }}></span>
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{
            color: '#1f2937',
            fontWeight: 700,
            fontSize: '24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            🔒 Privacy Settings
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}>
            <div style={{
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}>
              <label style={{
                display: 'block',
                color: '#374151',
                fontWeight: 600,
                marginBottom: '8px',
                fontSize: '14px',
              }}>
                Profile Visibility
              </label>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  background: '#fff',
                }}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="recruiters">Recruiters Only</option>
              </select>
            </div>

            {['showEmail', 'showPhone', 'allowRecruiterContact'].map(key => (
              <div key={key} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}>
                <div>
                  <h4 style={{
                    color: '#1f2937',
                    fontWeight: 600,
                    margin: '0 0 4px 0',
                    fontSize: '16px',
                  }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h4>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    margin: 0,
                  }}>
                    {key === 'showEmail' && 'Display email in public profile'}
                    {key === 'showPhone' && 'Display phone number in public profile'}
                    {key === 'allowRecruiterContact' && 'Allow recruiters to contact you directly'}
                  </p>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '60px',
                  height: '34px',
                }}>
                  <input
                    type="checkbox"
                    checked={settings.privacy[key]}
                    onChange={(e) => handleSettingChange('privacy', key, e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: settings.privacy[key] ? '#667eea' : '#ccc',
                    borderRadius: '34px',
                    transition: '0.4s',
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '',
                      height: '26px',
                      width: '26px',
                      left: settings.privacy[key] ? '30px' : '4px',
                      bottom: '4px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: '0.4s',
                    }}></span>
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Job Alerts Settings */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{
            color: '#1f2937',
            fontWeight: 700,
            fontSize: '24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            🚨 Job Alert Settings
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
          }}>
            {/* Keywords */}
            <div>
              <h3 style={{
                color: '#1f2937',
                fontWeight: 600,
                fontSize: '18px',
                marginBottom: '16px',
              }}>
                Alert Keywords
              </h3>
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '16px',
              }}>
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Add keyword (e.g., React, Python)"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleArrayAdd('jobAlerts', 'keywords', newKeyword, newKeyword, setNewKeyword)}
                />
                <button
                  onClick={() => handleArrayAdd('jobAlerts', 'keywords', newKeyword, newKeyword, setNewKeyword)}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Add
                </button>
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                {settings.jobAlerts.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    style={{
                      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                      color: '#0369a1',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      border: '1px solid #bae6fd',
                    }}
                  >
                    {keyword}
                    <button
                      onClick={() => handleArrayRemove('jobAlerts', 'keywords', keyword)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0369a1',
                        cursor: 'pointer',
                        padding: '0',
                        fontSize: '16px',
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div>
              <h3 style={{
                color: '#1f2937',
                fontWeight: 600,
                fontSize: '18px',
                marginBottom: '16px',
              }}>
                Preferred Locations
              </h3>
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '16px',
              }}>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Add location (e.g., Remote, NYC)"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleArrayAdd('jobAlerts', 'locations', newLocation, newLocation, setNewLocation)}
                />
                <button
                  onClick={() => handleArrayAdd('jobAlerts', 'locations', newLocation, newLocation, setNewLocation)}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Add
                </button>
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                {settings.jobAlerts.locations.map((location, index) => (
                  <span
                    key={index}
                    style={{
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      color: '#16a34a',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    {location}
                    <button
                      onClick={() => handleArrayRemove('jobAlerts', 'locations', location)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#16a34a',
                        cursor: 'pointer',
                        padding: '0',
                        fontSize: '16px',
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Salary Range */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{
              color: '#1f2937',
              fontWeight: 600,
              fontSize: '18px',
              marginBottom: '16px',
            }}>
              Salary Range
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#374151',
                  fontWeight: 600,
                  marginBottom: '8px',
                  fontSize: '14px',
                }}>
                  Minimum Salary ($)
                </label>
                <input
                  type="number"
                  value={settings.jobAlerts.salaryMin}
                  onChange={(e) => handleSettingChange('jobAlerts', 'salaryMin', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  color: '#374151',
                  fontWeight: 600,
                  marginBottom: '8px',
                  fontSize: '14px',
                }}>
                  Maximum Salary ($)
                </label>
                <input
                  type="number"
                  value={settings.jobAlerts.salaryMax}
                  onChange={(e) => handleSettingChange('jobAlerts', 'salaryMax', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Account Management */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{
            color: '#1f2937',
            fontWeight: 700,
            fontSize: '24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            👤 Account Management
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              style={{
                background: loading 
                  ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                padding: '16px 24px',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}></div>
                  Saving...
                </>
              ) : (
                <>💾 Save Settings</>
              )}
            </button>

            <button
              onClick={handleResetSettings}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#fff',
                border: 'none',
                padding: '16px 24px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '16px',
              }}
            >
              🔄 Reset to Default
            </button>

            <button
              onClick={handleDeleteAccount}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#fff',
                border: 'none',
                padding: '16px 24px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '16px',
              }}
            >
              🗑️ Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Add animation keyframes */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default SettingsDashboard;