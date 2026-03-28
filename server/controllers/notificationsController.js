const Notification = require('../models/Notification');
const { logAction } = require('./auditController');
const { success, failure } = require('../utils/response');

const listMyNotifications = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unread === 'true';

    const filter = { userId: req.user.id };
    if (unreadOnly) {
      filter.isRead = false;
    }

    const [items, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.user.id, isRead: false })
    ]);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit
    };

    return success(res, items, {
      meta: { unreadCount, pagination },
      extra: { unreadCount, pagination }
    });
  } catch (_error) {
    return failure(res, 'Failed to fetch notifications', { statusCode: 500, code: 'NOTIFICATIONS_FETCH_FAILED' });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { isRead: true },
      { new: true }
    ).lean();

    if (!item) {
      return failure(res, 'Notification not found', { statusCode: 404, code: 'NOTIFICATION_NOT_FOUND' });
    }

    await logAction({
      userId: req.user.id,
      userName: req.user.name || req.user.email,
      action: 'read',
      resourceType: 'notification',
      resourceId: item._id,
      resourceName: item.title,
      details: { event: 'notification_read' },
      ipAddress: req.ip
    });

    return success(res, item);
  } catch (_error) {
    return failure(res, 'Failed to update notification', { statusCode: 500, code: 'NOTIFICATION_UPDATE_FAILED' });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany({ userId: req.user.id, isRead: false }, { $set: { isRead: true } });

    if (result.modifiedCount > 0) {
      await logAction({
        userId: req.user.id,
        userName: req.user.name || req.user.email,
        action: 'read',
        resourceType: 'notification',
        resourceName: 'all_notifications',
        details: { event: 'notifications_mark_all_read', count: result.modifiedCount },
        ipAddress: req.ip
      });
    }

    return success(res, { updated: result.modifiedCount });
  } catch (_error) {
    return failure(res, 'Failed to update notifications', { statusCode: 500, code: 'NOTIFICATIONS_UPDATE_FAILED' });
  }
};

module.exports = { listMyNotifications, markNotificationRead, markAllNotificationsRead };
