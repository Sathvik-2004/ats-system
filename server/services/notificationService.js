const Notification = require('../models/Notification');
const User = require('../models/User');
const { emitToUser, emitToRoles } = require('../socket');

const createNotification = async ({ userId, type = 'system', title, message, priority = 'medium', metadata = {}, createdBy = {} }) => {
  if (!userId || !title || !message) {
    return null;
  }

  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    priority,
    metadata,
    createdBy
  });

  emitToUser(userId, 'notification:new', {
    notification: notification.toObject()
  });

  return notification;
};

const notifyRoles = async ({ roles = [], type = 'system', title, message, priority = 'medium', metadata = {}, createdBy = {} }) => {
  if (!roles.length || !title || !message) {
    return;
  }

  const users = await User.find({ role: { $in: roles }, isActive: true }).select('_id').lean();
  if (!users.length) {
    return;
  }

  const docs = users.map((user) => ({
    userId: user._id,
    type,
    title,
    message,
    priority,
    metadata,
    createdBy
  }));

  await Notification.insertMany(docs, { ordered: false });

  emitToRoles(roles, 'notification:refresh', {
    type,
    title,
    message,
    priority,
    metadata,
    createdBy
  });
};

module.exports = { createNotification, notifyRoles };
