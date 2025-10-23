import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const JobSearchDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    experience: ''
  });

  const filterJobs = useCallback(() => {
    if (!jobs || jobs.length === 0) {
      setFilteredJobs([]);
      return;
    }
    
    let filtered = jobs.filter(job =>
      job && (
        (job.title && job.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.company && job.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );

    if (filters.type) {
      filtered = filtered.filter(job => job.type === filters.type);
    }
    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location && job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, filters]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchTerm, filters, jobs, filterJobs]);

  const fetchJobs = async () => {
    try {
      console.log('📡 Fetching jobs from API...');
      const response = await axios.get('http://localhost:5000/api/jobs');
      console.log('📡 Jobs API Response:', response.data);
      console.log(`✅ Successfully fetched ${response.data.length} jobs`);
      
      setJobs(response.data);
      setFilteredJobs(response.data);
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      if (error.response) {
        console.error('❌ Error response:', error.response.data);
        console.error('❌ Error status:', error.response.status);
      }
      toast.error('Failed to fetch jobs - Server may be offline');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApply = async (jobId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('email', userData.email);
      formData.append('jobId', jobId);
      
      // For quick apply, we'll need to handle resume separately
      toast.info('Redirecting to application form...');
      window.location.href = '/user-dashboard';
    } catch (error) {
      toast.error('Please complete your profile first');
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
          🔍
        </div>
        <p style={{ color: '#4b5563', fontSize: '18px', fontWeight: 600 }}>
          Loading available jobs...
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
            gap: '20px',
            marginBottom: '32px',
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
              🔍
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: 40,
                fontWeight: 700,
                marginBottom: '8px',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}>
                Job Search
              </h1>
              <p style={{
                margin: 0,
                fontSize: 18,
                opacity: 0.9,
                fontWeight: 300,
              }}>
                Find your perfect career opportunity
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto auto',
            gap: '16px',
            alignItems: 'end',
          }}>
            <div>
              <input
                type="text"
                placeholder="Search jobs, companies, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '16px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                }}
              />
            </div>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
              }}
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                width: '150px',
              }}
            />
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ type: '', location: '', experience: '' });
              }}
              style={{
                padding: '16px 24px',
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h2 style={{
            color: '#1f2937',
            fontWeight: 700,
            fontSize: '24px',
            margin: 0,
          }}>
            {filteredJobs.length} Jobs Found
          </h2>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>Sort by:</span>
            <select style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              background: '#fff',
            }}>
              <option>Latest</option>
              <option>Relevance</option>
              <option>Salary</option>
            </select>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gap: '20px',
        }}>
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                transition: 'all 0.3s',
                cursor: 'pointer',
                border: '1px solid #f1f5f9',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)';
                e.target.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px',
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    color: '#1f2937',
                    fontWeight: 700,
                    fontSize: '20px',
                    margin: '0 0 8px 0',
                  }}>
                    {job.title || 'Job Title Not Available'}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '12px',
                  }}>
                    <span style={{
                      color: '#667eea',
                      fontWeight: 600,
                      fontSize: '16px',
                    }}>
                      🏢 {job.company || 'Infinira Tech'}
                    </span>
                    <span style={{
                      color: '#6b7280',
                      fontSize: '14px',
                    }}>
                      📍 {job.location || 'Remote'}
                    </span>
                    <span style={{
                      background: '#f0fdf4',
                      color: '#16a34a',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}>
                      💼 {job.type || 'Full-time'}
                    </span>
                  </div>
                  <p style={{
                    color: '#4b5563',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {job.description ? job.description.substring(0, 200) + '...' : 'No description available'}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  alignItems: 'flex-end',
                }}>
                  <div style={{
                    background: '#fef3c7',
                    color: '#d97706',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}>
                    💰 {job.salary || '$80k - $120k'}
                  </div>
                  <button
                    onClick={() => handleQuickApply(job._id)}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '14px',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    🚀 Quick Apply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{
              color: '#1f2937',
              fontWeight: 600,
              fontSize: '20px',
              marginBottom: '8px',
            }}>No Jobs Found</h3>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
            }}>Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearchDashboard;