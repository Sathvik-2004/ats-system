
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminView = () => {
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/applicants');
        setApplicants(res.data);
      } catch (err) {
        console.error('Failed to fetch applicants:', err);
      }
    };
    fetchApplicants();
  }, []);

  return (
    <div style={{
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: 0,
    }}>
      <div style={{
        maxWidth: 900,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        padding: '32px 36px',
        fontFamily: 'Segoe UI, Arial, sans-serif',
        marginLeft: 0,
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: 28,
          color: '#2d3748',
          fontWeight: 700,
          letterSpacing: 1,
        }}>📋 Submitted Applications</h1>
        {applicants.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#718096', fontSize: 18 }}>No applications yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
            <thead>
              <tr style={{ background: '#f7fafc' }}>
                <th style={{ padding: '12px 8px', color: '#4a5568', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Name</th>
                <th style={{ padding: '12px 8px', color: '#4a5568', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Email</th>
                <th style={{ padding: '12px 8px', color: '#4a5568', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Job Title</th>
                <th style={{ padding: '12px 8px', color: '#4a5568', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Resume</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((applicant, idx) => (
                <tr key={applicant._id} style={{ background: idx % 2 === 0 ? '#f7fafc' : '#fff' }}>
                  <td style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0' }}>{applicant.name}</td>
                  <td style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0' }}>{applicant.email}</td>
                  <td style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0' }}>{applicant.jobId?.title || 'N/A'}</td>
                  <td style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0' }}>
                    <a
                      href={`http://localhost:5000/uploads/${applicant.resume}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#3182ce',
                        textDecoration: 'underline',
                        fontWeight: 500,
                      }}
                    >
                      View Resume
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminView;
