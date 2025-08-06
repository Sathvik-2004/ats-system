// client/src/pages/AdminView.js
import React, { useEffect, useState } from 'react';

const AdminView = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/applications');
        const data = await response.json();
        setApplications(data);
      } catch (err) {
        console.error('Error fetching applications:', err);
      }
    };

    fetchApplications();
  }, []);

  return (
    <div>
      <h2>📋 All Applications</h2>
      <ul>
        {applications.map((app) => (
          <li key={app._id}>
            <strong>{app.name}</strong> - {app.email} <br />
            <a href={app.resume} target="_blank" rel="noopener noreferrer">Resume</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminView;
