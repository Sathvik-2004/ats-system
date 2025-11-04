// SIMPLIFIED SERVER FOR QUICK TESTING
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

console.log('🚀 SIMPLIFIED SERVER STARTING...');

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://lessats-systemgreater-production.up.railway.app'],
  credentials: true
}));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sathwikreddy9228_db_user:AtsSystem2024!@ats-production-cluster.gl3adlt.mongodb.net/ats_production?retryWrites=true&w=majority&appName=ats-production-cluster';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.log('⚠️ MongoDB error, running without DB:', err.message));

// Simple schemas
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' }
});

const ApplicationSchema = new mongoose.Schema({
  name: String,
  email: String,
  jobTitle: String,
  status: { type: String, default: 'pending' },
  appliedDate: { type: Date, default: Date.now }
});

const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  salary: String,
  description: String,
  status: { type: String, default: 'active' }
});

const User = mongoose.model('User', UserSchema);
const Application = mongoose.model('Application', ApplicationSchema);
const Job = mongoose.model('Job', JobSchema);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'ATS Server is running!' });
});

// Jobs API
app.get('/api/jobs', (req, res) => {
  const mockJobs = [
    { _id: '1', title: 'Frontend Developer', company: 'TechCorp', location: 'Remote', salary: '$75,000' },
    { _id: '2', title: 'Backend Developer', company: 'DataFlow', location: 'New York', salary: '$85,000' },
    { _id: '3', title: 'Full Stack Developer', company: 'Innovation Labs', location: 'San Francisco', salary: '$95,000' }
  ];
  res.json(mockJobs);
});

// Admin login
app.post('/api/auth/admin-login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'ksreddy@2004') {
    res.json({
      success: true,
      token: 'mock-admin-token',
      user: { username: 'admin', role: 'admin' }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// User login
app.post('/api/auth/user-login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock user login
  if (email && password) {
    res.json({
      success: true,
      token: 'mock-user-token',
      user: { email, role: 'user' }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Applications API
app.get('/api/admin/applications', (req, res) => {
  const mockApplications = [
    {
      _id: 'app1',
      name: 'John Doe',
      email: 'john@example.com',
      jobTitle: 'Frontend Developer',
      status: 'pending',
      appliedDate: new Date().toISOString()
    },
    {
      _id: 'app2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      jobTitle: 'Backend Developer',
      status: 'approved',
      appliedDate: new Date().toISOString()
    }
  ];
  res.json(mockApplications);
});

// Auto-process applications
app.post('/api/admin/auto-process', (req, res) => {
  res.json({
    success: true,
    processedCount: 5,
    statistics: { approved: 2, rejected: 1, interviewed: 2 }
  });
});

// Admin jobs
app.get('/api/admin/jobs', (req, res) => {
  const mockAdminJobs = [
    {
      _id: 'job1',
      title: 'Frontend Developer',
      company: 'TechCorp Solutions',
      location: 'Remote',
      salary: '$75,000 - $95,000',
      status: 'Active'
    },
    {
      _id: 'job2',
      title: 'Backend Developer',
      company: 'DataFlow Systems',
      location: 'New York, NY',
      salary: '$80,000 - $100,000',
      status: 'Active'
    }
  ];
  res.json(mockAdminJobs);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🚀 API Base: http://localhost:${PORT}/api`);
});

module.exports = app;