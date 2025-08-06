import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css'; // optional for styling

const AdminDashboard = () => {
  const [applicants, setApplicants] = useState([]);

  // ✅ REPLACE useEffect with this updated version
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/applicants');
        console.log('Fetched applicants:', res.data); // ✅ See what you're getting
        setApplicants(res.data);
      } catch (err) {
        console.error('Failed to fetch applicants:', err);
      }
    };

    fetchApplicants();
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>📋 Submitted Applications</h1>
      {applicants.length === 0 ? (
        <p>No applications yet.</p>
      ) : (
        <table className="applicants-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Job Title</th>
              <th>Resume</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((applicant) => (
              <tr key={applicant._id}>
                <td>{applicant.name}</td>
                <td>{applicant.email}</td>
                <td>{applicant.jobId?.title || 'N/A'}</td>
                <td>
                  <a
                    href={`http://localhost:5000/uploads/${applicant.resume}`}
                    target="_blank"
                    rel="noopener noreferrer"
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
  );
};

export default AdminDashboard;
