const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const applicationsController = require('../controllers/applicationsController');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { validate } = require('../middleware/validate');
const { createSingleFileUpload } = require('../middleware/upload');
const { objectIdParam, paginationQuery, sortQuery } = require('../validators/commonValidators');

router.post(
	'/apply',
	authenticate,
	authorizeRoles('candidate', 'user'),
	...createSingleFileUpload('resume', 5),
	[
		body('email').optional().isEmail().withMessage('invalid email'),
		body('jobId').notEmpty().withMessage('jobId is required').bail().isMongoId().withMessage('jobId must be a valid MongoDB ObjectId'),
		body('resumeUrl').optional().isURL().withMessage('resumeUrl must be a valid URL'),
		body('resumeName').optional().isString().isLength({ max: 255 }).withMessage('resumeName cannot exceed 255 chars'),
		body('resumeText').optional().isString().isLength({ max: 200000 }).withMessage('resumeText too long')
	],
	validate,
	applicationsController.createApplication
);
router.get('/mine', authenticate, authorizeRoles('candidate', 'user'), applicationsController.getMyApplications);
router.get('/mine/stats', authenticate, authorizeRoles('candidate', 'user'), applicationsController.getMyApplicationStats);

// Withdraw application (candidate only)
router.post('/:id/withdraw', authenticate, authorizeRoles('candidate', 'user'), [objectIdParam('id')], validate, applicationsController.withdrawApplication);

// Get all applications with filters, search, pagination
router.get(
	'/',
	authenticate,
	authorizeRoles('admin', 'recruiter'),
	[
		...paginationQuery,
		...sortQuery,
		query('search').optional().isString().trim(),
		query('status').optional().isString().trim(),
		query('jobTitle').optional().isString().trim(),
		query('includeWithdrawn').optional().isIn(['true', 'false']).withMessage("includeWithdrawn must be 'true' or 'false'")
	],
	validate,
	applicationsController.getAllApplications
);

// Get application statistics
router.get('/stats/overview', authenticate, authorizeRoles('admin', 'recruiter'), applicationsController.getApplicationStats);

// Get unique job titles for filter
router.get('/filters/job-titles', authenticate, authorizeRoles('admin', 'recruiter'), applicationsController.getJobTitles);

// Export applications to CSV
router.get('/export/csv', authenticate, authorizeRoles('admin', 'recruiter'), applicationsController.exportApplications);

// Get single application
router.get('/:id', authenticate, authorizeRoles('admin', 'recruiter'), [objectIdParam('id')], validate, applicationsController.getApplicationById);

// Update application status
router.put(
	'/:id/status',
	authenticate,
	authorizeRoles('admin', 'recruiter'),
	[
		objectIdParam('id'),
		body('status')
			.isIn(['applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'selected', 'rejected', 'withdrawn'])
			.withMessage('invalid status'),
		body('notes').optional().isString().isLength({ max: 2000 }).withMessage('notes cannot exceed 2000 characters')
	],
	validate,
	applicationsController.updateApplicationStatus
);

// Bulk update status
router.post(
	'/bulk/update-status',
	authenticate,
	authorizeRoles('admin', 'recruiter'),
	[
		body('applicationIds').isArray({ min: 1 }).withMessage('applicationIds is required'),
		body('applicationIds.*').isMongoId().withMessage('applicationIds must contain valid MongoDB ObjectIds'),
		body('status')
			.isIn(['applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'selected', 'rejected', 'withdrawn'])
			.withMessage('invalid status')
	],
	validate,
	applicationsController.bulkUpdateStatus
);

// Delete application
router.delete('/:id', authenticate, authorizeRoles('admin', 'recruiter'), [objectIdParam('id')], validate, applicationsController.deleteApplication);

// Bulk delete applications
router.post(
	'/bulk/delete',
	authenticate,
	authorizeRoles('admin', 'recruiter'),
	[
		body('applicationIds').isArray({ min: 1 }).withMessage('applicationIds is required'),
		body('applicationIds.*').isMongoId().withMessage('applicationIds must contain valid MongoDB ObjectIds')
	],
	validate,
	applicationsController.bulkDeleteApplications
);

module.exports = router;
