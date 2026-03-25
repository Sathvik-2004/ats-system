const express = require('express');
const { body } = require('express-validator');
const { scheduleInterview, listUpcomingInterviews, submitInterviewFeedback } = require('../controllers/interviewsController');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { validate } = require('../middleware/validate');
const { objectIdParam, paginationQuery } = require('../validators/commonValidators');

const router = express.Router();

router.get('/upcoming', authenticate, authorizeRoles('admin', 'recruiter'), [...paginationQuery], validate, listUpcomingInterviews);

router.put(
  '/:id/schedule',
  authenticate,
  authorizeRoles('admin', 'recruiter'),
  [
    objectIdParam('id'),
    body('date').notEmpty().withMessage('date is required'),
    body('time').notEmpty().withMessage('time is required'),
    body('mode').notEmpty().withMessage('mode is required').bail().isIn(['online', 'in-person']).withMessage("mode must be 'online' or 'in-person'"),
    body('interviewLink').optional().isString(),
    body('notes').optional().isString().isLength({ max: 500 }).withMessage('notes cannot exceed 500 characters')
  ],
  validate,
  scheduleInterview
);

router.put(
  '/:id/feedback',
  authenticate,
  authorizeRoles('admin', 'recruiter'),
  [
    objectIdParam('id'),
    body('recommendation').optional().isIn(['hire', 'no_hire']).withMessage("recommendation must be 'hire' or 'no_hire'"),
    body('comments').optional().isString().isLength({ max: 2000 }).withMessage('comments cannot exceed 2000 characters')
  ],
  validate,
  submitInterviewFeedback
);

module.exports = router;
