const express = require('express');
const { body } = require('express-validator');
const { listTemplates, createTemplate, updateTemplate } = require('../controllers/emailTemplatesController');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/', authenticate, authorizeRoles('admin', 'recruiter'), listTemplates);
router.post(
	'/',
	authenticate,
	authorizeRoles('admin', 'recruiter'),
	[
		body('name').trim().notEmpty().withMessage('name is required'),
		body('type').trim().notEmpty().withMessage('type is required'),
		body('subject').trim().notEmpty().withMessage('subject is required'),
		body('content').trim().notEmpty().withMessage('content is required'),
		body('isActive').optional().isBoolean()
	],
	validate,
	createTemplate
);
router.put(
	'/:id',
	authenticate,
	authorizeRoles('admin', 'recruiter'),
	[
		body('name').optional().trim().notEmpty(),
		body('type').optional().trim().notEmpty(),
		body('subject').optional().trim().notEmpty(),
		body('content').optional().trim().notEmpty(),
		body('isActive').optional().isBoolean()
	],
	validate,
	updateTemplate
);

module.exports = router;
