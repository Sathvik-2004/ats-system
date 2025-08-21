
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminView.css';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminView = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/applicants');
        setApplicants(res.data);
      } catch (err) {
        toast.error('Failed to fetch applicants');
      }
      setLoading(false);
    };
    fetchApplicants();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}>
      <div style={{ maxWidth: 1000, width: '100%', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: '32px 36px', fontFamily: 'Segoe UI, Arial, sans-serif', marginLeft: 0 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 28, color: '#2d3748', fontWeight: 700, letterSpacing: 1 }}>
          📋 Submitted Applications
        </h1>
        <input
          className="search-bar"
          type="text"
          placeholder="Search by name, email, or job title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {loading ? (
          <div className="spinner">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="20" stroke="#3182ce" strokeWidth="6" strokeDasharray="31.4 31.4" strokeDashoffset="0">
                <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="1s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        ) : (
          applicants.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#718096', fontSize: 18 }}>No applications yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Job Title</th>
                  <th>Resume</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applicants
                  .filter(a =>
                    a.name.toLowerCase().includes(search.toLowerCase()) ||
                    a.email.toLowerCase().includes(search.toLowerCase()) ||
                    (a.jobId?.title || '').toLowerCase().includes(search.toLowerCase())
                  )
                  .map((applicant, idx) => (
                    <tr key={applicant._id}>
                      <td>{applicant.name}</td>
                      <td>{applicant.email}</td>
                      <td>{applicant.jobId?.title || 'N/A'}</td>
                      <td>
                        <a
                          href={`http://localhost:5000/uploads/${applicant.resume}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#3182ce', textDecoration: 'underline', fontWeight: 500 }}
                        >
                          View Resume
                        </a>
                      </td>
                      <td>
                        <span className={`status-badge status-${(applicant.status || 'pending').toLowerCase()}`}>
                          {applicant.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn approve"
                          disabled={applicant.status === 'Approved' || applicant.status === 'Rejected'}
                          onClick={async () => {
                            try {
                              await axios.patch(`http://localhost:5000/api/applicants/${applicant._id}/status`, { status: 'Approved' });
                              setApplicants(applicants => applicants.map(a => a._id === applicant._id ? { ...a, status: 'Approved' } : a));
                              toast.success('Application approved!', { icon: <FaCheckCircle style={{ color: '#22c55e' }} /> });
                            } catch {
                              toast.error('Failed to approve application');
                            }
                          }}
                        >
                          <FaCheckCircle style={{ color: '#22c55e' }} /> Approve
                        </button>
                        <button
                          className="action-btn reject"
                          disabled={applicant.status === 'Approved' || applicant.status === 'Rejected'}
                          onClick={async () => {
                            try {
                              await axios.patch(`http://localhost:5000/api/applicants/${applicant._id}/status`, { status: 'Rejected' });
                              setApplicants(applicants => applicants.map(a => a._id === applicant._id ? { ...a, status: 'Rejected' } : a));
                              toast.error('Application rejected!', { icon: <FaTimesCircle style={{ color: '#ef4444' }} /> });
                            } catch {
                              toast.error('Failed to reject application');
                            }
                          }}
                        >
                          <FaTimesCircle style={{ color: '#ef4444' }} /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )
        )}
        <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      </div>
    </div>
  );
};

export default AdminView;
