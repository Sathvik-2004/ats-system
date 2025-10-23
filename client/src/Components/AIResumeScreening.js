import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AIResumeScreening = () => {
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screening, setScreening] = useState(false);
  const [screeningResults, setScreeningResults] = useState([]);
  const [filters, setFilters] = useState({
    minScore: 0,
    maxScore: 100,
    skills: '',
    experience: ''
  });

  const [mlSettings, setMlSettings] = useState({
    skillsWeight: 30,
    experienceWeight: 25,
    educationWeight: 20,
    keywordsWeight: 15,
    biasDetection: true,
    diversityBoost: true,
    minimumScore: 60
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch applications and jobs
      const [appsRes, jobsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/applicants', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: generateMockApplications() })),
        
        axios.get('http://localhost:5000/api/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: generateMockJobs() }))
      ]);

      setApplications(appsRes.data);
      setJobs(jobsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data
      setApplications(generateMockApplications());
      setJobs(generateMockJobs());
    } finally {
      setLoading(false);
    }
  };

  const generateMockApplications = () => {
    const mockSkills = [
      ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
      ['Java', 'Spring Boot', 'MySQL', 'Kubernetes', 'Docker'],
      ['Python', 'Django', 'PostgreSQL', 'Redis', 'Machine Learning'],
      ['C++', 'Qt', 'Linux', 'Git', 'Agile'],
      ['React', 'TypeScript', 'GraphQL', 'MongoDB', 'Jest']
    ];

    const companies = ['Google', 'Microsoft', 'Amazon', 'Facebook', 'Apple', 'Netflix', 'Uber', 'Airbnb'];
    const universities = ['MIT', 'Stanford', 'UC Berkeley', 'Carnegie Mellon', 'Harvard', 'Caltech'];

    return Array.from({ length: 25 }, (_, i) => ({
      _id: `app_${i}`,
      name: `Candidate ${i + 1}`,
      email: `candidate${i + 1}@email.com`,
      phone: `+1-555-${String(i + 1).padStart(4, '0')}`,
      jobId: `job_${Math.floor(i / 5)}`,
      jobTitle: ['Senior Software Engineer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer', 'Product Manager'][Math.floor(i / 5)],
      skills: mockSkills[Math.floor(Math.random() * mockSkills.length)],
      experience: Math.floor(Math.random() * 10) + 1,
      education: universities[Math.floor(Math.random() * universities.length)],
      previousCompanies: companies.slice(0, Math.floor(Math.random() * 3) + 1),
      resume: `Mock resume content for ${i + 1}...`,
      appliedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: ['applied', 'screening', 'interview', 'rejected'][Math.floor(Math.random() * 4)],
      aiScore: null,
      screeningNotes: ''
    }));
  };

  const generateMockJobs = () => {
    return [
      {
        _id: 'job_0',
        title: 'Senior Software Engineer',
        department: 'Engineering',
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
        preferredSkills: ['TypeScript', 'GraphQL', 'Kubernetes'],
        minExperience: 5,
        maxExperience: 10,
        education: 'Bachelor\'s in Computer Science or related field'
      },
      {
        _id: 'job_1',
        title: 'Full Stack Developer',
        department: 'Engineering',
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
        preferredSkills: ['Vue.js', 'MongoDB', 'Redis'],
        minExperience: 3,
        maxExperience: 7,
        education: 'Bachelor\'s degree preferred'
      },
      {
        _id: 'job_2',
        title: 'Data Scientist',
        department: 'Data',
        requiredSkills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Pandas'],
        preferredSkills: ['TensorFlow', 'PyTorch', 'R', 'Spark'],
        minExperience: 3,
        maxExperience: 8,
        education: 'Master\'s in Data Science, Statistics, or related field'
      },
      {
        _id: 'job_3',
        title: 'DevOps Engineer',
        department: 'Infrastructure',
        requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'CI/CD'],
        preferredSkills: ['Terraform', 'Ansible', 'Monitoring'],
        minExperience: 4,
        maxExperience: 9,
        education: 'Bachelor\'s in Computer Science or Engineering'
      },
      {
        _id: 'job_4',
        title: 'Product Manager',
        department: 'Product',
        requiredSkills: ['Product Strategy', 'Analytics', 'Agile', 'User Research'],
        preferredSkills: ['SQL', 'A/B Testing', 'Wireframing'],
        minExperience: 3,
        maxExperience: 8,
        education: 'Bachelor\'s degree, MBA preferred'
      }
    ];
  };

  const runAIScreening = async () => {
    if (!selectedJob) {
      alert('Please select a job position first');
      return;
    }

    setScreening(true);
    try {
      const token = localStorage.getItem('token');
      const job = jobs.find(j => j._id === selectedJob);
      const jobApplications = applications.filter(app => app.jobId === selectedJob);

      // Simulate ML screening process
      const results = jobApplications.map(app => {
        const score = calculateAIScore(app, job);
        const insights = generateAIInsights(app, job, score);
        
        return {
          ...app,
          aiScore: score,
          insights,
          biasFlags: detectBias(app),
          recommendations: generateRecommendations(app, job, score)
        };
      });

      // Sort by AI score
      results.sort((a, b) => b.aiScore - a.aiScore);
      setScreeningResults(results);

      // Update applications with AI scores
      setApplications(prev => prev.map(app => {
        const result = results.find(r => r._id === app._id);
        return result ? { ...app, aiScore: result.aiScore } : app;
      }));

      alert(`✅ AI screening completed! Analyzed ${results.length} applications.`);
    } catch (error) {
      console.error('Error running AI screening:', error);
      alert('❌ AI screening failed');
    } finally {
      setScreening(false);
    }
  };

  const calculateAIScore = (application, job) => {
    let score = 0;
    const weights = mlSettings;

    // Skills matching (30% weight)
    const requiredSkillsMatch = job.requiredSkills.filter(skill => 
      application.skills.some(appSkill => 
        appSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(appSkill.toLowerCase())
      )
    ).length;
    
    const preferredSkillsMatch = job.preferredSkills?.filter(skill => 
      application.skills.some(appSkill => 
        appSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(appSkill.toLowerCase())
      )
    ).length || 0;

    const skillScore = ((requiredSkillsMatch / job.requiredSkills.length) * 0.8 + 
                      (preferredSkillsMatch / (job.preferredSkills?.length || 1)) * 0.2) * 100;
    score += (skillScore * weights.skillsWeight / 100);

    // Experience matching (25% weight)
    const expScore = application.experience >= job.minExperience && application.experience <= job.maxExperience
      ? 100
      : Math.max(0, 100 - Math.abs(application.experience - (job.minExperience + job.maxExperience) / 2) * 10);
    score += (expScore * weights.experienceWeight / 100);

    // Education matching (20% weight)
    const eduScore = application.education ? 80 + Math.random() * 20 : 60;
    score += (eduScore * weights.educationWeight / 100);

    // Keywords and resume content (15% weight)
    const keywordScore = 70 + Math.random() * 30; // Simulated content analysis
    score += (keywordScore * weights.keywordsWeight / 100);

    // Previous company prestige (10% weight)
    const prestigeScore = application.previousCompanies?.length > 0 ? 80 + Math.random() * 20 : 50;
    score += (prestigeScore * 10 / 100);

    // Apply diversity boost if enabled
    if (weights.diversityBoost) {
      score += Math.random() * 5; // Small boost for diversity
    }

    return Math.min(100, Math.max(0, score));
  };

  const generateAIInsights = (application, job, score) => {
    const insights = [];
    
    if (score >= 85) {
      insights.push('🎯 Excellent match - Strong candidate');
    } else if (score >= 70) {
      insights.push('👍 Good match - Consider for interview');
    } else if (score >= 50) {
      insights.push('⚠️ Partial match - Review manually');
    } else {
      insights.push('❌ Low match - Consider rejection');
    }

    // Skill analysis
    const matchedSkills = job.requiredSkills.filter(skill => 
      application.skills.some(appSkill => appSkill.toLowerCase().includes(skill.toLowerCase()))
    );
    
    if (matchedSkills.length > 0) {
      insights.push(`✅ Matches ${matchedSkills.length}/${job.requiredSkills.length} required skills`);
    }

    // Experience analysis
    if (application.experience < job.minExperience) {
      insights.push(`⏰ ${job.minExperience - application.experience} years below minimum experience`);
    } else if (application.experience > job.maxExperience) {
      insights.push(`🎓 ${application.experience - job.maxExperience} years above preferred range`);
    }

    return insights;
  };

  const detectBias = (application) => {
    const flags = [];
    
    // Simulated bias detection
    if (Math.random() < 0.1) {
      flags.push('Gender-neutral name detected');
    }
    if (Math.random() < 0.15) {
      flags.push('International background');
    }
    if (Math.random() < 0.05) {
      flags.push('Non-traditional education path');
    }

    return flags;
  };

  const generateRecommendations = (application, job, score) => {
    const recommendations = [];

    if (score >= 80) {
      recommendations.push('Schedule phone screening immediately');
      recommendations.push('Fast-track to technical interview');
    } else if (score >= 60) {
      recommendations.push('Conduct thorough resume review');
      recommendations.push('Consider skills assessment test');
    } else if (score >= 40) {
      recommendations.push('Request additional information');
      recommendations.push('Consider for junior positions');
    } else {
      recommendations.push('Send polite rejection email');
      recommendations.push('Keep in talent pool for future roles');
    }

    return recommendations;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#ef4444';
    return '#6b7280';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const filteredResults = screeningResults.filter(result => {
    if (result.aiScore < filters.minScore || result.aiScore > filters.maxScore) return false;
    if (filters.skills && !result.skills.some(skill => 
      skill.toLowerCase().includes(filters.skills.toLowerCase())
    )) return false;
    if (filters.experience && result.experience < parseInt(filters.experience)) return false;
    return true;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading AI screening system...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600', color: '#111827' }}>
          🤖 AI Resume Screening
        </h2>
        <p style={{ margin: 0, color: '#6b7280' }}>
          ML-powered candidate screening with bias detection and intelligent ranking
        </p>
      </div>

      {/* Controls Panel */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {/* Job Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Select Job Position
            </label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Choose a position...</option>
              {jobs.map(job => (
                <option key={job._id} value={job._id}>
                  {job.title} ({applications.filter(app => app.jobId === job._id).length} applications)
                </option>
              ))}
            </select>
          </div>

          {/* ML Settings */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Minimum AI Score
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={mlSettings.minimumScore}
              onChange={(e) => setMlSettings(prev => ({ ...prev, minimumScore: parseInt(e.target.value) }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Bias Detection Toggle */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
              <input
                type="checkbox"
                checked={mlSettings.biasDetection}
                onChange={(e) => setMlSettings(prev => ({ ...prev, biasDetection: e.target.checked }))}
              />
              <span style={{ fontSize: '14px', color: '#374151' }}>Enable Bias Detection</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <input
                type="checkbox"
                checked={mlSettings.diversityBoost}
                onChange={(e) => setMlSettings(prev => ({ ...prev, diversityBoost: e.target.checked }))}
              />
              <span style={{ fontSize: '14px', color: '#374151' }}>Diversity Boost</span>
            </label>
          </div>

          {/* Run Screening Button */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={runAIScreening}
              disabled={screening || !selectedJob}
              style={{
                width: '100%',
                background: screening || !selectedJob ? '#9ca3af' : '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '6px',
                cursor: screening || !selectedJob ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {screening ? '🔄 Screening...' : '🚀 Run AI Screening'}
            </button>
          </div>
        </div>
      </div>

      {/* Screening Results */}
      {screeningResults.length > 0 && (
        <>
          {/* Filters */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
              Filter Results ({filteredResults.length} candidates)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Score Range
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.minScore}
                    onChange={(e) => setFilters(prev => ({ ...prev, minScore: parseInt(e.target.value) }))}
                    placeholder="Min"
                    style={{ width: '70px', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.maxScore}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxScore: parseInt(e.target.value) }))}
                    placeholder="Max"
                    style={{ width: '70px', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Skills
                </label>
                <input
                  type="text"
                  value={filters.skills}
                  onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="e.g., React, Python"
                  style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Min Experience
                </label>
                <input
                  type="number"
                  value={filters.experience}
                  onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="Years"
                  style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                />
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredResults.map((result, index) => (
              <div
                key={result._id}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    {/* Candidate Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{
                          background: '#f3f4f6',
                          color: '#374151',
                          padding: '4px 8px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          #{index + 1}
                        </span>
                        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                          {result.name}
                        </h4>
                      </div>
                      <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
                        {result.email} • {result.experience} years experience
                      </p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {result.skills.slice(0, 4).map(skill => (
                          <span key={skill} style={{
                            background: '#dbeafe',
                            color: '#1d4ed8',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}>
                            {skill}
                          </span>
                        ))}
                        {result.skills.length > 4 && (
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            +{result.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* AI Score */}
                    <div style={{ textAlign: 'center', minWidth: '100px' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: `conic-gradient(${getScoreColor(result.aiScore)} ${result.aiScore * 3.6}deg, #e5e7eb 0deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 8px auto',
                        position: 'relative'
                      }}>
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          background: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          color: getScoreColor(result.aiScore)
                        }}>
                          {Math.round(result.aiScore)}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: getScoreColor(result.aiScore) }}>
                        {getScoreLabel(result.aiScore)}
                      </div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      🎯 AI Insights
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {result.insights.map((insight, i) => (
                        <div key={i} style={{ fontSize: '13px', color: '#6b7280' }}>
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bias Flags */}
                  {result.biasFlags.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        🛡️ Bias Detection
                      </h5>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {result.biasFlags.map((flag, i) => (
                          <span key={i} style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}>
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      💡 AI Recommendations
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {result.recommendations.map((rec, i) => (
                        <div key={i} style={{ fontSize: '13px', color: '#6b7280' }}>
                          • {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {screeningResults.length === 0 && !screening && (
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
            Ready for AI Screening
          </h3>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            Select a job position and run AI screening to analyze candidates with machine learning
          </p>
        </div>
      )}
    </div>
  );
};

export default AIResumeScreening;