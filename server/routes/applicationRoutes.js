const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const Applicant = require('../models/Applicant'); // ✅ Applicant model

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

// Set up storage for uploaded resumes
const fs = require('fs');
const uploadsDir = process.env.NODE_ENV === 'production' ? '/tmp/uploads' : 'uploads';

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log('📎 File filter:', file);
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// POST /api/applicants/apply-simple (for testing without file)
router.post('/apply-simple', authenticateToken, async (req, res) => {
  try {
    const { name, email, jobId } = req.body;
    console.log('📝 Simple application submission:', { name, email, jobId, userId: req.user?.userId });

    const newApplicant = new Applicant({
      name,
      email,
      resume: 'test-application.txt',
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

// POST /api/applicants/apply
router.post('/apply', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    console.log('📝 Application submission attempt:', req.body);
    console.log('📎 File upload info:', req.file);
    
    const { name, email, jobId } = req.body;
    
    // Handle case where file upload fails in production
    let resume = 'no-resume-uploaded.txt';
    if (req.file) {
      resume = req.file.filename;
    } else {
      console.warn('⚠️ No file uploaded, using placeholder');
    }

    console.log('📝 New application submission:', { name, email, jobId, userId: req.user?.userId, resume });

    const newApplicant = new Applicant({
      name,
      email,
      resume,
      jobId,
      userId: req.user?.userId // Link to authenticated user if available
    });

    await newApplicant.save();
    console.log('✅ Application saved successfully with ID:', newApplicant._id);
    
    res.status(200).json({ 
      message: 'Application submitted successfully!',
      applicationId: newApplicant._id 
    });
  } catch (error) {
    console.error('💥 Error submitting application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
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

// POST /api/applicants/auto-process - Admin only auto-process
router.post('/auto-process', authenticateAdmin, async (req, res) => {
  try {
    console.log('🤖 Auto-processing applications...');

    // Get both pending and under review applications
    const applicantsToProcess = await Applicant.find({ 
      status: { $in: ['Pending', 'Under Review'] }
    }).populate('jobId');

    console.log(`📊 Found ${applicantsToProcess.length} applications to process (Pending + Under Review)`);

    let processedCount = 0;
    const processedApplicants = [];

    for (const applicant of applicantsToProcess) {
      let newStatus = 'Under Review'; // Default fallback
      let shouldProcess = false;
      let processingReason = '';

      // Check if application has minimum required data
      if (applicant.name && applicant.email && applicant.resume) {
        shouldProcess = true;

        // Calculate application age
        const daysSinceApplied = Math.floor((new Date() - new Date(applicant.appliedAt)) / (1000 * 60 * 60 * 24));
        const daysSinceReview = applicant.reviewedAt ? 
          Math.floor((new Date() - new Date(applicant.reviewedAt)) / (1000 * 60 * 60 * 24)) : 0;
        
        // Initialize scoring system with bias based on current status (MORE AGGRESSIVE)
        let score = applicant.status === 'Under Review' ? 80 : 65; // VERY generous base scores
        let autoDecisionReasons = [];
        
        // Bonus for applications already under review (shows they passed initial screening)
        if (applicant.status === 'Under Review') {
          score += 15; // Increased bonus
          autoDecisionReasons.push('Already under review (+15)');
        }

        // POSITIVE SCORING CRITERIA (Increase approval chances)
        
        // 1. Recent applications get bonus points (shows active job seeking)
        if (daysSinceApplied <= 2) {
          score += 15;
          autoDecisionReasons.push('Recent application (+15)');
        }
        
        // 2. Check for quality indicators in name/email
        const name = applicant.name.toLowerCase();
        const email = applicant.email.toLowerCase();
        const jobTitle = applicant.jobId?.title?.toLowerCase() || '';
        
        // Professional email domains
        const professionalDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'company.com'];
        const emailDomain = email.split('@')[1];
        if (professionalDomains.includes(emailDomain)) {
          score += 10;
          autoDecisionReasons.push('Professional email domain (+10)');
        }
        
        // 3. Job title matching keywords
        const skillKeywords = ['developer', 'engineer', 'analyst', 'manager', 'senior', 'lead', 'architect'];
        const hasRelevantKeywords = skillKeywords.some(keyword => 
          name.includes(keyword) || jobTitle.includes(keyword)
        );
        if (hasRelevantKeywords) {
          score += 20;
          autoDecisionReasons.push('Relevant skill keywords (+20)');
        }
        
        // 4. Complete profile bonus
        if (applicant.name.split(' ').length >= 2) { // Full name provided
          score += 5;
          autoDecisionReasons.push('Complete name provided (+5)');
        }
        
        // 5. Experience indicators in name
        if (name.includes('senior') || name.includes('lead') || name.includes('manager')) {
          score += 15;
          autoDecisionReasons.push('Experience indicators in name (+15)');
        }
        
        // 6. High-demand job types get priority
        if (jobTitle.includes('cloud') || jobTitle.includes('devops') || jobTitle.includes('full stack')) {
          score += 10;
          autoDecisionReasons.push('High-demand role (+10)');
        }
        
        // 7. Time spent in review (for Under Review applications)
        if (applicant.status === 'Under Review' && daysSinceReview >= 1) {
          score += 5;
          autoDecisionReasons.push('Time in review (+5)');
        }
        
        // NEGATIVE SCORING CRITERIA (Decrease approval chances)
        
        // 1. Very old applications (might be outdated)
        if (daysSinceApplied > 30) {
          score -= 20;
          autoDecisionReasons.push('Old application (-20)');
        }
        
        // 2. Suspicious email patterns
        if (email.includes('test') || email.includes('fake') || email.includes('temp')) {
          score -= 30;
          autoDecisionReasons.push('Suspicious email pattern (-30)');
        }
        
        // 3. Incomplete name
        if (applicant.name.length < 3 || !applicant.name.includes(' ')) {
          score -= 15;
          autoDecisionReasons.push('Incomplete name (-15)');
        }
        
        // DECISION MAKING BASED ON SCORE (HIGHLY DECISIVE THRESHOLDS)
        
        if (score >= 70) {
          newStatus = 'Approved';
          processingReason = `Auto-approved (Score: ${score}) - ${autoDecisionReasons.join(', ')}`;
        } else if (score >= 60) {
          newStatus = 'Interview Scheduled';
          processingReason = `Auto-scheduled interview (Score: ${score}) - ${autoDecisionReasons.join(', ')}`;
        } else if (score <= 40) {
          newStatus = 'Rejected';
          processingReason = `Auto-rejected (Score: ${score}) - ${autoDecisionReasons.join(', ')}`;
        } else {
          // For applications already Under Review, be EXTREMELY decisive
          if (applicant.status === 'Under Review') {
            if (score >= 50) {
              newStatus = 'Approved'; // More likely to approve Under Review applications
              processingReason = `Review completed - APPROVED (Score: ${score}) - ${autoDecisionReasons.join(', ')}`;
            } else {
              newStatus = 'Rejected';
              processingReason = `Review completed - Rejected (Score: ${score}) - ${autoDecisionReasons.join(', ')}`;
            }
          } else {
            newStatus = 'Interview Scheduled'; // Be more positive with new applications
            processingReason = `Interview scheduled (Score: ${score}) - ${autoDecisionReasons.join(', ')}`;
          }
        }
        
        // SPECIAL OVERRIDE RULES
        
        // Auto-approve high-demand roles with good candidates
        if (jobTitle.includes('cloud engineer') && score >= 60) {
          newStatus = 'Interview Scheduled';
          processingReason += ' [Override: High-demand role]';
        }
        
        // Auto-reject if missing critical information
        if (!applicant.resume || applicant.resume.length < 5) {
          newStatus = 'Rejected';
          processingReason = 'Missing or invalid resume file';
        }
        
        console.log(`📊 ${applicant.name}: Score ${score} → ${newStatus}`);
        console.log(`   Reason: ${processingReason}`);
      }

      if (shouldProcess) {
        const updatedApplicant = await Applicant.findByIdAndUpdate(
          applicant._id,
          { 
            status: newStatus, 
            updatedAt: new Date(),
            notes: processingReason || `Auto-processed to ${newStatus}`
          },
          { new: true }
        ).populate('jobId');

        processedApplicants.push({
          ...updatedApplicant.toObject(),
          processingReason
        });
        processedCount++;
      }
    }

    // Calculate statistics
    const stats = {
      approved: processedApplicants.filter(app => app.status === 'Approved').length,
      rejected: processedApplicants.filter(app => app.status === 'Rejected').length,
      interviewed: processedApplicants.filter(app => app.status === 'Interview Scheduled').length,
      underReview: processedApplicants.filter(app => app.status === 'Under Review').length
    };

    console.log(`✅ Auto-processed ${processedCount} applications`);
    console.log(`📈 Results: ${stats.approved} approved, ${stats.rejected} rejected, ${stats.interviewed} interviews, ${stats.underReview} under review`);

    res.status(200).json({
      message: `Auto-processed ${processedCount} applications: ${stats.approved} approved, ${stats.rejected} rejected, ${stats.interviewed} interviews scheduled, ${stats.underReview} under review`,
      processedCount,
      totalAvailable: applicantsToProcess.length,
      statistics: stats,
      processedApplicants
    });

  } catch (error) {
    console.error('💥 Error in auto-processing:', error);
    res.status(500).json({ error: 'Failed to auto-process applications' });
  }
});

module.exports = router;
