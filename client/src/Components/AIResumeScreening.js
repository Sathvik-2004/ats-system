import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AIResumeScreening.css';
import LoadingSpinner from './common/LoadingSpinner';
import RequestErrorState from './common/RequestErrorState';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const getApplicationJobId = (item) => {
  if (item?.job) {
    if (typeof item.job === 'string') return item.job;
    if (typeof item.job === 'object') return String(item.job._id || item.job.id || '');
  }
  if (item?.jobId) {
    if (typeof item.jobId === 'string') return item.jobId;
    if (typeof item.jobId === 'object') return String(item.jobId._id || item.jobId.id || '');
  }
  return '';
};

const getApplicationJobTitle = (item) => {
  if (item?.job && typeof item.job === 'object' && item.job.title) return item.job.title;
  if (typeof item?.jobTitle === 'string' && item.jobTitle.trim()) return item.jobTitle;
  return 'Unknown Role';
};

const AIResumeScreening = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [loading, setLoading] = useState(true);
  const [screening, setScreening] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState('');

  const authConfig = useMemo(() => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const fetchData = async () => {
    try {
      setError('');
      const [jobsRes, appsRes] = await Promise.all([
        axios.get(`${API_URL}/api/jobs`),
        axios.get(`${API_URL}/api/applications?limit=100`, authConfig)
      ]);

      const jobsPayload = jobsRes.data?.data || jobsRes.data || [];
      setJobs(Array.isArray(jobsPayload) ? jobsPayload : []);
      setApplications(appsRes.data?.data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('AI screening fetch error:', error);
      setError(error?.response?.data?.message || 'Failed to load AI screening data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  const jobsById = useMemo(() => {
    const map = new Map();
    jobs.forEach((job) => map.set(String(job._id), job));
    return map;
  }, [jobs]);

  const selectedJobMeta = useMemo(
    () => jobs.find((job) => String(job._id) === String(selectedJob)) || null,
    [jobs, selectedJob]
  );

  const runScreening = async () => {
    try {
      setScreening(true);
      const response = await axios.post(
        `${API_URL}/api/ai/screen`,
        selectedJob ? { jobId: selectedJob } : {},
        authConfig
      );
      const processedCount = Array.isArray(response?.data?.data) ? response.data.data.length : 0;
      const completionMessage =
        processedCount > 0
          ? `AI screening completed for ${processedCount} applications`
          : 'AI screening completed';

      await fetchData();
      toast.success(completionMessage);
    } catch (error) {
      console.error('AI screening error:', error);
      toast.error(error?.response?.data?.message || 'AI screening failed');
    } finally {
      setScreening(false);
    }
  };

  const getMatchPercentage = (item) => {
    const explicitMatch = Number(item.matchPercentage);
    if (Number.isFinite(explicitMatch)) {
      return Math.max(0, Math.min(100, Math.round(explicitMatch)));
    }
    const matching = (item.matchingSkills || []).length;
    const missing = (item.missingSkills || []).length;
    const total = matching + missing;
    if (!total) return Number(item.aiScore ?? item.score ?? 0);
    return Math.round((matching / total) * 100);
  };

  const selectedJobApplications = applications
    .filter((item) => {
      if (!selectedJob) return true;

      const appJobId = getApplicationJobId(item);
      if (appJobId && String(appJobId) === String(selectedJob)) {
        return true;
      }

      if (
        selectedJobMeta?.title &&
        String(getApplicationJobTitle(item) || '').trim().toLowerCase() === String(selectedJobMeta.title).trim().toLowerCase()
      ) {
        return true;
      }

      return false;
    })
    .sort((a, b) => ((b.aiScore ?? b.score ?? 0) - (a.aiScore ?? a.score ?? 0)));

  const displayApplications = selectedJobApplications;

  if (loading) {
    return (
      <LoadingSpinner label="Loading AI screening data..." />
    );
  }

  return (
    <div className="airs-page">
      <h2 className="airs-title">AI Resume Screening</h2>
      <p className="airs-subtitle">Real-time screening and score updates from live application data.</p>

      <div className="airs-controls">
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="airs-select"
        >
          <option value="">All Jobs</option>
          {jobs.map((job) => (
            <option key={job._id} value={job._id}>{job.title} - {job.company}</option>
          ))}
        </select>

        <button
          onClick={runScreening}
          disabled={
            screening ||
            (selectedJob
              ? selectedJobApplications.length === 0
              : displayApplications.length === 0)
          }
          className="airs-btn airs-btn-primary"
        >
          {screening ? 'Running...' : selectedJob ? 'Run AI Screening' : 'Run AI Screening (All Visible)'}
        </button>

        <button onClick={fetchData} className="airs-btn airs-btn-secondary">Refresh</button>

        <span className="airs-last-updated">
          Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
        </span>
      </div>

      {error && (
        <RequestErrorState
          compact
          message={error}
          onRetry={fetchData}
        />
      )}

      <div className="airs-table-wrap">
        <table className="airs-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Job</th>
              <th>Score</th>
              <th>Match %</th>
              <th>Missing Skills</th>
            </tr>
          </thead>
          <tbody>
            {displayApplications.map((item) => {
              const score = Number(item.aiScore ?? item.score ?? 0);
              const matchPercentage = getMatchPercentage(item);
              const boundedScore = Math.max(0, Math.min(score, 100));
              const boundedMatch = Math.max(0, Math.min(matchPercentage, 100));
              const linkedJob = jobsById.get(getApplicationJobId(item));
              const resolvedJobTitle =
                linkedJob?.title ||
                getApplicationJobTitle(item);

              return (
              <tr key={item._id}>
                <td>{item.candidateName || item.candidateEmail}</td>
                <td>{resolvedJobTitle}</td>
                <td className="airs-progress-col">
                  <div className="airs-progress-label">{score}%</div>
                  <div className="airs-progress-track">
                    <div className="airs-progress-fill airs-progress-score" style={{ width: `${boundedScore}%` }} />
                  </div>
                </td>
                <td className="airs-progress-col">
                  <div className="airs-progress-label">{matchPercentage}%</div>
                  <div className="airs-progress-track">
                    <div className="airs-progress-fill airs-progress-match" style={{ width: `${boundedMatch}%` }} />
                  </div>
                </td>
                <td>{(item.missingSkills || []).join(', ') || '—'}</td>
              </tr>
            )})}
            {displayApplications.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="airs-empty-state">
                    <div className="airs-empty-title">No applications found</div>
                    <div className="airs-empty-subtitle">Try selecting another job or refresh the feed.</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AIResumeScreening;
