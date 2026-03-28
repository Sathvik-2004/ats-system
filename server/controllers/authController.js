const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../middleware/auth');
const { logAction } = require('./auditController');
const { success, failure } = require('../utils/response');

const normalizeRole = (role) => (role === 'user' ? 'candidate' : role);

const isPasswordMatch = async (user, password) => {
  try {
    return await user.comparePassword(password);
  } catch (_error) {
    return user.password === password;
  }
};

const parseRefreshExpiryDate = () => {
  const defaultDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const raw = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  const match = String(raw).match(/^(\d+)([dhm])$/i);
  if (!match) return defaultDate;

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const factor = unit === 'd' ? 24 * 60 * 60 * 1000 : unit === 'h' ? 60 * 60 * 1000 : 60 * 1000;
  return new Date(Date.now() + value * factor);
};

const issueAuthTokens = async (user, req) => {
  const token = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: parseRefreshExpiryDate(),
    userAgent: req.headers['user-agent'] || '',
    ipAddress: req.ip || ''
  });

  return { token, refreshToken };
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return failure(res, 'User already exists with this email', { statusCode: 400, code: 'USER_EXISTS' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'candidate'
    });

    const { token, refreshToken } = await issueAuthTokens(user, req);

    await logAction({
      userId: user._id,
      userName: user.name,
      action: 'create',
      resourceType: 'user',
      resourceId: user._id,
      resourceName: user.email,
      details: { event: 'register' },
      ipAddress: req.ip
    });

    return success(
      res,
      {
        token,
        refreshToken,
        user: { id: user._id, name: user.name, email: user.email, role: normalizeRole(user.role) }
      },
      { statusCode: 201, message: 'User registered successfully' }
    );
  } catch (error) {
    return failure(res, 'Registration failed', { statusCode: 500, code: 'REGISTER_FAILED' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Treat missing isActive in legacy records as active.
    if (!user || user.isActive === false) {
      return failure(res, 'Invalid email or password', { statusCode: 401, code: 'INVALID_CREDENTIALS' });
    }

    let matched = await isPasswordMatch(user, password);
    if (!matched && user.password === password) {
      matched = true;
    }

    if (!matched) {
      return failure(res, 'Invalid email or password', { statusCode: 401, code: 'INVALID_CREDENTIALS' });
    }

    await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });

    const { token, refreshToken } = await issueAuthTokens(user, req);

    await logAction({
      userId: user._id,
      userName: user.name,
      action: 'login',
      resourceType: 'user',
      resourceId: user._id,
      resourceName: user.email,
      details: { event: 'user_login' },
      ipAddress: req.ip
    });

    return success(
      res,
      {
        token,
        refreshToken,
        user: { id: user._id, name: user.name, email: user.email, role: normalizeRole(user.role) }
      },
      { message: 'User login successful' }
    );
  } catch (error) {
    console.error('User login error:', error);
    return failure(res, 'Login failed', { statusCode: 500, code: 'LOGIN_FAILED' });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({
      // Support legacy admin records that used `username` instead of `name`.
      $or: [{ email: String(username).toLowerCase() }, { name: username }, { username }],
      role: { $in: ['admin', 'recruiter'] }
    });

    // Treat missing isActive in legacy records as active.
    if (!user || user.isActive === false) {
      return failure(res, 'Invalid admin credentials', { statusCode: 401, code: 'INVALID_ADMIN_CREDENTIALS' });
    }

    let matched = await isPasswordMatch(user, password);
    if (!matched && user.password === password) {
      matched = true;
    }

    if (!matched) {
      return failure(res, 'Invalid admin credentials', { statusCode: 401, code: 'INVALID_ADMIN_CREDENTIALS' });
    }

    await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });

    const { token, refreshToken } = await issueAuthTokens(user, req);

    await logAction({
      userId: user._id,
      userName: user.name,
      action: 'login',
      resourceType: 'user',
      resourceId: user._id,
      resourceName: user.email,
      details: { event: 'admin_login', role: user.role },
      ipAddress: req.ip
    });

    return success(
      res,
      {
        token,
        refreshToken,
        admin: { id: user._id, username: user.name || user.email, role: normalizeRole(user.role) }
      },
      { message: 'Admin login successful' }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return failure(res, 'Admin login failed', { statusCode: 500, code: 'ADMIN_LOGIN_FAILED' });
  }
};

const refreshSession = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return failure(res, 'refreshToken is required', { statusCode: 400, code: 'REFRESH_TOKEN_REQUIRED' });
    }

    const payload = verifyRefreshToken(refreshToken);
    const record = await RefreshToken.findOne({ token: refreshToken, revokedAt: null }).lean();
    if (!record || new Date(record.expiresAt) <= new Date()) {
      return failure(res, 'Invalid refresh token', { statusCode: 401, code: 'INVALID_REFRESH_TOKEN' });
    }

    const user = await User.findById(payload.id);
    if (!user || !user.isActive) {
      return failure(res, 'Invalid user session', { statusCode: 401, code: 'INVALID_SESSION' });
    }

    const newToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    await RefreshToken.findOneAndUpdate(
      { _id: record._id },
      { revokedAt: new Date(), replacedByToken: newRefreshToken }
    );

    await RefreshToken.create({
      userId: user._id,
      token: newRefreshToken,
      expiresAt: parseRefreshExpiryDate(),
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || ''
    });

    await logAction({
      userId: user._id,
      userName: user.name,
      action: 'refresh',
      resourceType: 'session',
      resourceId: user._id,
      resourceName: user.email,
      details: { event: 'token_refresh' },
      ipAddress: req.ip
    });

    return success(res, { token: newToken, refreshToken: newRefreshToken });
  } catch (error) {
    return failure(res, 'Refresh failed', { statusCode: 401, code: 'REFRESH_FAILED' });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    let user = null;

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        user = await User.findById(payload.id).lean();
      } catch (_error) {
        user = null;
      }
    }

    if (refreshToken) {
      await RefreshToken.updateOne({ token: refreshToken, revokedAt: null }, { $set: { revokedAt: new Date() } });
    }

    if (user) {
      await logAction({
        userId: user._id,
        userName: user.name,
        action: 'logout',
        resourceType: 'session',
        resourceId: user._id,
        resourceName: user.email,
        details: { event: 'user_logout' },
        ipAddress: req.ip
      });
    }

    return success(res, null, { message: 'Logged out successfully' });
  } catch (error) {
    return failure(res, 'Logout failed', { statusCode: 500, code: 'LOGOUT_FAILED' });
  }
};

module.exports = { register, login, adminLogin, refreshSession, logout };
