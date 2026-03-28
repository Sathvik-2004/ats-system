const express = require('express');
const { body } = require('express-validator');
const { getSettings, updateSettings, resetSettings } = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/', authenticate, authorizeRoles('admin'), getSettings);
router.put(
	'/',
	authenticate,
	authorizeRoles('admin'),
	[
		body('autoProcessing').optional().isObject(),
		body('application').optional().isObject(),
		body('system').optional().isObject(),
		body('notifications').optional().isObject()
	],
	validate,
	updateSettings
);
router.post('/reset', authenticate, authorizeRoles('admin'), resetSettings);

module.exports = router;
