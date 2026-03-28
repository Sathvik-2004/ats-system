const EmailTemplate = require('../models/EmailTemplate');
const { success, failure } = require('../utils/response');

const listTemplates = async (_req, res) => {
  try {
    const templates = await EmailTemplate.find().sort({ updatedAt: -1 }).lean();
    return success(res, templates);
  } catch (_error) {
    return failure(res, 'Failed to fetch templates', { statusCode: 500, code: 'EMAIL_TEMPLATES_FETCH_FAILED' });
  }
};

const createTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.create(req.body);
    return success(res, template, { statusCode: 201, message: 'Template created successfully' });
  } catch (_error) {
    return failure(res, 'Failed to create template', { statusCode: 500, code: 'EMAIL_TEMPLATE_CREATE_FAILED' });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await EmailTemplate.findByIdAndUpdate(id, req.body, { new: true }).lean();
    if (!template) {
      return failure(res, 'Template not found', { statusCode: 404, code: 'EMAIL_TEMPLATE_NOT_FOUND' });
    }

    return success(res, template, { message: 'Template updated successfully' });
  } catch (_error) {
    return failure(res, 'Failed to update template', { statusCode: 500, code: 'EMAIL_TEMPLATE_UPDATE_FAILED' });
  }
};

module.exports = { listTemplates, createTemplate, updateTemplate };
