const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Applicant = require('../models/Applicant'); // ✅ Applicant model

console.log('📋 ApplicationRoutes loaded - Production-ready JSON submissions');

// Middleware to authenticate token (optional for backward compatibility)
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

// Middleware to authenticate admin token
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    // Check if it's an admin token (from admin login)
    const decoded = jwt.verify(token, 'secretkey'); // Admin tokens use 'secretkey'
    if (decoded.username) {
      req.admin = decoded;
      return next();
    }
  } catch (adminErr) {
    // If admin token verification fails, try user token
    try {
      const userDecoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      // Only allow if user has admin privileges (you can add this logic)
      return res.status(403).json({ error: 'Admin privileges required' });
    } catch (userErr) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
  }

  return res.status(401).json({ error: 'Admin authentication required' });
};

// POST /api/applicants/test-submit (basic test endpoint)
router.post('/test-submit', async (req, res) => {
  try {
    console.log('🧪 Test endpoint hit:', req.body);
    res.status(200).json({ 
      message: 'Test endpoint working!', 
      received: req.body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('💥 Test error:', error);
    res.status(500).json({ error: 'Test failed', details: error.message });
  }
});

// POST /api/applicants/apply - Production-ready JSON-only submission
router.post('/apply', authenticateToken, async (req, res) => {
  try {
    console.log('📝 Application submission received:', {
      body: req.body,
      hasUser: !!req.user,
      userId: req.user?.userId,
      timestamp: new Date().toISOString()
    });
    
    const { name, email, jobId } = req.body;
    
    // Validate required fields
    if (!name || !email || !jobId) {
      const error = 'Missing required fields: name, email, and jobId are required';
      console.error('❌ Validation error:', error);
      return res.status(400).json({ 
        error,
        received: { name: !!name, email: !!email, jobId: !!jobId }
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format:', email);
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    console.log('✅ Validation passed, creating application...');
    
    const applicationData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      resume: 'json-submission.txt', // Placeholder for JSON submissions
      jobId,
      userId: req.user?.userId, // Link to authenticated user
      appliedAt: new Date(),
      status: 'Pending'
    };
    
    console.log('📝 Creating new applicant with data:', applicationData);

    const newApplicant = new Applicant(applicationData);
    const savedApplicant = await newApplicant.save();
    
    console.log('✅ Application saved successfully:', {
      id: savedApplicant._id,
      name: savedApplicant.name,
      email: savedApplicant.email,
      userId: savedApplicant.userId,
      status: savedApplicant.status
    });
    
    res.status(200).json({ 
      message: 'Application submitted successfully!',
      success: true,
      applicationId: savedApplicant._id,
      status: savedApplicant.status,
      submittedAt: savedApplicant.appliedAt
    });
    
  } catch (error) {
    console.error('💥 Error submitting application:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      console.error('❌ MongoDB validation error:', error.errors);
      return res.status(400).json({ 
        error: 'Application data validation failed',
        details: Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`)
      });
    }
    
    if (error.code === 11000) {
      console.error('❌ Duplicate key error:', error.keyPattern);
      return res.status(409).json({ 
        error: 'Application already exists',
        details: 'You may have already applied for this position'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to submit application - server error',
      timestamp: new Date().toISOString(),
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// POST /api/applicants/apply-simple (simplified version for testing)
router.post('/apply-simple', authenticateToken, async (req, res) => {
  try {
    const { name, email, jobId } = req.body;
    console.log('📝 Simple application submission:', { name, email, jobId, userId: req.user?.userId });

    if (!name || !email || !jobId) {
      return res.status(400).json({ error: 'Name, email, and jobId are required' });
    }

    const newApplicant = new Applicant({
      name,
      email,
      resume: 'simple-application.txt',
      jobId,
      userId: req.user?.userId
    });

    await newApplicant.save();
    console.log('✅ Simple application saved with ID:', newApplicant._id);
    
    res.status(200).json({ 
      message: 'Application submitted successfully!',
      applicationId: newApplicant._id 
    });
  } catch (error) {
    console.error('💥 Error submitting simple application:', error);
    res.status(500).json({ error: 'Failed to submit application', details: error.message });
  }
});

// GET /api/applicants - Admin only
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    console.log('📋 Fetching all applicants...');
    const applicants = await Applicant.find().populate('jobId');
    console.log(`✅ Found ${applicants.length} applicants`);
    
    if (applicants.length > 0) {
      console.log('📄 Sample applicant:', {
        id: applicants[0]._id,
        name: applicants[0].name,
        email: applicants[0].email,
        userId: applicants[0].userId,
        status: applicants[0].status
      });
    }
    
    res.status(200).json(applicants);
  } catch (error) {
    console.error('💥 Error fetching applicants:', error);
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
});

// GET /api/applicants/user - Get applications for authenticated user
router.get('/user', async (req, res) => {
  try {
    console.log('📋 Fetching user applications...');
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    let user;
    try {
      user = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    } catch (err) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    if (!user || !user.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userApplications = await Applicant.find({ userId: user.userId }).populate('jobId');
    console.log(`✅ Found ${userApplications.length} applications for user ${user.userId}`);
    
    if (userApplications.length > 0) {
      console.log('📄 Sample application:', {
        id: userApplications[0]._id,
        name: userApplications[0].name,
        email: userApplications[0].email,
        userId: userApplications[0].userId,
        status: userApplications[0].status
      });
    }
    
    res.status(200).json(userApplications);
  } catch (error) {
    console.error('💥 Error fetching user applications:', error);
    res.status(500).json({ error: 'Failed to fetch user applications' });
  }
});

// PUT /api/applicants/:id/status - Update application status (Admin only)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    console.log(`🔄 Updating application ${id} status to: ${status}`);

    const updatedApplicant = await Applicant.findByIdAndUpdate(
      id,
      { 
        status,
        notes: notes || '',
        reviewedAt: new Date(),
        reviewedBy: req.user?.userId
      },
      { new: true }
    ).populate('jobId');

    if (!updatedApplicant) {
      return res.status(404).json({ error: 'Application not found' });
    }

    console.log('✅ Application status updated successfully');
    res.status(200).json({ 
      message: 'Application status updated successfully',
      applicant: updatedApplicant 
    });

  } catch (error) {
    console.error('💥 Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// PATCH /api/applicants/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }
    res.status(200).json(applicant);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// POST /api/applicants/bulk-update - Admin only bulk update
router.post('/bulk-update', authenticateAdmin, async (req, res) => {
  try {
    const { applicationIds, status } = req.body;
    
    console.log('🔄 Bulk update request:', { applicationIds, status });

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ error: 'Application IDs array is required' });
    }

    if (!['Pending', 'Under Review', 'Interview Scheduled', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const result = await Applicant.updateMany(
      { _id: { $in: applicationIds } },
      { status, updatedAt: new Date() }
    );

    const updatedApplicants = await Applicant.find({ _id: { $in: applicationIds } }).populate('jobId');

    console.log('✅ Bulk update completed:', { 
      modifiedCount: result.modifiedCount, 
      matchedCount: result.matchedCount 
    });

    res.status(200).json({
      message: `Successfully updated ${result.modifiedCount} applications`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
      applicants: updatedApplicants
    });

  } catch (error) {
    console.error('💥 Error in bulk update:', error);
    res.status(500).json({ error: 'Failed to update applications' });
  }
});

module.exports = router;