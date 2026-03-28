const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { failure } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}-refresh`;

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return failure(res, 'Authentication token required', {
        statusCode: 401,
        code: 'AUTH_TOKEN_REQUIRED',
        meta: { requestId: req.requestId }
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id email name role isActive').lean();

    if (!user || user.isActive === false) {
      return failure(res, 'Invalid or inactive user', {
        statusCode: 401,
        code: 'AUTH_USER_INVALID',
        meta: { requestId: req.requestId }
      });
    }

    req.user = {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return failure(res, 'Access token expired', {
        statusCode: 401,
        code: 'TOKEN_EXPIRED',
        meta: { requestId: req.requestId }
      });
    }
    return failure(res, 'Invalid or expired token', {
      statusCode: 401,
      code: 'TOKEN_INVALID',
      meta: { requestId: req.requestId }
    });
  }
};

const signAccessToken = (user) => {
  const role = user.role === 'user' ? 'candidate' : user.role;
  return jwt.sign(
    { id: String(user._id), role, email: user.email },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

const signRefreshToken = (user) => {
  return jwt.sign(
    { id: String(user._id), tokenType: 'refresh', jti: crypto.randomUUID() },
    JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

const verifyRefreshToken = (token) => jwt.verify(token, JWT_REFRESH_SECRET);

const signToken = signAccessToken;

module.exports = { authenticate, signToken, signAccessToken, signRefreshToken, verifyRefreshToken };
