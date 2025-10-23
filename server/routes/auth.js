const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Test route to verify auth routes are working
router.get('/test', (req, res) => {
  console.log('🧪 Auth test route hit');
  res.json({ message: 'Auth routes are working!', timestamp: new Date() });
});

// User Registration
router.post('/register', async (req, res) => {
  console.log('🔐 Registration attempt:', req.body);
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();
    console.log('✅ User created successfully:', user.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('💥 Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration: ' + error.message
    });
  }
});

// User Login
router.post('/user-login', async (req, res) => {
  console.log('🔐 Login attempt:', req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing login credentials');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for:', email);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login: ' + error.message
    });
  }
});

// Get user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get user applications (protected route)
router.get('/my-applications', authenticateToken, async (req, res) => {
  try {
    const Applicant = require('../models/Applicant');
    const applications = await Applicant.find({ 
      $or: [
        { userId: req.user.userId },
        { email: req.user.email } // Fallback for existing applications
      ]
    })
    .populate('jobId', 'title company description')
    .sort({ appliedAt: -1 });

    console.log(`✅ Found ${applications.length} applications for user ${req.user.email}`);

    res.json({
      success: true,
      applications: applications.map(app => ({
        id: app._id,
        jobTitle: app.jobId?.title || 'Unknown Job',
        company: app.jobId?.company || 'Unknown Company',
        jobDescription: app.jobId?.description || '',
        status: app.status,
        appliedAt: app.appliedAt,
        notes: app.notes,
        reviewedAt: app.reviewedAt
      }))
    });

  } catch (error) {
    console.error('💥 Applications fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching applications'
    });
  }
});

// Get application statistics for user dashboard
router.get('/application-stats', authenticateToken, async (req, res) => {
  try {
    const Applicant = require('../models/Applicant');
    const applications = await Applicant.find({ 
      $or: [
        { userId: req.user.userId },
        { email: req.user.email }
      ]
    });

    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'Pending').length,
      underReview: applications.filter(app => app.status === 'Under Review').length,
      interview: applications.filter(app => app.status === 'Interview Scheduled').length,
      approved: applications.filter(app => app.status === 'Approved').length,
      rejected: applications.filter(app => app.status === 'Rejected').length
    };

    console.log(`✅ Application stats for user ${req.user.email}:`, stats);

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('💥 Stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics'
    });
  }
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
}

module.exports = router;