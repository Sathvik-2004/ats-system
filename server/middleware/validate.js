const { validationResult } = require('express-validator');
const { failure } = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return failure(res, 'Validation failed', {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details: errors.array().map((err) => ({
        field: err.path,
        location: err.location,
        message: err.msg
      })),
      meta: {
        requestId: req.requestId
      }
    });
  }
  next();
};

module.exports = { validate };
