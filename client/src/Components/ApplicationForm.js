import React, { useState, useEffect, useRef } from 'react';
import Spinner from './Spinner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ApplicationForm.css';
import DragDropUploader from './DragDropUploader';
import LoadingSpinner from './LoadingSpinner';

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
    
    // Pre-fill user data from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
    
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
    
    // Add authorization header
    const token = localStorage.getItem('token');
    
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
    if (token) {
      xhrRef.current.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhrRef.current.send(submissionData);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Form Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          marginBottom: '16px',
          fontSize: '24px',
        }}>
          📝
        </div>
        <h2 style={{
          margin: 0,
          color: '#2d3748',
          fontWeight: 700,
          fontSize: '28px',
          marginBottom: '8px',
        }}>Apply for a Job</h2>
        <p style={{
          margin: 0,
          color: '#718096',
          fontSize: '16px',
        }}>Fill out the form below to submit your application</p>
      </div>
      {/* Enhanced Form */}
      <form onSubmit={handleSubmit} encType="multipart/form-data" style={{
        display: 'grid',
        gap: '24px',
      }}>
        {/* Full Name Field */}
        <div style={{ position: 'relative' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#4a5568',
            fontWeight: 600,
            fontSize: '14px',
            letterSpacing: '0.5px',
          }}>
            👤 Full Name
          </label>
          <input
            name="name"
            placeholder="k.sathvik reddy"
            onChange={handleChange}
            value={formData.name}
            required
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.3s',
              background: '#f8fafc',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.background = '#fff';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.background = '#f8fafc';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Email Field */}
        <div style={{ position: 'relative' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#4a5568',
            fontWeight: 600,
            fontSize: '14px',
            letterSpacing: '0.5px',
          }}>
            📧 Email Address
          </label>
          <input
            name="email"
            type="email"
            placeholder="sathwikreddy9228@gmail.com"
            onChange={handleChange}
            value={formData.email}
            required
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.3s',
              background: '#f8fafc',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.background = '#fff';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.background = '#f8fafc';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Job Title Field */}
        <div style={{ position: 'relative' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#4a5568',
            fontWeight: 600,
            fontSize: '14px',
            letterSpacing: '0.5px',
          }}>
            💼 Job Title
          </label>
          <select
            name="jobId"
            onChange={handleChange}
            value={formData.jobId}
            required
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.3s',
              background: '#f8fafc',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.background = '#fff';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.background = '#f8fafc';
              e.target.style.boxShadow = 'none';
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

        {/* Resume Upload Field */}
        <div style={{ position: 'relative' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#4a5568',
            fontWeight: 600,
            fontSize: '14px',
            letterSpacing: '0.5px',
          }}>
            📎 Resume Upload
          </label>
          
          <DragDropUploader
            onFilesSelected={(files) => {
              if (files.length > 0) {
                const file = files[0].file;
                setFormData(prev => ({ ...prev, resume: file }));
                toast.success('Resume uploaded successfully!');
              }
            }}
            acceptedTypes={['.pdf', '.doc', '.docx']}
            maxFileSize={5}
            allowMultiple={false}
            existingFiles={formData.resume ? [{
              id: 1,
              name: formData.resume.name,
              size: formData.resume.size,
              status: 'completed',
              progress: 100
            }] : []}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            background: submitting
              ? 'linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '18px',
            border: 'none',
            borderRadius: '12px',
            padding: '18px 0',
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: submitting
              ? 'none'
              : '0 8px 25px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            letterSpacing: '0.5px',
          }}
          onMouseEnter={(e) => {
            if (!submitting) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!submitting) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
            }
          }}
        >
          {submitting ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LoadingSpinner size="small" />
              Submitting...
            </div>
          ) : (
            <>
              🚀 Submit Application
            </>
          )}
        </button>

        {/* Upload Progress */}
        {submitting && uploadProgress > 0 && (
          <div style={{
            background: '#f7fafc',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#4a5568' }}>
                Uploading...
              </span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#667eea' }}>
                {uploadProgress}%
              </span>
            </div>
            <div style={{
              height: '8px',
              background: '#e2e8f0',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                transition: 'width 0.3s ease',
                borderRadius: '4px',
              }}></div>
            </div>
          </div>
        )}
      </form>
      
      <ToastContainer 
        position="top-center" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{
          fontSize: '14px',
        }}
      />
    </div>
  );
};

export default ApplicationForm;
