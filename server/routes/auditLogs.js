const express = require('express');
const { query } = require('express-validator');
const { getAuditLogs } = require('../controllers/auditController');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { validate } = require('../middleware/validate');
const { paginationQuery } = require('../validators/commonValidators');

const router = express.Router();

router.get(
	'/',
	authenticate,
	authorizeRoles('admin', 'recruiter'),
	[
		...paginationQuery,
		query('user').optional().isString().trim(),
		query('from').optional().isISO8601().withMessage('from must be a valid ISO date'),
		query('to').optional().isISO8601().withMessage('to must be a valid ISO date')
	],
	validate,
	getAuditLogs
);

module.exports = router;
