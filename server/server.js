// ATS SYSTEM BACKEND FOR RENDER.COM
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const app = express();

console.log('🚀 ATS BACKEND STARTING ON RENDER.COM...');

// MongoDB Connection - Fix URL encoding
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sathwikreddy9228_db_user:AtsSystem2024%21@ats-production-cluster.gl3adlt.mongodb.net/ats_production?retryWrites=true&w=majority&appName=ats-production-cluster';

// Try connecting to MongoDB with fallback
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.log('⚠️ Running in fallback mode without database');
  });

// Simple User schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' }
});

// Simple Application schema
const ApplicationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  position: String,
  experience: String,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const JobSchema = new mongoose.Schema({}, { strict: false, collection: 'jobs' });

const User = mongoose.model('User', UserSchema);
const Application = mongoose.model('Application', ApplicationSchema);
const Job = mongoose.model('Job', JobSchema);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration for Render.com
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://ats-system-flame.vercel.app',
    'https://*.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  console.log('✅ Health check');
  res.json({ status: 'OK', time: new Date() });
});

// Health check for Railway
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Basic health check
app.get('/', (req, res) => {
  res.json({ message: 'ATS Basic Server Running', status: 'OK' });
});

// Basic application endpoint
app.post('/api/applicants/apply', async (req, res) => {
  console.log('📝 Application received:', req.body);
  try {
    const application = new Application(req.body);
    await application.save();
    
    res.json({ 
      success: true, 
      message: 'Application submitted successfully',
      data: application 
    });
  } catch (error) {
    console.error('Error saving application:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit application' 
    });
  }
});

// Test endpoint
app.post('/api/applicants/test-submit', (req, res) => {
  console.log('🧪 Test submission:', req.body);
  res.json({ success: true, test: 'working' });
});

// Add missing endpoints that frontend expects
app.get('/api/jobs', (req, res) => {
  console.log('📋 Jobs requested');
  Job.find({ isActive: { $ne: false } })
    .sort({ createdAt: -1 })
    .then((jobs) => {
      console.log(`✅ Returning ${jobs.length} jobs from MongoDB`);
      res.json(jobs);
    })
    .catch((error) => {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch jobs' });
    });
});

app.post('/api/auth/user-register', async (req, res) => {
  console.log('👤 User registration:', req.body);
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Create new user
    const user = new User({ name, email, password, role: 'user' });
    await user.save();
    
    res.json({ 
      success: true,
      message: 'User registered successfully',
      user: { name, email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed'
    });
  }
});

app.post('/api/auth/user-login', async (req, res) => {
  console.log('👤 User login attempt:', req.body);
  try {
    const { email, password } = req.body;
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    
    // Find user in database and support both hashed and legacy plaintext passwords.
    const user = await User.findOne({ email });
    let userPasswordMatched = false;
    if (user) {
      try {
        userPasswordMatched = await bcrypt.compare(password, user.password);
      } catch (_err) {
        userPasswordMatched = false;
      }

      if (!userPasswordMatched && user.password === password) {
        userPasswordMatched = true;
      }
    }

    if (user && userPasswordMatched) {
      res.json({ 
        success: true,
        message: 'User login successful',
        token: 'user-token-' + user._id,
        user: { email: user.email, name: user.name, id: user._id }
      });
    } else {
      res.status(401).json({ 
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed'
    });
  }
});

app.post('/api/auth/admin-login', async (req, res) => {
  console.log('👨‍💼 Admin login attempt:', req.body);
  const { username, password } = req.body;
  try {

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    
    // Try database first and support legacy records that used `username` field.
    const admin = await User.findOne({ 
      $or: [
        { email: username, role: 'admin' },
        { name: username, role: 'admin' },
        { username: username, role: 'admin' }
      ],
    });

    let adminPasswordMatched = false;
    if (admin) {
      try {
        adminPasswordMatched = await bcrypt.compare(password, admin.password);
      } catch (_err) {
        adminPasswordMatched = false;
      }

      if (!adminPasswordMatched && admin.password === password) {
        adminPasswordMatched = true;
      }
    }
    
    if (admin && adminPasswordMatched) {
      res.json({ 
        success: true,
        message: 'Admin login successful',
        token: 'admin-token-' + admin._id,
        admin: { username: admin.username || admin.name || admin.email, role: 'admin', id: admin._id }
      });
    } else {
      res.status(401).json({ 
        success: false,
        message: 'Invalid admin credentials'
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Admin login failed'
    });
  }
});

app.get('/api/auth/my-applications', async (req, res) => {
  console.log('📋 My applications requested');
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.json([]);
  }
});

app.get('/api/auth/application-stats', async (req, res) => {
  console.log('📊 Application stats requested');
  try {
    const total = await Application.countDocuments();
    const pending = await Application.countDocuments({ status: 'pending' });
    const approved = await Application.countDocuments({ status: 'approved' });
    const rejected = await Application.countDocuments({ status: 'rejected' });
    
    res.json({ total, pending, approved, rejected });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.json({ total: 0, pending: 0, approved: 0, rejected: 0 });
  }
});

// Analytics endpoints
app.get('/api/analytics/dashboard/full-data', async (req, res) => {
  console.log('📊 Full analytics dashboard data requested');
  try {
    const totalApplications = await Application.countDocuments();
    const totalJobs = await Job.countDocuments({ isActive: { $ne: false } });
    const totalUsers = await User.countDocuments();
    
    res.json({
      success: true,
      data: {
        totalApplications,
        totalJobs,
        totalUsers,
        applicationsByStatus: {
          pending: await Application.countDocuments({ status: 'pending' }),
          approved: await Application.countDocuments({ status: 'approved' }),
          rejected: await Application.countDocuments({ status: 'rejected' })
        },
        recentApplications: await Application.find().sort({ createdAt: -1 }).limit(10)
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics data' });
  }
});

app.get('/api/reports/summary', async (req, res) => {
  console.log('📈 Reports summary requested');
  try {
    res.json({
      success: true,
      data: {
        totalApplications: await Application.countDocuments(),
        totalJobs: await Job.countDocuments({ isActive: { $ne: false } }),
        conversionRate: 0,
        averageTimeToHire: 0
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports summary' });
  }
});

// Catch all API routes
app.use('/api/*', (req, res) => {
  console.log(`❓ Unknown API route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Endpoint not found (basic server mode)',
    method: req.method,
    path: req.originalUrl 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Basic server running on port ${PORT}`);
});