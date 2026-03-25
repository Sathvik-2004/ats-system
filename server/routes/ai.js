const express = require('express');
const { body } = require('express-validator');
const { screenOne, screenByJob, screenApplications, compareResumeWithJob } = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { validate } = require('../middleware/validate');
const { objectIdParam } = require('../validators/commonValidators');

const router = express.Router();

router.post(
	'/screen',
	authenticate,
	authorizeRoles('admin', 'recruiter'),
	[
		body('jobId').optional().isMongoId().withMessage('jobId must be a valid MongoDB ObjectId')
	],
	validate,
	screenApplications
);

router.put(
	'/screen/:id',
	authenticate,
	authorizeRoles('admin', 'recruiter'),
	[
		objectIdParam('id'),
		body('resumeText').optional().isString().isLength({ max: 200000 }).withMessage('resumeText too long')
	],
	validate,
	screenOne
);
router.post('/screen-job/:jobId', authenticate, authorizeRoles('admin', 'recruiter'), [objectIdParam('jobId')], validate, screenByJob);
router.post(
	'/compare',
	authenticate,
	authorizeRoles('admin', 'recruiter'),
	[
		body('resumeText').isString().notEmpty().withMessage('resumeText is required'),
		body('jobDescription').isString().notEmpty().withMessage('jobDescription is required'),
		body('jobRequirements').optional().custom((value) => Array.isArray(value) || typeof value === 'string').withMessage('jobRequirements must be a string or string array')
	],
	validate,
	compareResumeWithJob
);

module.exports = router;
