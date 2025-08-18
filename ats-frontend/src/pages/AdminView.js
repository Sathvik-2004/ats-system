import React, { useEffect, useState } from 'react';

const AdminView = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
  fetch('http://localhost:5000/api/applicants')
      .then((res) => res.json())
      .then((data) => setApplications(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>All Applications</h2>
      <ul>
        {applications.map((app, index) => (
          <li key={index}>
            <strong>{app.name}</strong> - {app.email} - {app.resume}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminView;
