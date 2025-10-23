import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const ProfileDashboard = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    skills: [],
    experience: '',
    education: '',
    summary: '',
    linkedIn: '',
    github: '',
    portfolio: '',
    preferredJobType: '',
    expectedSalary: '',
    availability: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [profileCompletion, setProfileCompletion] = useState(0);

  const calculateCompletion = useCallback(() => {
    const fields = [
      'name', 'email', 'phone', 'location', 'experience', 
      'education', 'summary', 'preferredJobType'
    ];
    const completed = fields.filter(field => profile[field] && profile[field].length > 0).length;
    const skillsCompleted = profile.skills.length > 0 ? 1 : 0;
    const total = fields.length + 1; // +1 for skills
    setProfileCompletion(Math.round(((completed + skillsCompleted) / total) * 100));
  }, [profile]);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    calculateCompletion();
  }, [profile, calculateCompletion]);

  const loadProfile = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (userData) {
        setProfile(prev => ({
          ...prev,
          name: userData.name || '',
          email: userData.email || '',
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call - in real app, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update localStorage with new profile data
      const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedUserData = {
        ...currentUserData,
        ...profile
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        flexDirection: 'column',
        gap: '24px',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          animation: 'pulse 2s infinite',
        }}>
          👤
        </div>
        <p style={{ color: '#4b5563', fontSize: '18px', fontWeight: 600 }}>
          Loading your profile...
        </p>
      </div>
    );
  }

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
            justifyContent: 'space-between',
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
                👤
              </div>
              <div>
                <h1 style={{
                  margin: 0,
                  fontSize: 40,
                  fontWeight: 700,
                  marginBottom: '8px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                  Profile Management
                </h1>
                <p style={{
                  margin: 0,
                  fontSize: 18,
                  opacity: 0.9,
                  fontWeight: 300,
                }}>
                  Complete your profile to get better job matches
                </p>
              </div>
            </div>
            
            {/* Profile Completion Circle */}
            <div style={{
              position: 'relative',
              width: '120px',
              height: '120px',
            }}>
              <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#fff"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - profileCompletion / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  marginBottom: '4px',
                }}>
                  {profileCompletion}%
                </div>
                <div style={{
                  fontSize: '12px',
                  opacity: 0.8,
                }}>
                  Complete
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
        }}>
          {/* Left Column - Basic Info */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height: 'fit-content',
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
              📋 Basic Information
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#374151',
                  fontWeight: 600,
                  marginBottom: '8px',
                  fontSize: '14px',
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                  Email Address *
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    background: '#f9fafb',
                    color: '#6b7280',
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                  Location
                </label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State/Country"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                  Professional Summary
                </label>
                <textarea
                  value={profile.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="Brief description of your professional background..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    transition: 'border-color 0.3s',
                    resize: 'vertical',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Skills & Experience */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Skills Section */}
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
                🚀 Skills
              </h2>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '16px',
              }}>
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill (e.g., React, Python)"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <button
                  onClick={addSkill}
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
                {profile.skills.map((skill, index) => (
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
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
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

            {/* Experience & Education */}
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
                💼 Experience & Education
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    color: '#374151',
                    fontWeight: 600,
                    marginBottom: '8px',
                    fontSize: '14px',
                  }}>
                    Work Experience
                  </label>
                  <textarea
                    value={profile.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="Describe your work experience..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '16px',
                      transition: 'border-color 0.3s',
                      resize: 'vertical',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                    Education
                  </label>
                  <textarea
                    value={profile.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    placeholder="Your educational background..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '16px',
                      transition: 'border-color 0.3s',
                      resize: 'vertical',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links & Preferences */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          marginTop: '24px',
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
            🔗 Links & Preferences
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}>
            <div>
              <label style={{
                display: 'block',
                color: '#374151',
                fontWeight: 600,
                marginBottom: '8px',
                fontSize: '14px',
              }}>
                LinkedIn Profile
              </label>
              <input
                type="url"
                value={profile.linkedIn}
                onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  transition: 'border-color 0.3s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                GitHub Profile
              </label>
              <input
                type="url"
                value={profile.github}
                onChange={(e) => handleInputChange('github', e.target.value)}
                placeholder="https://github.com/yourusername"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  transition: 'border-color 0.3s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                Portfolio Website
              </label>
              <input
                type="url"
                value={profile.portfolio}
                onChange={(e) => handleInputChange('portfolio', e.target.value)}
                placeholder="https://yourportfolio.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  transition: 'border-color 0.3s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                Preferred Job Type
              </label>
              <select
                value={profile.preferredJobType}
                onChange={(e) => handleInputChange('preferredJobType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  background: '#fff',
                }}
              >
                <option value="">Select job type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#374151',
                fontWeight: 600,
                marginBottom: '8px',
                fontSize: '14px',
              }}>
                Expected Salary Range
              </label>
              <input
                type="text"
                value={profile.expectedSalary}
                onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                placeholder="e.g., $80k - $120k"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  transition: 'border-color 0.3s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                Availability
              </label>
              <select
                value={profile.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  background: '#fff',
                }}
              >
                <option value="">Select availability</option>
                <option value="Immediately">Immediately</option>
                <option value="2 weeks">2 weeks notice</option>
                <option value="1 month">1 month notice</option>
                <option value="2+ months">2+ months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '32px',
        }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saving 
                ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              padding: '16px 48px',
              borderRadius: '12px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '18px',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {saving ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}></div>
                Saving Profile...
              </>
            ) : (
              <>
                💾 Save Profile
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add animation keyframes */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>
    </div>
  );
};

export default ProfileDashboard;