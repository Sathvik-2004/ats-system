const User = require('../models/User');
const { logAction } = require('./auditController');
const { parsePagination, toPaginationMeta } = require('../utils/pagination');
const { success, failure } = require('../utils/response');

const KNOWN_SKILLS = [
  'javascript', 'typescript', 'react', 'node.js', 'node', 'express', 'mongodb', 'sql', 'postgresql',
  'python', 'java', 'c++', 'aws', 'docker', 'kubernetes', 'html', 'css', 'tailwind', 'redux', 'rest', 'graphql'
];

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) return failure(res, 'User not found', { statusCode: 404, code: 'USER_NOT_FOUND' });
    return success(res, user);
  } catch (error) {
    return failure(res, 'Failed to fetch profile', { statusCode: 500, code: 'PROFILE_FETCH_FAILED' });
  }
};

const updateMe = async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      phone: req.body.phone,
      location: req.body.location,
      skills: Array.isArray(req.body.skills) ? req.body.skills : [],
      experience: req.body.experience,
      education: req.body.education,
      summary: req.body.summary,
      linkedIn: req.body.linkedIn,
      github: req.body.github,
      portfolio: req.body.portfolio,
      preferredJobType: req.body.preferredJobType,
      expectedSalary: req.body.expectedSalary,
      availability: req.body.availability,
      updatedAt: new Date()
    };

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password').lean();

    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      action: 'update',
      resourceType: 'user',
      resourceId: req.user.id,
      resourceName: req.user.email,
      details: { event: 'profile_update' },
      ipAddress: req.ip
    });

    return success(res, user, { message: 'Profile updated' });
  } catch (error) {
    return failure(res, 'Failed to update profile', { statusCode: 500, code: 'PROFILE_UPDATE_FAILED' });
  }
};

const updateResume = async (req, res) => {
  try {
    const { filename, url } = req.body;
    if (!filename || !url) {
      return failure(res, 'filename and url are required', { statusCode: 400, code: 'RESUME_DATA_REQUIRED' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        resume: {
          filename,
          url,
          uploadedAt: new Date()
        },
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password').lean();

    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      action: 'update',
      resourceType: 'user',
      resourceId: req.user.id,
      resourceName: req.user.email,
      details: { event: 'resume_update', filename },
      ipAddress: req.ip
    });

    return success(res, user, { message: 'Resume updated' });
  } catch (error) {
    return failure(res, 'Failed to update resume', { statusCode: 500, code: 'RESUME_UPDATE_FAILED' });
  }
};

const parseResume = async (req, res) => {
  try {
    const rawText = String(req.body.text || '').toLowerCase();
    if (!rawText.trim()) {
      return failure(res, 'text is required for parsing', { statusCode: 400, code: 'RESUME_PARSE_TEXT_REQUIRED' });
    }

    const extractedSkills = KNOWN_SKILLS.filter((skill) => rawText.includes(skill));

    await User.findByIdAndUpdate(req.user.id, {
      skills: extractedSkills,
      updatedAt: new Date()
    });

    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      action: 'update',
      resourceType: 'user',
      resourceId: req.user.id,
      resourceName: req.user.email,
      details: { event: 'resume_parse', extractedSkillsCount: extractedSkills.length },
      ipAddress: req.ip
    });

    return success(res, { extractedSkills });
  } catch (_error) {
    return failure(res, 'Failed to parse resume', { statusCode: 500, code: 'RESUME_PARSE_FAILED' });
  }
};

