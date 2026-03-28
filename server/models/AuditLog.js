const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: String,
  action: {
    type: String,
    enum: ['login', 'logout', 'create', 'update', 'delete', 'status_change', 'interview_scheduled', 'read', 'export', 'refresh', 'application_withdrawn'],
    required: true
  },
  resourceType: {
    type: String,
    enum: ['job', 'application', 'user', 'interview', 'notification', 'settings', 'report', 'session'],
    required: true
  },
  resourceId: mongoose.Schema.Types.ObjectId,
  resourceName: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
