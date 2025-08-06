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
    const applicants = await Applicant.find().populate('jobId', 'title');
    res.status(200).json(applicants);
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
});



module.exports = router;
