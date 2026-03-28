const express = require('express');
const { query } = require('express-validator');
const { applicationsPerJob, applicationsPerJobCsv, applicationsPerJobPdf, reportSummary } = require('../controllers/reportsController');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { validate } = require('../middleware/validate');

const router = express.Router();

const reportQueryValidation = [
	query('jobTitle').optional().isString().trim(),
	query('from').optional().isISO8601().withMessage('from must be a valid ISO date'),
	query('to').optional().isISO8601().withMessage('to must be a valid ISO date')
];

router.get('/applications-per-job', authenticate, authorizeRoles('admin', 'recruiter'), reportQueryValidation, validate, applicationsPerJob);
router.get('/summary', authenticate, authorizeRoles('admin', 'recruiter'), reportQueryValidation, validate, reportSummary);
router.get('/applications-per-job/csv', authenticate, authorizeRoles('admin', 'recruiter'), reportQueryValidation, validate, applicationsPerJobCsv);
router.get('/applications-per-job/pdf', authenticate, authorizeRoles('admin', 'recruiter'), reportQueryValidation, validate, applicationsPerJobPdf);

module.exports = router;
