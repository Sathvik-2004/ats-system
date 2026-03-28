const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { validate } = require('../middleware/validate');

// Dashboard metrics endpoints
router.get('/dashboard/metrics', authenticate, authorizeRoles('admin', 'recruiter'), analyticsController.getDashboardMetrics);
router.get(
	'/dashboard/trend',
	authenticate,
	authorizeRoles('admin', 'recruiter'),
	[query('days').optional().isInt({ min: 1, max: 365 }).withMessage('days must be an integer between 1 and 365')],
	validate,
	analyticsController.getApplicationsTrend
);
router.get('/dashboard/status-distribution', authenticate, authorizeRoles('admin', 'recruiter'), analyticsController.getStatusDistribution);
router.get('/dashboard/hiring-funnel', authenticate, authorizeRoles('admin', 'recruiter'), analyticsController.getHiringFunnel);
router.get('/dashboard/full-data', authenticate, authorizeRoles('admin', 'recruiter'), analyticsController.getFullDashboardData);

module.exports = router;
