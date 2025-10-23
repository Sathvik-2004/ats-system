const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Applicant = require('../models/Applicant');
const Job = require('../models/Job');
const Settings = require('../models/Settings');

const ADMIN_USER = {
  username: 'admin',
  password: 'ksreddy@2004'
};

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ✅ Add this ping route for testing
router.get('/ping', (req, res) => {
  console.log('✅ /api/admin/ping HIT');
  res.send('pong');
});

router.post('/login', (req, res) => {
  console.log('🛠️ /api/admin/login HIT');
  console.log('📦 Request body:', req.body);
  const { username, password } = req.body;
  
  console.log('🔍 Comparing credentials:');
  console.log('Provided username:', username);
  console.log('Expected username:', ADMIN_USER.username);
  console.log('Provided password:', password);
  console.log('Expected password:', ADMIN_USER.password);
  console.log('Username match:', username === ADMIN_USER.username);
  console.log('Password match:', password === ADMIN_USER.password);

  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
    console.log('✅ Login successful, sending token');
    return res.status(200).json({ token });
  } else {
    console.log('❌ Invalid credentials');
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Get all applications for admin analytics
router.get('/applications', verifyAdminToken, async (req, res) => {
  try {
    console.log('🛠️ /api/admin/applications HIT - Admin verified');
    console.log('🔑 Admin token:', req.admin);
    const applications = await Applicant.find({}).populate('jobId');
    console.log('📊 Found applications:', applications.length);
    res.json(applications);
  } catch (error) {
    console.error('❌ Error fetching admin applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// Get all jobs for admin management
router.get('/jobs', verifyAdminToken, async (req, res) => {
  try {
    console.log('🛠️ /api/admin/jobs HIT');
    const jobs = await Job.find({});
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching admin jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

// Create new job
router.post('/jobs', verifyAdminToken, async (req, res) => {
  try {
    console.log('🛠️ /api/admin/jobs POST HIT');
    const job = new Job(req.body);
    const savedJob = await job.save();
    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Failed to create job' });
  }
});

// Update job
router.put('/jobs/:id', verifyAdminToken, async (req, res) => {
  try {
    console.log(`🛠️ /api/admin/jobs/${req.params.id} PUT HIT`);
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Failed to update job' });
  }
});

// Delete job
router.delete('/jobs/:id', verifyAdminToken, async (req, res) => {
  try {
    console.log(`🛠️ /api/admin/jobs/${req.params.id} DELETE HIT`);
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Failed to delete job' });
  }
});

// Get all users for admin management
router.get('/users', verifyAdminToken, async (req, res) => {
  try {
    console.log('🛠️ /api/admin/users HIT');
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Update user status
router.put('/users/:id/status', verifyAdminToken, async (req, res) => {
  try {
    console.log(`🛠️ /api/admin/users/${req.params.id}/status PUT HIT`);
    const { status } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// Delete user
router.delete('/users/:id', verifyAdminToken, async (req, res) => {
  try {
    console.log(`🛠️ /api/admin/users/${req.params.id} DELETE HIT`);
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Update application status (bulk operations)
router.put('/applications/:id/status', verifyAdminToken, async (req, res) => {
  try {
    console.log(`🛠️ /api/admin/applications/${req.params.id}/status PUT HIT`);
    const { status } = req.body;
    const updatedApplication = await Applicant.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('jobId');
    
    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(updatedApplication);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Failed to update application status' });
  }
});

// Get analytics data
router.get('/analytics', verifyAdminToken, async (req, res) => {
  try {
    console.log('🛠️ /api/admin/analytics HIT');
    
    const [applications, jobs, users] = await Promise.all([
      Applicant.find({}).populate('jobId'),
      Job.find({}),
      User.find({}).select('-password')
    ]);

    const analytics = {
      totalApplications: applications.length,
      totalJobs: jobs.length,
      totalUsers: users.length,
      applicationsByStatus: {
        pending: applications.filter(app => app.status === 'Applied').length,
        reviewing: applications.filter(app => app.status === 'Under Review').length,
        accepted: applications.filter(app => app.status === 'Accepted').length,
        rejected: applications.filter(app => app.status === 'Rejected').length
      },
      recentApplications: applications
        .sort((a, b) => new Date(b.createdAt || b.appliedDate) - new Date(a.createdAt || a.appliedDate))
        .slice(0, 10),
      jobsByStatus: {
        active: jobs.filter(job => job.status === 'active').length,
        inactive: jobs.filter(job => job.status === 'inactive').length
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Auto-process applications
router.post('/auto-process', verifyAdminToken, async (req, res) => {
  try {
    console.log('🛠️ /api/admin/auto-process HIT');
    
    const applications = await Applicant.find({ status: 'Pending' });
    let processedCount = 0;
    const statistics = {
      approved: 0,
      rejected: 0,
      underReview: 0
    };

    for (const app of applications) {
      // Simple auto-processing logic
      let newStatus = 'Under Review';
      let score = 50; // Base score

      // Add scoring logic
      if (app.email && app.email.includes('@gmail.com')) score += 10;
      if (app.name && app.name.length > 5) score += 5;
      if (app.resume) score += 15;

      // Determine status based on score
      if (score >= 70) {
        newStatus = 'Approved';
        statistics.approved++;
      } else if (score >= 60) {
        newStatus = 'Under Review';
        statistics.underReview++;
      } else {
        newStatus = 'Rejected';
        statistics.rejected++;
      }

      // Update application
      await Applicant.findByIdAndUpdate(app._id, {
        status: newStatus,
        notes: `Auto-processed (Score: ${score}) - ${new Date().toISOString()}`
      });

      processedCount++;
    }

    res.json({
      success: true,
      processedCount,
      statistics,
      message: `Successfully auto-processed ${processedCount} applications`
    });

  } catch (error) {
    console.error('Error in auto-process:', error);
    res.status(500).json({ message: 'Failed to auto-process applications' });
  }
});

// Get system settings
router.get('/settings', verifyAdminToken, async (req, res) => {
  try {
    console.log('🛠️ /api/admin/settings GET HIT');
    const settings = await Settings.getSingleton();
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

// Update system settings
router.put('/settings', verifyAdminToken, async (req, res) => {
  try {
    console.log('🛠️ /api/admin/settings PUT HIT');
    console.log('📦 Settings update:', req.body);
    
    const updatedSettings = await Settings.updateSettings(
      req.body, 
      req.admin.username
    );
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

// Reset settings to default
router.post('/settings/reset', verifyAdminToken, async (req, res) => {
  try {
    console.log('🛠️ /api/admin/settings/reset POST HIT');
    
    // Delete existing settings to trigger default creation
    await Settings.deleteMany({});
    const defaultSettings = await Settings.getSingleton();
    
    res.json({
      success: true,
      message: 'Settings reset to default values',
      settings: defaultSettings
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ message: 'Failed to reset settings' });
  }
});

// Get specific settings section
router.get('/settings/:section', verifyAdminToken, async (req, res) => {
  try {
    const { section } = req.params;
    console.log(`🛠️ /api/admin/settings/${section} GET HIT`);
    
    const settings = await Settings.getSingleton();
    
    if (!settings[section]) {
      return res.status(404).json({ message: 'Settings section not found' });
    }
    
    res.json({
      success: true,
      section,
      data: settings[section]
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.section} settings:`, error);
    res.status(500).json({ message: 'Failed to fetch settings section' });
  }
});

module.exports = router;
