const { body, query, param } = require('express-validator');

const objectIdParam = (name = 'id') =>
  param(name).isMongoId().withMessage(`${name} must be a valid MongoDB ObjectId`);

const paginationQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be an integer >= 1').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be an integer between 1 and 100').toInt()
];

const sortQuery = [
  query('sortBy').optional().isString().trim(),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage("sortOrder must be 'asc' or 'desc'")
];

const emailValidator = (name = 'email') =>
  body(name).isEmail().withMessage(`${name} must be a valid email`).normalizeEmail();

module.exports = {
  objectIdParam,
  paginationQuery,
  sortQuery,
  emailValidator
};
