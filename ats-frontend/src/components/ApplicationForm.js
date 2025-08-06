import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ApplicationForm.css';

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    resume: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/applicants/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate('/success');
      } else {
        alert('Submission failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting form');
    }
  };

  return (
    <div className="form-container">
      <h2>Job Application</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full Name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="resume" placeholder="Resume Link" onChange={handleChange} required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ApplicationForm;
