// BASIC SERVER WITH DATABASE CONNECTION FOR RENDER
const express = require('express');
const mongoose = require('mongoose');
const app = express();

console.log('🚀 BASIC SERVER WITH DATABASE STARTING...');

// MongoDB Connection - Fix URL encoding
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sathwikreddy9228_db_user:AtsSystem2024!@ats-production-cluster.gl3adlt.mongodb.net/ats_production?retryWrites=true&w=majority&appName=ats-production-cluster';

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

const User = mongoose.model('User', UserSchema);
const Application = mongoose.model('Application', ApplicationSchema);

// Basic middleware
app.use(express.json());

// Allow CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

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
  // Return comprehensive job list matching frontend
  const jobs = [
    {
      _id: 'job1',
      title: 'Frontend Developer',
      company: 'TechCorp Solutions',
      location: 'Remote',
      type: 'Full-time',
      salary: '$75,000 - $95,000',
      experience: 'Mid-level (2-4 years)',
      description: 'Join our dynamic frontend team to build cutting-edge web applications using React, TypeScript, and modern development practices.',
      requirements: ['React', 'TypeScript', 'CSS', 'JavaScript', 'Git', 'Responsive Design'],
      postedDate: new Date().toISOString()
    },
    {
      _id: 'job2',
      title: 'Backend Developer',
      company: 'DataFlow Systems',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$80,000 - $110,000',
      experience: 'Mid-level (3-5 years)',
      description: 'Build scalable backend systems and APIs that power our data processing platform serving millions of users.',
      requirements: ['Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker', 'REST APIs'],
      postedDate: new Date().toISOString()
    },
    {
      _id: 'job3',
      title: 'Full Stack Developer',
      company: 'Innovation Labs Inc',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$90,000 - $120,000',
      experience: 'Senior (4-6 years)',
      description: 'Lead full-stack development of innovative products from concept to deployment in a fast-paced startup environment.',
      requirements: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'GraphQL', 'Kubernetes'],
      postedDate: new Date().toISOString()
    },
    {
      _id: 'job4',
      title: 'DevOps Engineer',
      company: 'CloudTech Enterprises',
      location: 'Austin, TX',
      type: 'Full-time',
      salary: '$95,000 - $130,000',
      experience: 'Senior (5+ years)',
      description: 'Design and maintain cloud infrastructure, CI/CD pipelines, and automation tools for enterprise-scale applications.',
      requirements: ['AWS/Azure', 'Kubernetes', 'Docker', 'Jenkins', 'Terraform', 'Python'],
      postedDate: new Date().toISOString()
    },
    {
      _id: 'job5',
      title: 'Product Manager',
      company: 'StartupX',
      location: 'Boston, MA',
      type: 'Full-time',
      salary: '$100,000 - $135,000',
      experience: 'Senior (4-7 years)',
      description: 'Drive product strategy and execution for our B2B SaaS platform, working closely with engineering and design teams.',
      requirements: ['Product Management', 'Agile/Scrum', 'Data Analysis', 'User Research', 'Roadmap Planning', 'Stakeholder Management'],
      postedDate: new Date().toISOString()
    },
    {
      _id: 'job6',
      title: 'UI/UX Designer',
      company: 'Design Studio Pro',
      location: 'Los Angeles, CA',
      type: 'Full-time',
      salary: '$70,000 - $95,000',
      experience: 'Mid-level (2-5 years)',
      description: 'Create intuitive and beautiful user experiences for web and mobile applications. Join our creative team!',
      requirements: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Design Systems', 'HTML/CSS'],
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
      requirements: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics', 'Tableau/PowerBI'],
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
      requirements: ['React Native', 'iOS/Android', 'JavaScript', 'Mobile UI/UX', 'App Store Deployment', 'API Integration'],
      postedDate: new Date().toISOString()
    }
  ];
  
  console.log(`✅ Returning ${jobs.length} jobs`);
  res.json(jobs);
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
    
    // Fallback user credentials when database is not available
    if (mongoose.connection.readyState !== 1) {
      if (email === 'user@test.com' && password === 'user123') {
        return res.json({ 
          success: true,
          message: 'User login successful (fallback mode)',
          token: 'user-token-fallback',
          user: { email: 'user@test.com', name: 'Test User', id: 'fallback' }
        });
      } else {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid email or password'
        });
      }
    }
    
    // Find user in database
    const user = await User.findOne({ email, password });
    if (user) {
      res.json({ 
        success: true,
        message: 'User login successful',
        token: 'user-token-' + user._id,
        user: { email: user.email, name: user.name, id: user._id }
      });
    } else {
      // Fallback credentials if database user not found
      if (email === 'user@test.com' && password === 'user123') {
        return res.json({ 
          success: true,
          message: 'User login successful (fallback mode)',
          token: 'user-token-fallback',
          user: { email: 'user@test.com', name: 'Test User', id: 'fallback' }
        });
      }
      
      res.status(401).json({ 
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    
    // Fallback on error
    const { email, password } = req.body;
    if (email === 'user@test.com' && password === 'user123') {
      return res.json({ 
        success: true,
        message: 'User login successful (fallback mode)',
        token: 'user-token-fallback',
        user: { email: 'user@test.com', name: 'Test User', id: 'fallback' }
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Login failed'
    });
  }
});

app.post('/api/auth/admin-login', async (req, res) => {
  console.log('👨‍💼 Admin login attempt:', req.body);
  try {
    const { username, password } = req.body;
    
    // Fallback admin credentials when database is not available
    if (mongoose.connection.readyState !== 1) {
      if (username === 'admin' && password === 'admin123') {
        return res.json({ 
          success: true,
          message: 'Admin login successful (fallback mode)',
          token: 'admin-token-fallback',
          admin: { username: 'admin', role: 'admin', id: 'fallback' }
        });
      } else {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid admin credentials (fallback mode)'
        });
      }
    }
    
    // Try database first
    const admin = await User.findOne({ 
      $or: [
        { email: username, role: 'admin' },
        { name: username, role: 'admin' }
      ],
      password: password 
    });
    
    if (admin) {
      res.json({ 
        success: true,
        message: 'Admin login successful',
        token: 'admin-token-' + admin._id,
        admin: { username: admin.name || admin.email, role: 'admin', id: admin._id }
      });
    } else {
      // Fallback if no admin found in database
      if (username === 'admin' && password === 'admin123') {
        res.json({ 
          success: true,
          message: 'Admin login successful (fallback)',
          token: 'admin-token-fallback',
          admin: { username: 'admin', role: 'admin', id: 'fallback' }
        });
      } else {
        res.status(401).json({ 
          success: false,
          message: 'Invalid admin credentials. Try username: admin, password: admin123'
        });
      }
    }
  } catch (error) {
    console.error('Admin login error:', error);
    // Fallback on error
    if (username === 'admin' && password === 'admin123') {
      res.json({ 
        success: true,
        message: 'Admin login successful (error fallback)',
        token: 'admin-token-error-fallback',
        admin: { username: 'admin', role: 'admin', id: 'error-fallback' }
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: 'Admin login failed. Try username: admin, password: admin123'
      });
    }
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