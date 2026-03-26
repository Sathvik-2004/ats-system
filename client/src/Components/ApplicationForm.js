import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ApplicationForm.css';
import DragDropUploader from './DragDropUploader';
import LoadingSpinner from './LoadingSpinner';

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_RESUME_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const ALLOWED_RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx'];

const isAllowedResume = (file) => {
  if (!file) return false;
  const fileName = String(file.name || '').toLowerCase();
  const hasAllowedExtension = ALLOWED_RESUME_EXTENSIONS.some((ext) => fileName.endsWith(ext));
  return ALLOWED_RESUME_MIME_TYPES.includes(file.type) || hasAllowedExtension;
};

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
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const res = await axios.get(`${API_URL}/api/jobs`);
        const jobsPayload = res.data?.data || res.data || [];
        setJobs(Array.isArray(jobsPayload) ? jobsPayload : []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setJobs([]);
        toast.error('Failed to load job list');
      }
    };
    
    // Pre-fill user data from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setFormData(prev => ({
          ...prev,
          name: user?.name || '',
          email: user?.email || ''
        }));
      } catch (_error) {
        // Ignore malformed localStorage userData and continue with empty defaults.
      }
    }
    
    fetchJobs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'resume') {
      const file = files?.[0];
      if (!file) return;

      if (!isAllowedResume(file)) {
        toast.error('Resume must be a PDF, DOC, or DOCX file.');
        return;
      }
      if (file.size > MAX_RESUME_SIZE_BYTES) {
        toast.error('Resume size must be 5 MB or less.');
        return;
      }

      setFormData({ ...formData, resume: file });
      toast.success('Resume uploaded successfully!');
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
    const selectedJob = jobs.find((job) => String(job._id) === String(formData.jobId));
    if (!selectedJob?._id) {
      toast.error('Selected job is invalid. Please reselect and try again.');
      setSubmitting(false);
      return;
    }
    if (!formData.resume) {
      toast.error("Please upload your resume.");
      setSubmitting(false);
      return;
    }
    if (!isAllowedResume(formData.resume)) {
      toast.error("Resume must be a PDF, DOC, or DOCX file.");
      setSubmitting(false);
      return;
    }
    if (formData.resume.size > MAX_RESUME_SIZE_BYTES) {
      toast.error("Resume size must be 5 MB or less.");
      setSubmitting(false);
      return;
    }
    // ==== FORM SUBMISSION ====
    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('email', formData.email);
    submissionData.append('jobId', selectedJob._id);
    submissionData.append('resume', formData.resume);

    console.log('[ApplicationForm] submitting application payload', {
      name: formData.name,
      email: formData.email,
      jobId: selectedJob._id,
      jobTitle: selectedJob.title,
      hasResume: Boolean(formData.resume)
    });
    
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
        if (xhrRef.current.status >= 200 && xhrRef.current.status < 300) {
          toast.success("Application submitted successfully!");
          setTimeout(() => navigate('/success'), 2000);
        } else {
          let backendMessage = '';
          try {
            const parsed = JSON.parse(xhrRef.current.responseText || '{}');
            backendMessage = parsed.message || parsed.error || '';
          } catch (_error) {
            backendMessage = '';
          }
          toast.error(backendMessage || `Submission failed (${xhrRef.current.status}). Try again.`);
        }
      }
    };
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    xhrRef.current.open('POST', `${API_URL}/api/applications/apply`);
    if (token) {
      xhrRef.current.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhrRef.current.send(submissionData);
  };

  return (
    <div className="application-form-shell">
      {/* Form Header */}
      <div className="application-form-header">
        <div className="application-form-badge">Apply</div>
        <h2>Apply for a Job</h2>
        <p>Fill out the form below to submit your application.</p>
      </div>
      {/* Enhanced Form */}
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="application-form">
        {/* Full Name Field */}
        <div className="form-field">
          <label>Full Name</label>
          <input
            name="name"
            placeholder="k.sathvik reddy"
            onChange={handleInputChange}
            value={formData.name}
            required
          />
        </div>

        {/* Email Field */}
        <div className="form-field">
          <label>Email Address</label>
          <input
            name="email"
            type="email"
            placeholder="sathwikreddy9228@gmail.com"
            onChange={handleInputChange}
            value={formData.email}
            required
          />
        </div>

        {/* Job Title Field */}
        <div className="form-field">
          <label>Job Title</label>
          <select
            name="jobId"
            onChange={handleInputChange}
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
        </div>

        {/* Resume Upload Field */}
        <div className="form-field">
          <label>Resume Upload</label>
          
          <DragDropUploader
            onFilesSelected={(files) => {
              if (files.length > 0) {
                const file = files[0].file;
                if (!isAllowedResume(file)) {
                  toast.error('Resume must be a PDF, DOC, or DOCX file.');
                  return;
                }
                if (file.size > MAX_RESUME_SIZE_BYTES) {
                  toast.error('Resume size must be 5 MB or less.');
                  return;
                }
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
          className="btn btn-primary form-submit-btn"
        >
          {submitting ? (
            <div className="submit-loading">
              <LoadingSpinner size="small" />
              Submitting...
            </div>
          ) : (
            <>
              Submit Application
            </>
          )}
        </button>

        {/* Upload Progress */}
        {submitting && uploadProgress > 0 && (
          <div className="upload-progress">
            <div className="upload-progress-row">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="upload-track">
              <div className="upload-fill" style={{ width: `${uploadProgress}%` }}></div>
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
      />
    </div>
  );
};

export default ApplicationForm;
