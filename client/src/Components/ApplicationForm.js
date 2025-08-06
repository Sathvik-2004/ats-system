import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ApplicationForm.css';

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    jobId: '',
    resume: null,
  });

  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/jobs");
        setJobs(res.data);
      } catch (err) {
        toast.error("Failed to fetch jobs");
        console.error("Error fetching jobs:", err);
      }
    };
    fetchJobs();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'resume') {
      setFormData({ ...formData, resume: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ==== VALIDATION ====
    if (!formData.name.trim() || formData.name.length < 5) {
      toast.error("Name must be at least 5 characters long.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!formData.jobId) {
      toast.error("Please select a job.");
      return;
    }

    if (!formData.resume) {
      toast.error("Please upload your resume.");
      return;
    }

    if (formData.resume.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      return;
    }

    // ==== FORM SUBMISSION ====
    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('email', formData.email);
    submissionData.append('jobId', formData.jobId);
    submissionData.append('resume', formData.resume);

    try {
      const response = await fetch('http://localhost:5000/api/applicants/apply', {
        method: 'POST',
        body: submissionData,
      });

      if (response.ok) {
        toast.success("Application submitted successfully!");
        setTimeout(() => navigate('/success'), 2000);
      } else {
        toast.error("Submission failed. Try again.");
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error("Server error. Please try again later.");
    }
  };

  return (
    <div className="form-container">
      <h2>Job Application</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          value={formData.name}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          value={formData.email}
          required
        />
        <select
          name="jobId"
          onChange={handleChange}
          value={formData.jobId}
          required
        >
          <option value="">Select a Job</option>
          {jobs.map((job) => (
            <option key={job._id} value={job._id}>
              {job.title}
            </option>
          ))}
        </select>
        <input
          name="resume"
          type="file"
          accept=".pdf"
          onChange={handleChange}
          required
        />
        <button type="submit">Submit</button>
      </form>
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default ApplicationForm;
