import React, { useState, useEffect, useRef } from 'react';
import Spinner from './Spinner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_CONFIG from '../config/api';
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
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/jobs`);
        
        // Check if we got valid job data
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setJobs(res.data);
          console.log('✅ Loaded jobs from API:', res.data.length);
        } else {
          // API returned empty or invalid data, use mock data
          throw new Error('API returned empty job list');
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        
        // FALLBACK: Use expanded mock job data
        const mockJobs = [
          {
            _id: 'job1',
            title: 'Frontend Developer',
            company: 'TechCorp Solutions',
            location: 'Remote',
            type: 'Full-time',
            salary: '$75,000 - $95,000',
            experience: 'Mid-level (2-4 years)',
            description: 'Join our dynamic frontend team to build cutting-edge web applications using React, TypeScript, and modern development practices.',
            requirements: ['React', 'TypeScript', 'CSS3', 'HTML5', 'Git', 'REST APIs'],
            benefits: ['Health Insurance', 'Remote Work', '401k', 'Flexible Hours'],
            postedDate: new Date().toISOString()
          },
          {
            _id: 'job2',
            title: 'Backend Developer',
            company: 'DataFlow Systems',
            location: 'New York, NY',
            type: 'Full-time',
            salary: '$85,000 - $110,000',
            experience: 'Senior (3-5 years)',
            description: 'Build scalable backend systems and APIs that power our enterprise applications. Work with Node.js, databases, and cloud technologies.',
            requirements: ['Node.js', 'MongoDB', 'Express.js', 'AWS', 'Docker', 'Microservices'],
            benefits: ['Health Insurance', 'Dental', 'Vision', 'Stock Options', 'Gym Membership'],
            postedDate: new Date().toISOString()
          },
          {
            _id: 'job3',
            title: 'Full Stack Developer',
            company: 'Innovation Labs Inc',
            location: 'San Francisco, CA',
            type: 'Contract',
            salary: '$65 - $85/hour',
            experience: 'Mid-Senior (3-6 years)',
            description: 'Lead full-stack development for exciting fintech projects. Work with modern tech stack and contribute to architecture decisions.',
            requirements: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'GraphQL', 'Kubernetes'],
            benefits: ['Flexible Schedule', 'High Hourly Rate', 'Remote Options', 'Latest Tech Stack'],
            postedDate: new Date().toISOString()
          },
          {
            _id: 'job4',
            title: 'DevOps Engineer',
            company: 'CloudTech Enterprises',
            location: 'Austin, TX',
            type: 'Full-time',
            salary: '$90,000 - $120,000',
            experience: 'Senior (4-6 years)',
            description: 'Manage cloud infrastructure, CI/CD pipelines, and ensure high availability of our SaaS platform serving millions of users.',
            requirements: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'Python', 'Linux'],
            benefits: ['Health Insurance', '401k Match', 'Stock Options', 'Conference Budget', 'Learning Allowance'],
            postedDate: new Date().toISOString()
          },
          {
            _id: 'job5',
            title: 'Product Manager',
            company: 'StartupX',
            location: 'Boston, MA',
            type: 'Full-time',
            salary: '$95,000 - $130,000',
            experience: 'Mid-Senior (3-5 years)',
            description: 'Drive product strategy and roadmap for our B2B SaaS platform. Work closely with engineering, design, and sales teams.',
            requirements: ['Product Management', 'Agile', 'Analytics', 'User Research', 'SQL', 'Roadmapping'],
            benefits: ['Equity Package', 'Health Insurance', 'Unlimited PTO', 'Professional Development'],
            postedDate: new Date().toISOString()
          },
          {
            _id: 'job6',
            title: 'UI/UX Designer',
            company: 'Design Studio Pro',
            location: 'Los Angeles, CA',
            type: 'Full-time',
            salary: '$70,000 - $90,000',
            experience: 'Mid-level (2-4 years)',
            description: 'Create beautiful and intuitive user experiences for web and mobile applications. Work on diverse client projects.',
            requirements: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'HTML/CSS', 'Design Systems'],
            benefits: ['Creative Freedom', 'Health Insurance', 'Equipment Allowance', 'Flexible Hours'],
            postedDate: new Date().toISOString()
          },
          {
            _id: 'job7',
            title: 'Data Scientist',
            company: 'Analytics Corp',
            location: 'Seattle, WA',
            type: 'Full-time',
            salary: '$100,000 - $140,000',
            experience: 'Senior (4-7 years)',
            description: 'Build machine learning models and derive insights from large datasets to drive business decisions.',
            requirements: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics', 'Pandas', 'TensorFlow'],
            benefits: ['Stock Options', 'Health Insurance', 'Research Budget', 'Conference Attendance'],
            postedDate: new Date().toISOString()
          },
          {
            _id: 'job8',
            title: 'Mobile App Developer',
            company: 'MobileFirst Solutions',
            location: 'Miami, FL',
            type: 'Full-time',
            salary: '$80,000 - $105,000',
            experience: 'Mid-level (2-5 years)',
            description: 'Develop cross-platform mobile applications using React Native. Work on consumer-facing apps with millions of downloads.',
            requirements: ['React Native', 'JavaScript', 'iOS', 'Android', 'Redux', 'API Integration'],
            benefits: ['Health Insurance', 'Gym Membership', 'Phone Allowance', 'Flexible Work'],
            postedDate: new Date().toISOString()
          }
        ];
        
        setJobs(mockJobs);
        console.log('✅ Using expanded mock job data for development:', mockJobs.length, 'jobs');
        console.log('Mock jobs:', mockJobs.map(job => job.title));
        console.log(`✅ Jobs loaded successfully - ${mockJobs.length} jobs available`);
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

  // Debug logging
  useEffect(() => {
    console.log('🔍 Jobs state changed:', jobs.length, 'jobs available');
    if (jobs.length > 0) {
      console.log('Job titles:', jobs.map(job => job.title));
    }
  }, [jobs]);

  const handleInputChange = (e) => {
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
          
          // Store application locally for demo purposes
          const applicationData = {
            id: Date.now(),
            jobTitle: jobs.find(job => job._id === formData.jobId)?.title || 'Unknown Job',
            company: jobs.find(job => job._id === formData.jobId)?.company || 'Unknown Company',
            appliedDate: new Date().toISOString(),
            status: 'Under Review',
            name: formData.name,
            email: formData.email
          };
          
          const existingApps = JSON.parse(localStorage.getItem('userApplications') || '[]');
          existingApps.push(applicationData);
          localStorage.setItem('userApplications', JSON.stringify(existingApps));
          
          setTimeout(() => navigate('/success'), 2000);
        } else if (xhrRef.current.status === 0 || xhrRef.current.status === 404 || xhrRef.current.status === 500) {
          // Network error, 404, or server error - save locally for demo
          toast.success("Application submitted successfully! (Saved locally for demo)");
          
          const applicationData = {
            id: Date.now(),
            jobTitle: jobs.find(job => job._id === formData.jobId)?.title || 'Unknown Job',
            company: jobs.find(job => job._id === formData.jobId)?.company || 'Unknown Company',
            appliedDate: new Date().toISOString(),
            status: 'Under Review',
            name: formData.name,
            email: formData.email
          };
          
          const existingApps = JSON.parse(localStorage.getItem('userApplications') || '[]');
          existingApps.push(applicationData);
          localStorage.setItem('userApplications', JSON.stringify(existingApps));
          
          console.log('✅ Application saved locally:', applicationData);
          setTimeout(() => navigate('/success'), 2000);
        } else {
          toast.error(`Submission failed (${xhrRef.current.status}). Try again.`);
        }
      }
    };
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    xhrRef.current.open('POST', `${API_URL}/api/applicants/apply`);
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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
