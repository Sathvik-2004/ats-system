const express = require('express');
const { query } = require('express-validator');
const { listMyNotifications, markNotificationRead, markAllNotificationsRead } = require('../controllers/notificationsController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { objectIdParam, paginationQuery } = require('../validators/commonValidators');

const router = express.Router();

router.get(
	'/',
	authenticate,
	[...paginationQuery, query('unread').optional().isIn(['true', 'false']).withMessage("unread must be 'true' or 'false'")],
	validate,
	listMyNotifications
);
router.put('/:id/read', authenticate, [objectIdParam('id')], validate, markNotificationRead);
router.put('/read-all', authenticate, markAllNotificationsRead);

module.exports = router;
