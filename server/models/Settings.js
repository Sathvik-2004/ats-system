const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Auto-Processing Settings
  autoProcessing: {
    enabled: { type: Boolean, default: true },
    approvalThreshold: { type: Number, default: 70 },
    interviewThreshold: { type: Number, default: 60 },
    rejectionThreshold: { type: Number, default: 40 },
    schedule: { type: String, enum: ['manual', 'daily', 'weekly'], default: 'manual' },
    scoringWeights: {
      emailDomain: { type: Number, default: 10 },
      recentApplication: { type: Number, default: 15 },
      resumePresent: { type: Number, default: 15 },
      experienceKeywords: { type: Number, default: 15 },
      highDemandRole: { type: Number, default: 10 }
    }
  },

  // Application Settings
  application: {
    maxFileSizeMB: { type: Number, default: 5 },
    allowedFileTypes: { type: [String], default: ['pdf', 'doc', 'docx'] },
    mandatoryFields: {
      phone: { type: Boolean, default: false },
      coverLetter: { type: Boolean, default: false },
      linkedin: { type: Boolean, default: false },
      portfolio: { type: Boolean, default: false }
    },
    statusLabels: {
      pending: { type: String, default: 'Pending' },
      underReview: { type: String, default: 'Under Review' },
      interviewScheduled: { type: String, default: 'Interview Scheduled' },
      approved: { type: String, default: 'Approved' },
      rejected: { type: String, default: 'Rejected' }
    },
    autoCloseAfterDays: { type: Number, default: 30 }
  },

  // Email Notification Settings
  email: {
    enabled: { type: Boolean, default: false },
    smtp: {
      host: { type: String, default: '' },
      port: { type: Number, default: 587 },
      secure: { type: Boolean, default: false },
      username: { type: String, default: '' },
      password: { type: String, default: '' }
    },
    templates: {
      applicationReceived: {
        enabled: { type: Boolean, default: true },
        subject: { type: String, default: 'Application Received - {{jobTitle}}' },
        body: { type: String, default: 'Dear {{applicantName}},\n\nThank you for applying for the {{jobTitle}} position. We have received your application and will review it shortly.\n\nBest regards,\nHR Team' }
      },
      statusChange: {
        enabled: { type: Boolean, default: true },
        subject: { type: String, default: 'Application Status Update - {{jobTitle}}' },
        body: { type: String, default: 'Dear {{applicantName}},\n\nYour application status for {{jobTitle}} has been updated to: {{newStatus}}\n\nBest regards,\nHR Team' }
      },
      interviewScheduled: {
        enabled: { type: Boolean, default: true },
        subject: { type: String, default: 'Interview Scheduled - {{jobTitle}}' },
        body: { type: String, default: 'Dear {{applicantName}},\n\nCongratulations! We would like to schedule an interview for the {{jobTitle}} position.\n\nWe will contact you soon with the details.\n\nBest regards,\nHR Team' }
      }
    },
    adminNotifications: {
      newApplication: { type: Boolean, default: true },
      systemAlerts: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: false }
    }
  },

  // Security Settings
  security: {
    sessionTimeoutMinutes: { type: Number, default: 60 },
    passwordRequirements: {
      minLength: { type: Number, default: 8 },
      requireUppercase: { type: Boolean, default: true },
      requireLowercase: { type: Boolean, default: true },
      requireNumbers: { type: Boolean, default: true },
      requireSpecialChars: { type: Boolean, default: true }
    },
    maxLoginAttempts: { type: Number, default: 5 },
    lockoutDurationMinutes: { type: Number, default: 15 },
    twoFactorAuth: { type: Boolean, default: false },
    apiRateLimit: {
      enabled: { type: Boolean, default: true },
      requestsPerMinute: { type: Number, default: 100 }
    }
  },

  // System Preferences
  system: {
    companyInfo: {
      name: { type: String, default: 'Company Name' },
      logo: { type: String, default: '' },
      website: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' }
    },
    timezone: { type: String, default: 'UTC' },
    dateFormat: { type: String, enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], default: 'DD/MM/YYYY' },
    language: { type: String, default: 'en' },
    theme: {
      mode: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
      primaryColor: { type: String, default: '#3b82f6' },
      secondaryColor: { type: String, default: '#6b7280' }
    }
  },

  // Data Management Settings
  dataManagement: {
    retentionPolicyDays: { type: Number, default: 365 },
    autoDeleteOldApplications: { type: Boolean, default: false },
    backupSettings: {
      enabled: { type: Boolean, default: false },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
      retentionDays: { type: Number, default: 30 }
    },
    auditLogging: { type: Boolean, default: true },
    gdprCompliance: {
      enabled: { type: Boolean, default: false },
      consentRequired: { type: Boolean, default: false },
      dataExportEnabled: { type: Boolean, default: true },
      dataDeleteEnabled: { type: Boolean, default: true }
    }
  },

  // Integration Settings
  integrations: {
    calendar: {
      enabled: { type: Boolean, default: false },
      provider: { type: String, enum: ['google', 'outlook', 'none'], default: 'none' },
      apiKey: { type: String, default: '' }
    },
    jobBoards: {
      indeed: {
        enabled: { type: Boolean, default: false },
        apiKey: { type: String, default: '' }
      },
      linkedin: {
        enabled: { type: Boolean, default: false },
        apiKey: { type: String, default: '' }
      }
    },
    analytics: {
      googleAnalytics: {
        enabled: { type: Boolean, default: false },
        trackingId: { type: String, default: '' }
      }
    },
    notifications: {
      slack: {
        enabled: { type: Boolean, default: false },
        webhookUrl: { type: String, default: '' },
        channel: { type: String, default: '#general' }
      },
      teams: {
        enabled: { type: Boolean, default: false },
        webhookUrl: { type: String, default: '' }
      }
    }
  },

  // Metadata
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'system' }
});

// Ensure only one settings document exists
settingsSchema.statics.getSingleton = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this();
    await settings.save();
  }
  return settings;
};

settingsSchema.statics.updateSettings = async function(updates, updatedBy = 'admin') {
  const settings = await this.getSingleton();
  Object.assign(settings, updates);
  settings.lastUpdated = new Date();
  settings.updatedBy = updatedBy;
  await settings.save();
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);