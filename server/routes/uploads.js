const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { createSingleFileUpload } = require('../middleware/upload');
const { uploadResumeToCloudinary } = require('../controllers/uploadsController');

const router = express.Router();

router.post(
  '/resume',
  authenticate,
  authorizeRoles('candidate', 'user', 'admin', 'recruiter'),
  ...createSingleFileUpload('resume', 5),
  uploadResumeToCloudinary
);

module.exports = router;
