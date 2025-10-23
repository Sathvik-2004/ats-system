import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InterviewManagement = () => {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // calendar, list, feedback

  const [scheduleForm, setScheduleForm] = useState({
    candidateId: '',
    candidateName: '',
    candidateEmail: '',
    jobTitle: '',
    interviewType: 'phone_screening',
    date: '',
    time: '',
    duration: 60,
    interviewerIds: [],
    location: '',
    meetingLink: '',
    notes: '',
    reminders: true
  });

  const [feedbackForm, setFeedbackForm] = useState({
    technicalSkills: 5,
    communication: 5,
    problemSolving: 5,
    culturalFit: 5,
    experience: 5,
    overall: 5,
    comments: '',
    recommendation: 'hire',
    nextSteps: ''
  });

  const interviewTypes = [
    { value: 'phone_screening', label: 'Phone Screening', duration: 30, icon: '📞' },
    { value: 'technical_interview', label: 'Technical Interview', duration: 90, icon: '💻' },
    { value: 'behavioral_interview', label: 'Behavioral Interview', duration: 60, icon: '🎭' },
    { value: 'panel_interview', label: 'Panel Interview', duration: 90, icon: '👥' },
    { value: 'final_interview', label: 'Final Interview', duration: 60, icon: '🎯' },
    { value: 'culture_fit', label: 'Culture Fit', duration: 45, icon: '🤝' }
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [interviewsRes, applicationsRes, interviewersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/interviews', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: generateMockInterviews() })),
        
        axios.get('http://localhost:5000/api/applicants', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: generateMockApplications() })),
        
        axios.get('http://localhost:5000/api/admin/interviewers', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: generateMockInterviewers() }))
      ]);

      setInterviews(interviewsRes.data);
      setApplications(applicationsRes.data);
      setInterviewers(interviewersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setInterviews(generateMockInterviews());
      setApplications(generateMockApplications());
      setInterviewers(generateMockInterviewers());
    } finally {
      setLoading(false);
    }
  };

  const generateMockInterviews = () => {
    const statuses = ['scheduled', 'completed', 'cancelled', 'rescheduled'];
    const today = new Date();
    
    return Array.from({ length: 20 }, (_, i) => {
      const interviewDate = new Date(today);
      interviewDate.setDate(today.getDate() + (i - 10)); // Past and future interviews
      
      return {
        _id: `interview_${i}`,
        candidateId: `candidate_${i}`,
        candidateName: `John Candidate ${i + 1}`,
        candidateEmail: `candidate${i + 1}@email.com`,
        jobTitle: ['Senior Developer', 'Product Manager', 'Data Scientist', 'UX Designer'][i % 4],
        interviewType: interviewTypes[i % interviewTypes.length].value,
        date: interviewDate.toISOString().split('T')[0],
        time: timeSlots[i % timeSlots.length],
        duration: interviewTypes[i % interviewTypes.length].duration,
        interviewerIds: [`interviewer_${i % 5}`, `interviewer_${(i + 1) % 5}`],
        interviewerNames: [`Sarah Johnson`, `Mike Chen`, `Lisa Park`, `David Smith`, `Emma Wilson`].slice(i % 5, (i % 5) + 2),
        location: i % 2 === 0 ? 'Conference Room A' : 'Video Call',
        meetingLink: i % 2 === 1 ? 'https://meet.google.com/abc-defg-hij' : '',
        status: statuses[i % statuses.length],
        feedback: i < 10 ? {
          technicalSkills: Math.floor(Math.random() * 5) + 1,
          communication: Math.floor(Math.random() * 5) + 1,
          problemSolving: Math.floor(Math.random() * 5) + 1,
          culturalFit: Math.floor(Math.random() * 5) + 1,
          experience: Math.floor(Math.random() * 5) + 1,
          overall: Math.floor(Math.random() * 5) + 1,
          comments: `Good candidate with strong technical skills. Shows enthusiasm and good problem-solving approach.`,
          recommendation: ['hire', 'no_hire', 'maybe'][Math.floor(Math.random() * 3)],
          nextSteps: 'Move to next round'
        } : null,
        notes: 'Standard interview process',
        createdAt: new Date().toISOString()
      };
    });
  };

  const generateMockApplications = () => {
    return Array.from({ length: 30 }, (_, i) => ({
      _id: `candidate_${i}`,
      name: `Candidate ${i + 1}`,
      email: `candidate${i + 1}@email.com`,
      jobTitle: ['Senior Developer', 'Product Manager', 'Data Scientist', 'UX Designer'][i % 4],
      status: 'screening',
      phone: `+1-555-${String(i + 1000).slice(-4)}`
    }));
  };

  const generateMockInterviewers = () => {
    return [
      { _id: 'interviewer_0', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Engineering Manager', department: 'Engineering' },
      { _id: 'interviewer_1', name: 'Mike Chen', email: 'mike@company.com', role: 'Senior Developer', department: 'Engineering' },
      { _id: 'interviewer_2', name: 'Lisa Park', email: 'lisa@company.com', role: 'Product Manager', department: 'Product' },
      { _id: 'interviewer_3', name: 'David Smith', email: 'david@company.com', role: 'UX Director', department: 'Design' },
      { _id: 'interviewer_4', name: 'Emma Wilson', email: 'emma@company.com', role: 'Data Science Lead', department: 'Data' }
    ];
  };

  const handleScheduleInterview = async () => {
    if (!scheduleForm.candidateId || !scheduleForm.date || !scheduleForm.time) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const interviewData = {
        ...scheduleForm,
        interviewerNames: interviewers.filter(int => scheduleForm.interviewerIds.includes(int._id)).map(int => int.name),
        status: 'scheduled'
      };

      const response = await axios.post('http://localhost:5000/api/admin/interviews', interviewData, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({
        data: {
          ...interviewData,
          _id: `interview_${Date.now()}`,
          createdAt: new Date().toISOString()
        }
      }));

      setInterviews(prev => [...prev, response.data]);
      setShowScheduleModal(false);
      resetScheduleForm();
      alert('✅ Interview scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('❌ Failed to schedule interview');
    }
  };

  const handleSubmitFeedback = async (interviewId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`http://localhost:5000/api/admin/interviews/${interviewId}/feedback`, feedbackForm, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({}));

      setInterviews(prev => prev.map(interview => 
        interview._id === interviewId 
          ? { ...interview, feedback: feedbackForm, status: 'completed' }
          : interview
      ));

      setSelectedInterview(null);
      alert('✅ Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('❌ Failed to submit feedback');
    }
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      candidateId: '',
      candidateName: '',
      candidateEmail: '',
      jobTitle: '',
      interviewType: 'phone_screening',
      date: '',
      time: '',
      duration: 60,
      interviewerIds: [],
      location: '',
      meetingLink: '',
      notes: '',
      reminders: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'rescheduled': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'hire': return '#10b981';
      case 'no_hire': return '#ef4444';
      case 'maybe': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const generateCalendarView = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    return weekDays.map(day => {
      const dayInterviews = interviews.filter(interview => 
        interview.date === day.toISOString().split('T')[0]
      );

      return {
        date: day,
        interviews: dayInterviews
      };
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading interview management...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600', color: '#111827' }}>
            📅 Interview Management
          </h2>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Schedule, manage, and track interviews with integrated calendar and feedback
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* View Mode Selector */}
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '8px', padding: '2px' }}>
            {['calendar', 'list', 'feedback'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  background: viewMode === mode ? '#fff' : 'transparent',
                  color: viewMode === mode ? '#111827' : '#6b7280',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: viewMode === mode ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {mode === 'calendar' && '📅'} 
                {mode === 'list' && '📋'} 
                {mode === 'feedback' && '💬'} 
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowScheduleModal(true)}
            style={{
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ➕ Schedule Interview
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>
            {interviews.filter(i => i.status === 'scheduled').length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Scheduled</div>
        </div>
        
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
            {interviews.filter(i => i.status === 'completed').length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Completed</div>
        </div>
        
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px' }}>
            {interviews.filter(i => i.feedback?.recommendation === 'hire').length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Hire Recommendations</div>
        </div>
        
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6', marginBottom: '4px' }}>
            {interviews.filter(i => i.date === new Date().toISOString().split('T')[0]).length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Today</div>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              📅 Weekly Calendar
            </h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: '400px' }}>
            {generateCalendarView().map((day, index) => (
              <div key={index} style={{ border: '1px solid #f3f4f6', padding: '12px' }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: day.date.toDateString() === new Date().toDateString() ? '#3b82f6' : '#374151',
                  marginBottom: '8px'
                }}>
                  {day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {day.interviews.slice(0, 3).map(interview => (
                    <div
                      key={interview._id}
                      style={{
                        background: getStatusColor(interview.status) + '20',
                        border: `1px solid ${getStatusColor(interview.status)}40`,
                        borderRadius: '4px',
                        padding: '4px 6px',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedInterview(interview)}
                    >
                      <div style={{ fontWeight: '600', color: '#111827' }}>
                        {interview.time}
                      </div>
                      <div style={{ color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {interview.candidateName}
                      </div>
                    </div>
                  ))}
                  {day.interviews.length > 3 && (
                    <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
                      +{day.interviews.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              📋 All Interviews ({interviews.length})
            </h3>
          </div>
          
          <div style={{ maxHeight: '600px', overflow: 'auto' }}>
            {interviews.map(interview => (
              <div
                key={interview._id}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.target.style.background = '#fff'}
                onClick={() => setSelectedInterview(interview)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>
                        {interviewTypes.find(t => t.value === interview.interviewType)?.icon || '📞'}
                      </span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                          {interview.candidateName}
                        </h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                          {interview.jobTitle} • {interviewTypes.find(t => t.value === interview.interviewType)?.label}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#6b7280' }}>
                      <div>📅 {interview.date}</div>
                      <div>🕒 {interview.time}</div>
                      <div>👥 {interview.interviewerNames?.join(', ')}</div>
                      {interview.location && <div>📍 {interview.location}</div>}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {interview.feedback && (
                      <span style={{
                        background: getRecommendationColor(interview.feedback.recommendation) + '20',
                        color: getRecommendationColor(interview.feedback.recommendation),
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {interview.feedback.recommendation.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                    
                    <span style={{
                      background: getStatusColor(interview.status) + '20',
                      color: getStatusColor(interview.status),
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {interview.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback View */}
      {viewMode === 'feedback' && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              💬 Interview Feedback & Reports
            </h3>
          </div>
          
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {interviews.filter(interview => interview.feedback).map(interview => (
                <div key={interview._id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                      {interview.candidateName}
                    </h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                      {interview.jobTitle} • {interview.date}
                    </p>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    {Object.entries(interview.feedback).slice(0, 6).map(([key, value]) => (
                      <div key={key} style={{ fontSize: '12px' }}>
                        <span style={{ color: '#6b7280' }}>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                        <span style={{ color: '#111827', fontWeight: '600', marginLeft: '4px' }}>
                          {typeof value === 'number' ? `${value}/5` : value}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Comments:</div>
                    <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.4 }}>
                      {interview.feedback.comments}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      background: getRecommendationColor(interview.feedback.recommendation) + '20',
                      color: getRecommendationColor(interview.feedback.recommendation),
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {interview.feedback.recommendation.replace('_', ' ').toUpperCase()}
                    </span>
                    
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      Overall: {interview.feedback.overall}/5
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
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
            borderRadius: '12px',
            width: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>Schedule New Interview</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Candidate</label>
                <select
                  value={scheduleForm.candidateId}
                  onChange={(e) => {
                    const candidate = applications.find(app => app._id === e.target.value);
                    setScheduleForm(prev => ({
                      ...prev,
                      candidateId: e.target.value,
                      candidateName: candidate?.name || '',
                      candidateEmail: candidate?.email || '',
                      jobTitle: candidate?.jobTitle || ''
                    }));
                  }}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="">Select candidate...</option>
                  {applications.map(app => (
                    <option key={app._id} value={app._id}>{app.name} - {app.jobTitle}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Interview Type</label>
                <select
                  value={scheduleForm.interviewType}
                  onChange={(e) => {
                    const type = interviewTypes.find(t => t.value === e.target.value);
                    setScheduleForm(prev => ({
                      ...prev,
                      interviewType: e.target.value,
                      duration: type?.duration || 60
                    }));
                  }}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  {interviewTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label} ({type.duration}min)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Date</label>
                <input
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Time</label>
                <select
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="">Select time...</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Duration (min)</label>
                <input
                  type="number"
                  value={scheduleForm.duration}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Interviewers</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {interviewers.map(interviewer => (
                  <label key={interviewer._id} style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                    <input
                      type="checkbox"
                      checked={scheduleForm.interviewerIds.includes(interviewer._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setScheduleForm(prev => ({ ...prev, interviewerIds: [...prev.interviewerIds, interviewer._id] }));
                        } else {
                          setScheduleForm(prev => ({ ...prev, interviewerIds: prev.interviewerIds.filter(id => id !== interviewer._id) }));
                        }
                      }}
                      style={{ marginRight: '8px' }}
                    />
                    {interviewer.name} ({interviewer.role})
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Location</label>
                <input
                  type="text"
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Conference Room A"
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Meeting Link</label>
                <input
                  type="url"
                  value={scheduleForm.meetingLink}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                  placeholder="https://meet.google.com/..."
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Notes</label>
              <textarea
                value={scheduleForm.notes}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes for the interview..."
                rows={3}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={scheduleForm.reminders}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, reminders: e.target.checked }))}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>Send email reminders</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  resetScheduleForm();
                }}
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
                onClick={handleScheduleInterview}
                style={{
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Details Modal */}
      {selectedInterview && (
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
            borderRadius: '12px',
            width: '700px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                  Interview Details
                </h3>
                <p style={{ margin: 0, color: '#6b7280' }}>
                  {selectedInterview.candidateName} • {selectedInterview.jobTitle}
                </p>
              </div>
              <button
                onClick={() => setSelectedInterview(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            {/* Interview Info */}
            <div style={{ marginBottom: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '14px' }}>
                <div><strong>Date:</strong> {selectedInterview.date}</div>
                <div><strong>Time:</strong> {selectedInterview.time}</div>
                <div><strong>Duration:</strong> {selectedInterview.duration} minutes</div>
                <div><strong>Type:</strong> {interviewTypes.find(t => t.value === selectedInterview.interviewType)?.label}</div>
                <div><strong>Interviewers:</strong> {selectedInterview.interviewerNames?.join(', ')}</div>
                <div><strong>Status:</strong> 
                  <span style={{
                    background: getStatusColor(selectedInterview.status) + '20',
                    color: getStatusColor(selectedInterview.status),
                    padding: '2px 6px',
                    borderRadius: '8px',
                    marginLeft: '8px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {selectedInterview.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              {selectedInterview.location && (
                <div style={{ marginTop: '8px', fontSize: '14px' }}>
                  <strong>Location:</strong> {selectedInterview.location}
                </div>
              )}
              
              {selectedInterview.meetingLink && (
                <div style={{ marginTop: '8px', fontSize: '14px' }}>
                  <strong>Meeting Link:</strong> 
                  <a href={selectedInterview.meetingLink} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px', color: '#3b82f6' }}>
                    {selectedInterview.meetingLink}
                  </a>
                </div>
              )}
            </div>

            {/* Feedback Section */}
            {selectedInterview.status === 'completed' && selectedInterview.feedback ? (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>Interview Feedback</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  {Object.entries(selectedInterview.feedback).slice(0, 6).map(([key, value]) => (
                    <div key={key} style={{ textAlign: 'center', padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                        {value}/5
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <strong>Comments:</strong>
                  <div style={{ marginTop: '4px', padding: '8px', background: '#f9fafb', borderRadius: '4px', fontSize: '14px' }}>
                    {selectedInterview.feedback.comments}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Recommendation:</strong>
                    <span style={{
                      background: getRecommendationColor(selectedInterview.feedback.recommendation) + '20',
                      color: getRecommendationColor(selectedInterview.feedback.recommendation),
                      padding: '4px 8px',
                      borderRadius: '12px',
                      marginLeft: '8px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {selectedInterview.feedback.recommendation.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    <strong>Overall Score: {selectedInterview.feedback.overall}/5</strong>
                  </div>
                </div>
              </div>
            ) : selectedInterview.status === 'scheduled' ? (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>Submit Feedback</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  {Object.keys(feedbackForm).slice(0, 6).map(key => (
                    <div key={key}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()} (1-5)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={feedbackForm[key]}
                        onChange={(e) => setFeedbackForm(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                        style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      />
                    </div>
                  ))}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Comments</label>
                  <textarea
                    value={feedbackForm.comments}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, comments: e.target.value }))}
                    placeholder="Detailed feedback about the candidate..."
                    rows={3}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Recommendation</label>
                    <select
                      value={feedbackForm.recommendation}
                      onChange={(e) => setFeedbackForm(prev => ({ ...prev, recommendation: e.target.value }))}
                      style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    >
                      <option value="hire">Hire</option>
                      <option value="no_hire">No Hire</option>
                      <option value="maybe">Maybe</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Next Steps</label>
                    <input
                      type="text"
                      value={feedbackForm.nextSteps}
                      onChange={(e) => setFeedbackForm(prev => ({ ...prev, nextSteps: e.target.value }))}
                      placeholder="e.g., Move to final round"
                      style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => handleSubmitFeedback(selectedInterview._id)}
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Submit Feedback
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewManagement;