const Settings = require('../models/Settings');
const { logAction } = require('./auditController');
const { success, failure } = require('../utils/response');

const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSingleton();

    await logAction({
      userId: req.user?.id,
      userName: req.user?.name || req.user?.email,
      action: 'read',
      resourceType: 'settings',
      resourceName: 'system_settings',
      details: { event: 'settings_view' },
      ipAddress: req.ip
    });

    return success(res, settings, { extra: { settings } });
  } catch (_error) {
    return failure(res, 'Failed to fetch settings', { statusCode: 500, code: 'SETTINGS_FETCH_FAILED' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const settings = await Settings.updateSettings(req.body, req.user?.email || req.user?.name || 'admin');

    await logAction({
      userId: req.user?.id,
      userName: req.user?.name || req.user?.email,
      action: 'update',
      resourceType: 'settings',
      resourceName: 'system_settings',
      details: { event: 'settings_update', fields: Object.keys(req.body || {}) },
      ipAddress: req.ip
    });

    return success(res, settings, { message: 'Settings updated', extra: { settings } });
  } catch (_error) {
    return failure(res, 'Failed to update settings', { statusCode: 500, code: 'SETTINGS_UPDATE_FAILED' });
  }
};

const resetSettings = async (req, res) => {
  try {
    await Settings.deleteMany({});
    const settings = await Settings.getSingleton();

    await logAction({
      userId: req.user?.id,
      userName: req.user?.name || req.user?.email,
      action: 'update',
      resourceType: 'settings',
      resourceName: 'system_settings',
      details: { event: 'settings_reset' },
      ipAddress: req.ip
    });

    return success(res, settings, { message: 'Settings reset', extra: { settings } });
  } catch (_error) {
    return failure(res, 'Failed to reset settings', { statusCode: 500, code: 'SETTINGS_RESET_FAILED' });
  }
};

module.exports = { getSettings, updateSettings, resetSettings };
