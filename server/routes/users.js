const express = require('express');
const { body, query } = require('express-validator');
const {
  getMe,
  updateMe,
  updateResume,
  parseResume,
  listUsers,
  updateUserRole,
  toggleUserActive,
  createUserByAdmin,
  bulkToggleUsers,
  deleteUserByAdmin
} = require('../controllers/usersController');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { validate } = require('../middleware/validate');
const { paginationQuery, objectIdParam } = require('../validators/commonValidators');

const router = express.Router();

router.get('/me', authenticate, getMe);

router.put(
  '/me',
  authenticate,
  [
    body('name').optional().isString(),
    body('phone').optional().isString(),
    body('location').optional().isString(),
    body('skills').optional().isArray(),
    body('experience').optional().isString()
  ],
  validate,
  updateMe
);

router.put(
  '/me/resume',
  authenticate,
  [body('filename').notEmpty().withMessage('filename is required'), body('url').notEmpty().withMessage('url is required')],
  validate,
  updateResume
);

router.post('/me/resume/parse', authenticate, [body('text').notEmpty().withMessage('text is required')], validate, parseResume);

router.get(
  '/',
  authenticate,
  authorizeRoles('admin'),
  [
    ...paginationQuery,
    query('search').optional().isString().trim(),
    query('role').optional().isIn(['admin', 'recruiter', 'candidate', 'user', 'all']).withMessage('invalid role filter')
  ],
  validate,
  listUsers
);
router.post(
  '/',
  authenticate,
  authorizeRoles('admin'),
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('email').isEmail().withMessage('valid email is required'),
    body('role').optional().isIn(['admin', 'recruiter', 'candidate', 'user']).withMessage('invalid role'),
    body('password').optional().isLength({ min: 6 }).withMessage('password must be at least 6 chars')
  ],
  validate,
  createUserByAdmin
);
router.put(
  '/:id/role',
  authenticate,
  authorizeRoles('admin'),
  [objectIdParam('id'), body('role').isIn(['admin', 'recruiter', 'candidate', 'user']).withMessage('invalid role')],
  validate,
  updateUserRole
);
router.put(
  '/:id/active',
  authenticate,
  authorizeRoles('admin'),
  [objectIdParam('id'), body('isActive').isBoolean().withMessage('isActive must be boolean')],
  validate,
  toggleUserActive
);
router.post(
  '/bulk/active',
  authenticate,
  authorizeRoles('admin'),
  [body('userIds').isArray({ min: 1 }).withMessage('userIds is required'), body('isActive').isBoolean()],
  validate,
  bulkToggleUsers
);
router.delete('/:id', authenticate, authorizeRoles('admin'), [objectIdParam('id')], validate, deleteUserByAdmin);

module.exports = router;
