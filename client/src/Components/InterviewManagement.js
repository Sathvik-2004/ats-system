import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { connectSocket } from '../utils/socket';
import { toast } from 'react-toastify';
import './InterviewManagement.css';
import LoadingSpinner from './common/LoadingSpinner';
import RequestErrorState from './common/RequestErrorState';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const formatInterviewMode = (rawMode) => {
  const normalized = String(rawMode || '').trim().toLowerCase();
  if (normalized === 'in_person' || normalized === 'in person' || normalized === 'in-person') {
    return 'In-person';
  }
  if (normalized === 'online') {
    return 'Online';
  }
  return '—';
};

const InterviewManagement = () => {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [mode, setMode] = useState('online');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState('');

  const authConfig = useMemo(() => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const interviewsByDate = useMemo(() => {
    return interviews.reduce((acc, item) => {
      const key = item?.interviewScheduled?.date
        ? new Date(item.interviewScheduled.date).toLocaleDateString()
        : 'Unscheduled';
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [interviews]);

  const fetchData = async () => {
    try {
      setError('');
      const [interviewsRes, appsRes] = await Promise.all([
        axios.get(`${API_URL}/api/interviews/upcoming`, authConfig),
        axios.get(`${API_URL}/api/applications?limit=100`, authConfig)
      ]);

      setInterviews(interviewsRes.data?.data || []);
      setApplications(appsRes.data?.data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Interview fetch error:', error);
      setError(error?.response?.data?.message || 'Failed to load interview data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = connectSocket(token);
    if (!socket) return undefined;

    const handleRealtimeInterview = () => {
      fetchData();
    };

    socket.on('interview:scheduled', handleRealtimeInterview);
    socket.on('application:status-updated', handleRealtimeInterview);

    return () => {
      socket.off('interview:scheduled', handleRealtimeInterview);
      socket.off('application:status-updated', handleRealtimeInterview);
    };
  }, []);

  const scheduleInterview = async () => {
    if (!selectedApplication || !date || !time) {
      toast.warning('Select candidate, date, and time');
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/interviews/${selectedApplication}/schedule`,
        { date, time, mode, interviewLink: link, notes },
        authConfig
      );
      setSelectedApplication('');
      setDate('');
      setTime('');
      setLink('');
      setNotes('');
      await fetchData();
      toast.success('Interview scheduled');
    } catch (error) {
      console.error('Schedule interview error:', error);
      toast.error(error?.response?.data?.message || 'Failed to schedule interview');
    }
  };

  const submitFeedback = async (applicationId, recommendation) => {
    try {
      await axios.put(
        `${API_URL}/api/interviews/${applicationId}/feedback`,
        { recommendation, comments: `Recommendation: ${recommendation}` },
        authConfig
      );
      await fetchData();
      toast.success('Feedback submitted');
    } catch (error) {
      console.error('Feedback error:', error);
      toast.error(error?.response?.data?.message || 'Failed to submit feedback');
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading interview management..." />;
  }

  return (
    <div className="im-page">
      <h2 className="im-title">Interview Scheduling</h2>
      <p className="im-subtitle">Live interview schedule with real-time updates.</p>

      <div className="im-form-grid">
        <select value={selectedApplication} onChange={(e) => setSelectedApplication(e.target.value)} className="im-input">
          <option value="">Select candidate application</option>
          {applications.map((app) => (
            <option key={app._id} value={app._id}>{app.candidateName} - {app.jobTitle}</option>
          ))}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="im-input" />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="im-input" />
        <select value={mode} onChange={(e) => setMode(e.target.value)} className="im-input">
          <option value="online">Online</option>
          <option value="in-person">In-person</option>
        </select>
        <input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Meeting link/location" className="im-input" />
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Interview notes (optional)" className="im-input" />
        <button onClick={scheduleInterview} className="im-btn im-btn-primary">Schedule</button>
      </div>

      <div className="im-last-updated">
        Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
      </div>

      {error && <RequestErrorState compact message={error} onRetry={fetchData} />}

      <div className="im-calendar-card">
        <h3 className="im-card-title">Upcoming Interviews Calendar</h3>
        {Object.keys(interviewsByDate).length === 0 ? (
          <p className="im-muted">No scheduled interviews.</p>
        ) : (
          Object.entries(interviewsByDate).map(([dateKey, items]) => (
            <div key={dateKey} className="im-calendar-group">
              <div className="im-calendar-date">{dateKey}</div>
              <div className="im-chip-wrap">
                {items.map((item) => (
                  <span key={item._id} className="im-chip">
                    {item.candidateName || item.candidateEmail} • {item.interviewScheduled?.time || 'TBD'}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="im-table-wrap">
        <table className="im-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Job</th>
              <th>Date</th>
              <th>Time</th>
              <th>Mode</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((item) => (
              <tr key={item._id}>
                <td>{item.candidateName || item.candidateEmail}</td>
                <td>{item.jobTitle}</td>
                <td>{item.interviewScheduled?.date ? new Date(item.interviewScheduled.date).toLocaleDateString() : '—'}</td>
                <td>{item.interviewScheduled?.time || '—'}</td>
                <td>{formatInterviewMode(item.interviewScheduled?.mode)}</td>
                <td className="im-notes-cell">{item.interviewScheduled?.notes || '—'}</td>
                <td>
                  <div className="im-actions-cell">
                    <button onClick={() => submitFeedback(item._id, 'hire')} className="im-btn im-btn-success">Hire</button>
                    <button onClick={() => submitFeedback(item._id, 'no_hire')} className="im-btn im-btn-danger">No Hire</button>
                  </div>
                </td>
              </tr>
            ))}
            {interviews.length === 0 && (
              <tr><td colSpan={7}><div className="im-empty-state">No upcoming interviews.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InterviewManagement;
