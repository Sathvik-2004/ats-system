const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Applicant = require('../models/Applicant'); // ✅ Applicant model

// Set up storage for uploaded resumes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // ✅ Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// POST /api/applicants/apply
router.post('/apply', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, jobId } = req.body;
    const resume = req.file.filename;

    const newApplicant = new Applicant({
      name,
      email,
      resume,
      jobId
    });

    await newApplicant.save();
    res.status(200).json({ message: 'Application submitted successfully!' });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// GET /api/applicants
router.get('/', async (req, res) => {
  try {
    const applicants = await Applicant.find().populate('jobId');
    res.status(200).json(applicants);
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({ error: 'Failed to fetch applicants' });
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

module.exports = router;