const listUsers = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, { page: 1, limit: 20, maxLimit: 100 });
    const search = String(req.query.search || '').trim();
    const role = String(req.query.role || '').trim();

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role && role !== 'all') {
      filter.role = role;
    }

    const [users, totalItems] = await Promise.all([
      User.find(filter)
        .select('name email role isActive createdAt lastLoginAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    const pagination = toPaginationMeta({ page, limit, totalItems });
    return success(res, users, { meta: { pagination }, extra: { pagination } });
  } catch (error) {
    return failure(res, 'Failed to fetch users', { statusCode: 500, code: 'USERS_FETCH_FAILED' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['admin', 'recruiter', 'candidate', 'user'].includes(role)) {
      return failure(res, 'Invalid role', { statusCode: 400, code: 'INVALID_ROLE' });
    }

    const user = await User.findByIdAndUpdate(id, { role, updatedAt: new Date() }, { new: true })
      .select('-password')
      .lean();

    if (!user) return failure(res, 'User not found', { statusCode: 404, code: 'USER_NOT_FOUND' });

    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      action: 'update',
      resourceType: 'user',
      resourceId: id,
      resourceName: user.email,
      details: { event: 'role_update', role },
      ipAddress: req.ip
    });

    return success(res, user, { message: 'User role updated' });
  } catch (error) {
    return failure(res, 'Failed to update user role', { statusCode: 500, code: 'USER_ROLE_UPDATE_FAILED' });
  }
};

const toggleUserActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(id, { isActive: Boolean(isActive), updatedAt: new Date() }, { new: true })
      .select('-password')
      .lean();

    if (!user) return failure(res, 'User not found', { statusCode: 404, code: 'USER_NOT_FOUND' });

    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      action: 'update',
      resourceType: 'user',
      resourceId: id,
      resourceName: user.email,
      details: { event: 'user_activation_toggle', isActive: Boolean(isActive) },
      ipAddress: req.ip
    });

    return success(res, user, { message: 'User status updated' });
  } catch (error) {
    return failure(res, 'Failed to update user status', { statusCode: 500, code: 'USER_STATUS_UPDATE_FAILED' });
  }
};

const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, role = 'candidate', password = 'password123' } = req.body;
    const exists = await User.findOne({ email: String(email).toLowerCase() }).lean();
    if (exists) {
      return failure(res, 'User already exists', { statusCode: 400, code: 'USER_EXISTS' });
    }

    const user = await User.create({
      name,
      email: String(email).toLowerCase(),
      password,
      role,
      isActive: true
    });

    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      action: 'create',
      resourceType: 'user',
      resourceId: user._id,
      resourceName: user.email,
      details: { event: 'admin_create_user', role },
      ipAddress: req.ip
    });

    return success(
      res,
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      { statusCode: 201, message: 'User created successfully' }
    );
  } catch (error) {
    return failure(res, 'Failed to create user', { statusCode: 500, code: 'USER_CREATE_FAILED' });
  }
};

const bulkToggleUsers = async (req, res) => {
  try {
    const { userIds = [], isActive } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return failure(res, 'No users selected', { statusCode: 400, code: 'NO_USERS_SELECTED' });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { isActive: Boolean(isActive), updatedAt: new Date() } }
    );

    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      action: 'update',
      resourceType: 'user',
      details: { event: 'bulk_user_toggle', count: result.modifiedCount, isActive: Boolean(isActive) },
      ipAddress: req.ip
    });

    return success(res, { updated: result.modifiedCount }, { message: 'Bulk user update successful' });
  } catch (error) {
    return failure(res, 'Failed to bulk update users', { statusCode: 500, code: 'USERS_BULK_UPDATE_FAILED' });
  }
};

const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).lean();

    if (!user) {
      return failure(res, 'User not found', { statusCode: 404, code: 'USER_NOT_FOUND' });
    }

    await User.deleteOne({ _id: id });

    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      action: 'delete',
      resourceType: 'user',
      resourceId: id,
      resourceName: user.email,
      details: { event: 'admin_delete_user' },
      ipAddress: req.ip
    });

    return success(res, null, { message: 'User deleted successfully' });
  } catch (error) {
    return failure(res, 'Failed to delete user', { statusCode: 500, code: 'USER_DELETE_FAILED' });
  }
};

module.exports = {
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
};
