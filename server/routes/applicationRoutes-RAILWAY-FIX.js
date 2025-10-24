const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Applicant = require('../models/Applicant');

console.log('🚀 ApplicationRoutes RAILWAY FIX - Simple JSON submissions only');

// Simple auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

// Admin auth middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    const decoded = jwt.verify(token, 'secretkey');
    if (decoded.username) {
      req.admin = decoded;
      return next();
    }
  } catch (adminErr) {
    try {
      const userDecoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      return res.status(403).json({ error: 'Admin privileges required' });
    } catch (userErr) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
  }

  return res.status(401).json({ error: 'Admin authentication required' });
};

// RAILWAY DEPLOYMENT TEST ENDPOINT
router.post('/railway-test', async (req, res) => {
  try {
    console.log('🚀 Railway test endpoint hit');
    res.status(200).json({ 
      message: 'Railway deployment successful!', 
      timestamp: new Date().toISOString(),
      version: 'FIXED'
    });
  } catch (error) {
    console.error('Railway test error:', error);
    res.status(500).json({ error: 'Test failed' });
  }
});

// MAIN APPLICATION SUBMISSION - SIMPLIFIED FOR RAILWAY
router.post('/apply', authenticateToken, async (req, res) => {
  try {
    console.log('📝 RAILWAY FIX - Application submission:', req.body);
    
    const { name, email, jobId } = req.body;
    
    // Basic validation
    if (!name || !email || !jobId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'email', 'jobId']
      });
    }
    
    console.log('✅ Creating application...');
    
    const newApplicant = new Applicant({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      resume: 'railway-fix-submission.txt',
      jobId,
      userId: req.user?.userId,
      appliedAt: new Date(),
      status: 'Pending'
    });

    const saved = await newApplicant.save();
    
    console.log('✅ SUCCESS - Application saved:', saved._id);
    
    res.status(200).json({ 
      message: 'Application submitted successfully!',
      success: true,
      applicationId: saved._id,
      status: saved.status
    });
    
  } catch (error) {
    console.error('💥 Application error:', error.message);
    res.status(500).json({ 
      error: 'Submission failed',
      details: error.message
    });
  }
});

// GET user applications
router.get('/user', async (req, res) => {
  try {
    console.log('📋 Getting user applications...');
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let user;
    try {
      user = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!user || !user.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const applications = await Applicant.find({ userId: user.userId }).populate('jobId');
    console.log(`✅ Found ${applications.length} applications for user`);
    
    res.status(200).json(applications);
  } catch (error) {
    console.error('💥 User applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// GET all applicants (admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    console.log('📋 Getting all applicants...');
    const applicants = await Applicant.find().populate('jobId');
    console.log(`✅ Found ${applicants.length} applicants`);
    res.status(200).json(applicants);
  } catch (error) {
    console.error('💥 Applicants fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
});

// Update application status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updated = await Applicant.findByIdAndUpdate(
      id,
      { 
        status,
        notes: notes || '',
        reviewedAt: new Date(),
        reviewedBy: req.user?.userId
      },
      { new: true }
    ).populate('jobId');

    if (!updated) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.status(200).json({ 
      message: 'Status updated successfully',
      applicant: updated 
    });

  } catch (error) {
    console.error('💥 Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Patch status (simple)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!applicant) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.status(200).json(applicant);
  } catch (error) {
    console.error('Patch status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;