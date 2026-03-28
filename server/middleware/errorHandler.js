const { failure } = require('../utils/response');

const mapKnownError = (err) => {
  if (!err) return { statusCode: 500, message: 'Internal server error' };

  if (err.name === 'CastError') {
    return { statusCode: 400, message: `Invalid ${err.path || 'identifier'}` };
  }

  if (err.name === 'ValidationError') {
    return {
      statusCode: 400,
      message: 'Validation failed',
      details: Object.values(err.errors || {}).map((item) => ({
        field: item.path,
        message: item.message
      }))
    };
  }

  if (err.code === 11000) {
    return {
      statusCode: 409,
      message: 'Duplicate value violation',
      details: err.keyValue || null
    };
  }

  if (err.name === 'JsonWebTokenError') {
    return { statusCode: 401, message: 'Invalid authentication token', code: 'TOKEN_INVALID' };
  }

  if (err.name === 'TokenExpiredError') {
    return { statusCode: 401, message: 'Access token expired', code: 'TOKEN_EXPIRED' };
  }

  return {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal server error',
    details: err.details || null,
    code: err.code || null
  };
};

const notFoundHandler = (req, _res, next) => {
  const err = new Error(`Endpoint not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

const errorHandler = (err, req, res, _next) => {
  const mapped = mapKnownError(err);
  const isServerError = mapped.statusCode >= 500;

  if (isServerError) {
    console.error('Unhandled server error:', {
      message: err?.message,
      stack: err?.stack,
      path: req.originalUrl,
      method: req.method,
      requestId: req.requestId
    });
  }

  const includeStack = process.env.NODE_ENV !== 'production';
  return failure(res, mapped.message, {
    statusCode: mapped.statusCode,
    code: mapped.code,
    details: mapped.details,
    meta: {
      requestId: req.requestId,
      ...(includeStack && err?.stack ? { stack: err.stack } : {})
    }
  });
};

module.exports = { errorHandler, notFoundHandler };