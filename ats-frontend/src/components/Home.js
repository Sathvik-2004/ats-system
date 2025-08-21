import React, { useEffect, useState } from 'react';
import { FaBriefcase, FaUserCheck, FaBuilding, FaArrowRight, FaListOl } from 'react-icons/fa';
import axios from 'axios';

const Home = () => {
  const [stats, setStats] = useState({ jobs: 0, applications: 0, companies: 0 });
  const [featuredJobs, setFeaturedJobs] = useState([]);

  useEffect(() => {
    // Fetch jobs and applications count
    const fetchStats = async () => {
      try {
        const jobsRes = await axios.get('http://localhost:5000/api/jobs');
        const appsRes = await axios.get('http://localhost:5000/api/applicants');
        setStats({
          jobs: jobsRes.data.length,
          applications: appsRes.data.length,
          companies: [...new Set(jobsRes.data.map(j => j.company))].length,
        });
  setFeaturedJobs(jobsRes.data);
      } catch {
        setStats({ jobs: 0, applications: 0, companies: 0 });
        setFeaturedJobs([]);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', background: '#f7f9fb', paddingTop: 48 }}>
      {/* Welcome Card */}
      <div style={{ background: 'linear-gradient(90deg,#3182ce 0%,#00bcd4 100%)', borderRadius: 18, boxShadow: '0 4px 24px rgba(49,130,206,0.10)', padding: '32px 36px', maxWidth: 600, width: '90%', marginBottom: 32, color: '#fff', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 800, fontSize: 32, marginBottom: 12 }}>Welcome to ATS System</h2>
        <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Your one-stop solution for job applications, tracking, and career growth.</p>
        <p style={{ fontSize: 16, marginBottom: 0 }}>Apply for jobs, track your application status, and get hired faster!</p>
      </div>
      {/* Quick Stats */}
      <div style={{ display: 'flex', gap: 32, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(49,130,206,0.07)', padding: '18px 28px', minWidth: 120, textAlign: 'center' }}>
          <FaBriefcase style={{ color: '#3182ce', fontSize: 28, marginBottom: 6 }} />
          <div style={{ fontWeight: 700, fontSize: 22 }}>{stats.jobs}</div>
          <div style={{ color: '#4a5568', fontSize: 15 }}>Jobs</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(34,197,94,0.07)', padding: '18px 28px', minWidth: 120, textAlign: 'center' }}>
          <FaUserCheck style={{ color: '#22c55e', fontSize: 28, marginBottom: 6 }} />
          <div style={{ fontWeight: 700, fontSize: 22 }}>{stats.applications}</div>
          <div style={{ color: '#22c55e', fontSize: 15 }}>Applications</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(49,130,206,0.07)', padding: '18px 28px', minWidth: 120, textAlign: 'center' }}>
          <FaBuilding style={{ color: '#f59e42', fontSize: 28, marginBottom: 6 }} />
          <div style={{ fontWeight: 700, fontSize: 22 }}>{stats.companies}</div>
          <div style={{ color: '#f59e42', fontSize: 15 }}>Companies</div>
        </div>
      </div>
  {/* Featured Jobs removed. Use View Jobs button below to access all jobs. */}
      {/* Step-by-step Guide */}
      <div style={{ width: '100%', maxWidth: 700, marginBottom: 32 }}>
        <h3 style={{ color: '#2563eb', fontWeight: 700, marginBottom: 18, fontSize: 24 }}>How to Apply</h3>
        <ol style={{ color: '#4a5568', fontSize: 16, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(49,130,206,0.07)', padding: '18px 24px', margin: 0 }}>
          <li style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><FaListOl style={{ color: '#2563eb' }} /> Browse available jobs in the Jobs section.</li>
          <li style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><FaListOl style={{ color: '#2563eb' }} /> Fill out the application form with your details and resume.</li>
          <li style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><FaListOl style={{ color: '#2563eb' }} /> Track your application status in My Applications.</li>
          <li style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}><FaListOl style={{ color: '#2563eb' }} /> Get notified when your application is approved or rejected.</li>
        </ol>
      </div>
      {/* Call-to-action Buttons */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/jobs" className="action-btn approve" style={{ minWidth: 160, textAlign: 'center', fontSize: 18 }}>View Jobs</a>
        <a href="/my-applications" className="action-btn" style={{ minWidth: 160, textAlign: 'center', fontSize: 18, background: '#2563eb', color: '#fff' }}>Track Application</a>
      </div>
    </div>
  );
};

export default Home;
