const { failure } = require('../utils/response');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role) {
      return failure(res, 'Unauthorized', {
        statusCode: 401,
        code: 'UNAUTHORIZED',
        meta: { requestId: req.requestId }
      });
    }

    const normalizedRole = req.user.role === 'user' ? 'candidate' : req.user.role;
    if (!allowedRoles.includes(normalizedRole)) {
      return failure(res, 'Forbidden: insufficient permissions', {
        statusCode: 403,
        code: 'FORBIDDEN',
        details: { required: allowedRoles, actual: normalizedRole },
        meta: { requestId: req.requestId }
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
