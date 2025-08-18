
import React, { useState, useEffect, useRef } from 'react';
import Spinner from './Spinner';
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
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const xhrRef = useRef(null);

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
    setSubmitting(true);
    setUploadProgress(0);
    // ==== VALIDATION ====
    if (!formData.name.trim() || formData.name.length < 5) {
      toast.error("Name must be at least 5 characters long.");
      setSubmitting(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      setSubmitting(false);
      return;
    }
    if (!formData.jobId) {
      toast.error("Please select a job.");
      setSubmitting(false);
      return;
    }
    if (!formData.resume) {
      toast.error("Please upload your resume.");
      setSubmitting(false);
      return;
    }
    if (formData.resume.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      setSubmitting(false);
      return;
    }
    // ==== FORM SUBMISSION ====
    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('email', formData.email);
    submissionData.append('jobId', formData.jobId);
    submissionData.append('resume', formData.resume);
    xhrRef.current = new window.XMLHttpRequest();
    xhrRef.current.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhrRef.current.onreadystatechange = function () {
      if (xhrRef.current.readyState === 4) {
        setSubmitting(false);
        setUploadProgress(0);
        if (xhrRef.current.status === 200) {
          toast.success("Application submitted successfully!");
          setTimeout(() => navigate('/success'), 2000);
        } else {
          toast.error("Submission failed. Try again.");
        }
      }
    };
    xhrRef.current.open('POST', 'http://localhost:5000/api/applicants/apply');
    xhrRef.current.send(submissionData);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'flex-start',
      justifyContent: 'center',
      margin: 0,
      paddingTop: '64px',
      paddingBottom: 0,
    }}>
      <div className="form-container" style={{
        maxWidth: 480,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        padding: '32px 36px',
        fontFamily: 'Segoe UI, Arial, sans-serif',
        animation: 'fadeIn 0.5s',
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: 24,
          color: '#2d3748',
          fontWeight: 700,
          letterSpacing: 1,
        }}>Apply for a Job</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#4a5568', fontWeight: 500 }}>Full Name</label>
            <input
              name="name"
              placeholder="Enter your full name"
              onChange={handleChange}
              value={formData.name}
              required
              style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #cbd5e0',
            fontSize: 16,
            outline: 'none',
            marginBottom: 2,
              }}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#4a5568', fontWeight: 500 }}>Email</label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email address"
              onChange={handleChange}
              value={formData.email}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e0',
                fontSize: 16,
                outline: 'none',
                marginBottom: 2,
              }}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#4a5568', fontWeight: 500 }}>Job Title</label>
            <select
              name="jobId"
              onChange={handleChange}
              value={formData.jobId}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e0',
                fontSize: 16,
                outline: 'none',
                background: '#f7fafc',
              }}
            >
              <option value="">Select a Job</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#4a5568', fontWeight: 500 }}>Resume (PDF only)</label>
            <input
              name="resume"
              type="file"
              accept=".pdf"
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e0',
                fontSize: 16,
                outline: 'none',
                background: '#f7fafc',
              }}
            />
          </div>
          <button type="submit" disabled={submitting} style={{
            width: '100%',
            background: submitting ? '#a5b4fc' : 'linear-gradient(90deg,#3182ce 0%,#00bcd4 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 18,
            border: 'none',
            borderRadius: 8,
            padding: '12px 0',
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: submitting ? 'none' : '0 2px 8px rgba(49,130,206,0.08)',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>{submitting ? <Spinner size={20} /> : 'Submit Application'}</button>
          {submitting && uploadProgress > 0 && (
            <div style={{ width: '100%', marginTop: 10 }}>
              <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg,#3182ce 0%,#00bcd4 100%)', transition: 'width 0.3s' }}></div>
              </div>
              <div style={{ fontSize: 13, color: '#2563eb', marginTop: 2, textAlign: 'right' }}>{uploadProgress}%</div>
            </div>
          )}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </form>
        <ToastContainer position="top-center" autoClose={2000} />
      </div>
    </div>
  );
};

export default ApplicationForm;
