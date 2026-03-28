const nodemailer = require('nodemailer');
const EmailTemplate = require('../models/EmailTemplate');
const Settings = require('../models/Settings');

const toBoolean = (value) => String(value).toLowerCase() === 'true';

const buildVariables = (variables = {}) => {
  return Object.entries(variables).reduce((acc, [key, value]) => {
    acc[key] = value ?? '';
    acc[key.replace(/([A-Z])/g, '_$1').toLowerCase()] = value ?? '';
    return acc;
  }, {});
};

const interpolateTemplate = (content, variables) => {
  if (!content) return '';
  return Object.entries(buildVariables(variables)).reduce((output, [key, value]) => {
    const mustachePattern = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
    const bracePattern = new RegExp(`\\{${key}\\}`, 'gi');
    return output.replace(mustachePattern, String(value)).replace(bracePattern, String(value));
  }, content);
};

const resolveEmailConfig = async () => {
  const settings = await Settings.getSingleton();

  const enabledFromEnv = process.env.EMAIL_ENABLED;
  const enabled = enabledFromEnv !== undefined ? toBoolean(enabledFromEnv) : Boolean(settings?.email?.enabled);

  const smtp = {
    host: process.env.SMTP_HOST || settings?.email?.smtp?.host || '',
    port: Number(process.env.SMTP_PORT || settings?.email?.smtp?.port || 587),
    secure: process.env.SMTP_SECURE !== undefined
      ? toBoolean(process.env.SMTP_SECURE)
      : Boolean(settings?.email?.smtp?.secure),
    username: process.env.SMTP_USERNAME || settings?.email?.smtp?.username || '',
    password: process.env.SMTP_PASSWORD || settings?.email?.smtp?.password || ''
  };

  const from =
    process.env.EMAIL_FROM ||
    settings?.system?.companyInfo?.email ||
    smtp.username ||
    'no-reply@ats.local';

  return { enabled, smtp, from };
};

const getTransporter = async () => {
  const config = await resolveEmailConfig();
  if (!config.enabled) {
    return { transporter: null, config, reason: 'Email disabled' };
  }

  if (!config.smtp.host || !config.smtp.username || !config.smtp.password) {
    return { transporter: null, config, reason: 'SMTP not fully configured' };
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.username,
      pass: config.smtp.password
    }
  });

  return { transporter, config, reason: null };
};

const sendWorkflowEmail = async ({
  to,
  templateTypes = [],
  fallbackSubject = 'ATS Notification',
  fallbackContent = '',
  variables = {}
}) => {
  if (!to) {
    return { sent: false, reason: 'Missing recipient' };
  }

  try {
    const { transporter, config, reason } = await getTransporter();
    if (!transporter) {
      return { sent: false, reason };
    }

    let template = null;
    if (templateTypes.length) {
      template = await EmailTemplate.findOne({
        type: { $in: templateTypes },
        isActive: true
      })
        .sort({ updatedAt: -1 })
        .lean();
    }

    const subject = interpolateTemplate(template?.subject || fallbackSubject, variables);
    const content = interpolateTemplate(template?.content || fallbackContent, variables);

    await transporter.sendMail({
      from: config.from,
      to,
      subject,
      text: content
    });

    if (template?._id) {
      await EmailTemplate.updateOne({ _id: template._id }, { $inc: { usageCount: 1 } });
    }

    return { sent: true };
  } catch (error) {
    return { sent: false, reason: error.message || 'Failed to send email' };
  }
};

module.exports = { sendWorkflowEmail };