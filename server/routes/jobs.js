const express = require('express');
const { body, query } = require('express-validator');
const { listJobs, createJob, updateJob, applyToJob, deleteJob, getSavedJobs, saveJob, unsaveJob } = require('../controllers/jobsController');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { validate } = require('../middleware/validate');
const { objectIdParam, paginationQuery } = require('../validators/commonValidators');

const router = express.Router();

router.get(
  '/',
  [
    ...paginationQuery,
    query('search').optional().isString().trim(),
    query('location').optional().isString().trim(),
    query('role').optional().isString().trim(),
    query('experience').optional().isString().trim(),
    query('jobType').optional().isString().trim(),
    query('salaryMin').optional().isFloat({ min: 0 }).withMessage('salaryMin must be >= 0'),
    query('sortBy').optional().isIn(['latest', 'salary_high', 'salary_low']).withMessage('invalid sortBy'),
    query('paginated').optional().isIn(['true', 'false']).withMessage("paginated must be 'true' or 'false'")
  ],
  validate,
  listJobs
);

router.post(
  '/',
  authenticate,
  authorizeRoles('admin', 'recruiter'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('company').trim().notEmpty().withMessage('Company is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('salary').optional().isString(),
    body('experience').optional().isString(),
    body('jobType').optional().isIn(['Full-time', 'Part-time', 'Contract', 'Internship']).withMessage('invalid jobType'),
    body('description').optional().isString(),
    body('skills').optional().custom((value) => Array.isArray(value) || typeof value === 'string').withMessage('skills must be a string or string array')
  ],
  validate,
  createJob
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('admin', 'recruiter'),
  [
    objectIdParam('id'),
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('company').optional().notEmpty().withMessage('Company cannot be empty'),
    body('location').optional().notEmpty().withMessage('Location cannot be empty'),
    body('skills').optional().custom((value) => Array.isArray(value) || typeof value === 'string').withMessage('skills must be a string or string array')
  ],
  validate,
  updateJob
);

router.post(
  '/apply',
  authenticate,
  authorizeRoles('candidate', 'user'),
  [body('jobId').isMongoId().withMessage('jobId must be a valid MongoDB ObjectId')],
  validate,
  applyToJob
);

router.get('/saved', authenticate, authorizeRoles('candidate', 'user'), getSavedJobs);
router.post('/:id/save', authenticate, authorizeRoles('candidate', 'user'), [objectIdParam('id')], validate, saveJob);
router.delete('/saved/:id', authenticate, authorizeRoles('candidate', 'user'), [objectIdParam('id')], validate, unsaveJob);

router.delete('/:id', authenticate, authorizeRoles('admin', 'recruiter'), [objectIdParam('id')], validate, deleteJob);

module.exports = router;
