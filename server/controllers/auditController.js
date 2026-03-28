const AuditLog = require('../models/AuditLog');
const { success, failure } = require('../utils/response');

const logAction = async ({ userId, userName, action, resourceType, resourceId, resourceName, details, ipAddress }) => {
  try {
    await AuditLog.create({
      userId,
      userName,
      action,
      resourceType,
      resourceId,
      resourceName,
      details,
      ipAddress
    });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, user = '', from = '', to = '' } = req.query;
    const filter = {};

    if (user) filter.userName = { $regex: user, $options: 'i' };
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    const pageNum = Math.max(1, Number(page));
    const pageSize = Math.max(1, Math.min(100, Number(limit)));

    const [items, total] = await Promise.all([
      AuditLog.find(filter).sort({ timestamp: -1 }).skip((pageNum - 1) * pageSize).limit(pageSize).lean(),
      AuditLog.countDocuments(filter)
    ]);

    const pagination = {
      currentPage: pageNum,
      totalPages: Math.ceil(total / pageSize),
      totalItems: total,
      itemsPerPage: pageSize
    };

    return success(res, items, { meta: { pagination }, extra: { pagination } });
  } catch (error) {
    return failure(res, 'Failed to fetch audit logs', { statusCode: 500, code: 'AUDIT_LOGS_FETCH_FAILED' });
  }
};

module.exports = { logAction, getAuditLogs };
