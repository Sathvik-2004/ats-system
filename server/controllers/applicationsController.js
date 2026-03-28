const Application = require('../models/Application');
const Job = require('../models/Job');
const AuditLog = require('../models/AuditLog');
const { createNotification, notifyRoles } = require('../services/notificationService');
const { emitToRoles, emitToUser } = require('../socket');
const { sendWorkflowEmail } = require('../services/emailService');
const { success, failure } = require('../utils/response');

const resolveApplicationJobTitle = (application) => {
  if (application?.job && typeof application.job === 'object' && application.job.title) {
    return application.job.title;
  }
  if (typeof application?.jobTitle === 'string' && application.jobTitle.trim()) {
    return application.jobTitle.trim();
  }
  return 'Unknown Role';
};

/**
 * Get all applications with search, filter, sort, and pagination
 */
exports.getAllApplications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      jobTitle = '',
      includeWithdrawn = 'false',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const shouldIncludeWithdrawn = String(includeWithdrawn).toLowerCase() === 'true';
    const filter = shouldIncludeWithdrawn ? {} : { status: { $ne: 'withdrawn' } };

    // Search filter - search in name and email
    if (search) {
      filter.$or = [
        { candidateName: { $regex: search, $options: 'i' } },
        { candidateEmail: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Job title filter
    if (jobTitle && jobTitle !== 'all') {
      const titleRegex = { $regex: jobTitle, $options: 'i' };
      const matchedJobs = await Job.find({ title: titleRegex }).select('_id').lean();
      const matchedJobIds = matchedJobs.map((job) => job._id);
      filter.$and = [
        ...(Array.isArray(filter.$and) ? filter.$and : []),
        {
          $or: [
            { job: { $in: matchedJobIds } },
            { jobTitle: titleRegex }
          ]
        }
      ];
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.max(1, Math.min(100, parseInt(limit))); // Max 100 items per page
    const skip = (pageNum - 1) * pageSize;

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries in parallel
    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('job', 'title company')
        .sort(sortObj)
        .limit(pageSize)
        .skip(skip)
        .lean(),
      Application.countDocuments(filter)
    ]);

    const pagination = {
      currentPage: pageNum,
      totalPages: Math.ceil(total / pageSize),
      totalItems: total,
      itemsPerPage: pageSize
    };

    return success(res, applications, { meta: { pagination }, extra: { pagination } });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return failure(res, 'Failed to fetch applications', {
      statusCode: 500,
      code: 'APPLICATIONS_FETCH_FAILED',
      details: process.env.NODE_ENV !== 'production' ? { error: error.message } : undefined
    });
  }
};

/**
 * Get single application details
 */
exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id).populate('job', 'title company');
    if (!application) {
      return failure(res, 'Application not found', { statusCode: 404, code: 'APPLICATION_NOT_FOUND' });
    }

    return success(res, application);
  } catch (error) {
    console.error('Error fetching application:', error);
    return failure(res, 'Failed to fetch application', { statusCode: 500, code: 'APPLICATION_FETCH_FAILED' });
  }
};

/**
 * Update application status
 */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'selected', 'rejected', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return failure(res, 'Invalid status', { statusCode: 400, code: 'INVALID_STATUS' });
    }

    const current = await Application.findById(id).populate('job', 'title company').lean();
    if (!current) {
      return failure(res, 'Application not found', { statusCode: 404, code: 'APPLICATION_NOT_FOUND' });
    }

    const updatePayload = {
      status,
      updatedAt: new Date()
    };

    if (typeof notes === 'string' && notes.trim()) {
      updatePayload.notes = notes.trim();
    }

    const application = await Application.findByIdAndUpdate(
      id,
      {
        $set: updatePayload,
        $push: {
          statusHistory: {
            fromStatus: current.status,
            toStatus: status,
            comment: typeof notes === 'string' ? notes.trim() : '',
            changedBy: {
              userId: req.user?.id,
              name: req.user?.name || 'system',
              role: req.user?.role || 'system'
            },
            changedAt: new Date()
          }
        }
      },
      { new: true }
    ).populate('job', 'title company');

    const resolvedJobTitle = resolveApplicationJobTitle(application);

    // Log the action
    await AuditLog.create({
      userId: req.user?.id,
      userName: req.user?.name || 'unknown',
      action: 'status_change',
      resourceType: 'application',
      resourceId: id,
      resourceName: application.candidateName,
      details: { oldStatus: current.status, newStatus: status }
    });

    if (application.candidateId) {
      await createNotification({
        userId: application.candidateId,
        type: 'status_update',
        title: 'Application Status Changed',
        message: `Your application for ${resolvedJobTitle} moved from ${current.status} to ${status}.`,
        priority: status === 'selected' ? 'high' : 'medium',
        metadata: { applicationId: id, oldStatus: current.status, newStatus: status },
        createdBy: { userId: req.user?.id, name: req.user?.name || 'system' }
      });
    }

    await sendWorkflowEmail({
      to: application.candidateEmail,
      templateTypes:
        status === 'selected'
          ? ['job_offer', 'status_change']
          : status === 'rejected'
            ? ['rejection_letter', 'status_change']
            : ['status_change'],
      fallbackSubject: `Application Status Update - ${resolvedJobTitle}`,
      fallbackContent: `Hello ${application.candidateName},\n\nYour application for ${resolvedJobTitle} has been updated to ${status}.${notes ? `\n\nFeedback: ${notes}` : ''}\n\nRegards,\nATS Team`,
      variables: {
        candidateName: application.candidateName,
        jobTitle: resolvedJobTitle,
        newStatus: status,
        oldStatus: current.status,
        feedback: notes || ''
      }
    });

    emitToRoles(['admin', 'recruiter'], 'application:status-updated', {
      applicationId: application._id,
      oldStatus: current.status,
      newStatus: status,
      application
    });

    if (application.candidateId) {
      emitToUser(application.candidateId, 'application:status-updated', {
        applicationId: application._id,
        oldStatus: current.status,
        newStatus: status,
        application
      });
    }

    return success(res, application, { message: 'Application status updated' });
  } catch (error) {
    console.error('Error updating application:', error);
    return failure(res, 'Failed to update application', { statusCode: 500, code: 'APPLICATION_UPDATE_FAILED' });
  }
};

exports.createApplication = async (req, res) => {
  try {
    const { name, email, phone, jobId, resumeUrl = '', resumeName = '', resumeText = '' } = req.body;
    const normalizedJobId = typeof jobId === 'string' ? jobId.trim() : '';

    console.log('[Application:create] incoming payload', {
      userId: req.user?.id,
      jobId: normalizedJobId,
      hasResumeFile: Boolean(req.file),
      candidateEmail: email || req.user?.email
    });

    if (!normalizedJobId) {
      return failure(res, 'Job ID is required', { statusCode: 400, code: 'JOB_ID_REQUIRED' });
    }

    const job = await Job.findById(normalizedJobId).lean();
    if (!job) {
      return failure(res, 'Selected job not found', { statusCode: 404, code: 'JOB_NOT_FOUND' });
    }

    const normalizedResumeName =
      (typeof resumeName === 'string' && resumeName.trim()) ||
      req.file?.originalname ||
      '';

    const application = await Application.create({
      candidateId: req.user?.id,
      job: job._id,
      candidateName: name || req.user?.name,
      candidateEmail: email || req.user?.email,
      phone,
      jobTitle: job.title,
      status: 'applied',
      resumeUrl,
      resumeName: normalizedResumeName,
      resumeText: typeof resumeText === 'string' ? resumeText.trim() : '',
      statusHistory: [
        {
          fromStatus: null,
          toStatus: 'applied',
          comment: '',
          changedBy: {
            userId: req.user?.id,
            name: req.user?.name || name || 'candidate',
            role: req.user?.role || 'candidate'
          },
          changedAt: new Date()
        }
      ]
    });

    await notifyRoles({
      roles: ['admin', 'recruiter'],
      type: 'application',
      title: 'New Application Submitted',
      message: `${application.candidateName} applied for ${job.title}.`,
      priority: 'high',
      metadata: { applicationId: application._id },
      createdBy: { userId: req.user?.id, name: req.user?.name || application.candidateName }
    });

    if (req.user?.id) {
      await createNotification({
        userId: req.user.id,
        type: 'application',
        title: 'Application Submitted',
        message: `You applied for ${job.title}.`,
        priority: 'medium',
        metadata: { applicationId: application._id },
        createdBy: { userId: req.user.id, name: req.user.name }
      });
    }

    await sendWorkflowEmail({
      to: application.candidateEmail,
      templateTypes: ['application_received'],
      fallbackSubject: `Application Received - ${job.title}`,
      fallbackContent: `Hello ${application.candidateName},\n\nYour application for ${job.title} has been received successfully.\n\nRegards,\nATS Team`,
      variables: {
        candidateName: application.candidateName,
        jobTitle: job.title,
        applicationDate: application.createdAt
      }
    });

    emitToRoles(['admin', 'recruiter'], 'application:new', {
      application
    });

    if (application.candidateId) {
      emitToUser(application.candidateId, 'application:new', {
        application
      });
    }

    return success(res, application, { statusCode: 201, message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error creating application:', error);
    return failure(res, 'Failed to submit application', { statusCode: 500, code: 'APPLICATION_CREATE_FAILED' });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const userFilter = {
      $or: [{ candidateId: req.user.id }, { candidateEmail: req.user.email }]
    };

    const includeWithdrawn = String(req.query?.includeWithdrawn || '').toLowerCase() === 'true';
    const queryFilter = includeWithdrawn
      ? userFilter
      : { $and: [userFilter, { status: { $ne: 'withdrawn' } }] };

    const applications = await Application.find(queryFilter)
      .populate('job', 'title company')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      applications: applications.map((item) => ({
        id: item._id,
        jobTitle: resolveApplicationJobTitle(item),
        status: item.status,
        appliedDate: item.createdAt,
        createdAt: item.createdAt,
        notes: item.notes,
        interviewScheduled: item.interviewScheduled,
        statusHistory: Array.isArray(item.statusHistory) ? item.statusHistory : []
      }))
    });
  } catch (error) {
    console.error('Error fetching my applications:', error);
    return failure(res, 'Failed to fetch my applications', { statusCode: 500, code: 'MY_APPLICATIONS_FETCH_FAILED' });
  }
};

exports.getMyApplicationStats = async (req, res) => {
  try {
    const userFilter = {
      $or: [{ candidateId: req.user.id }, { candidateEmail: req.user.email }]
    };

    const activeUserFilter = {
      $and: [userFilter, { status: { $ne: 'withdrawn' } }]
    };

    const [total, pending, underReview, interview, approved, rejected, withdrawn] = await Promise.all([
      Application.countDocuments(activeUserFilter),
      Application.countDocuments({ $and: [userFilter, { status: 'applied' }] }),
      Application.countDocuments({ $and: [userFilter, { status: { $in: ['reviewing', 'shortlisted'] } }] }),
      Application.countDocuments({ $and: [userFilter, { status: 'interview_scheduled' }] }),
      Application.countDocuments({ $and: [userFilter, { status: 'selected' }] }),
      Application.countDocuments({ $and: [userFilter, { status: 'rejected' }] }),
      Application.countDocuments({ $and: [userFilter, { status: 'withdrawn' }] })
    ]);

    return res.json({
      success: true,
      stats: { total, pending, underReview, interview, approved, rejected, withdrawn }
    });
  } catch (error) {
    console.error('Error fetching my application stats:', error);
    return failure(res, 'Failed to fetch stats', { statusCode: 500, code: 'MY_APPLICATION_STATS_FETCH_FAILED' });
  }
};

/**
 * Bulk update application status
 */
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { applicationIds, status } = req.body;

    // Validate input
    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return failure(res, 'No applications selected', { statusCode: 400, code: 'NO_APPLICATIONS_SELECTED' });
    }

    const validStatuses = ['applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'];
    if (!validStatuses.includes(status)) {
      return failure(res, 'Invalid status', { statusCode: 400, code: 'INVALID_STATUS' });
    }

    // Bulk update
    const result = await Application.updateMany(
      { _id: { $in: applicationIds } },
      { status, updatedAt: new Date() }
    );

    return success(res, { updated: result.modifiedCount }, { message: `Updated ${result.modifiedCount} applications` });
  } catch (error) {
    console.error('Error bulk updating applications:', error);
    return failure(res, 'Failed to bulk update applications', { statusCode: 500, code: 'APPLICATIONS_BULK_UPDATE_FAILED' });
  }
};

/**
 * Delete application
 */
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findByIdAndDelete(id);

    if (!application) {
      return failure(res, 'Application not found', { statusCode: 404, code: 'APPLICATION_NOT_FOUND' });
    }

    // Log the action
    await AuditLog.create({
      userId: req.user?.id,
      userName: req.user?.name || 'unknown',
      action: 'delete',
      resourceType: 'application',
      resourceId: id,
      resourceName: application.candidateName
    });

    return success(res, application, { message: 'Application deleted' });
  } catch (error) {
    console.error('Error deleting application:', error);
    return failure(res, 'Failed to delete application', { statusCode: 500, code: 'APPLICATION_DELETE_FAILED' });
  }
};

/**
 * Bulk delete applications
 */
exports.bulkDeleteApplications = async (req, res) => {
  try {
    const { applicationIds } = req.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return failure(res, 'No applications selected', { statusCode: 400, code: 'NO_APPLICATIONS_SELECTED' });
    }

    const result = await Application.deleteMany({
      _id: { $in: applicationIds }
    });

    return success(res, { deleted: result.deletedCount }, { message: `Deleted ${result.deletedCount} applications` });
  } catch (error) {
    console.error('Error bulk deleting applications:', error);
    return failure(res, 'Failed to bulk delete applications', { statusCode: 500, code: 'APPLICATIONS_BULK_DELETE_FAILED' });
  }
};

/**
 * Get unique job titles for filter dropdown
 */
exports.getJobTitles = async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('job', 'title')
      .select('job jobTitle')
      .lean();

    const titles = new Set();
    applications.forEach((item) => {
      const title = resolveApplicationJobTitle(item);
      if (title && title !== 'Unknown Role') {
        titles.add(title);
      }
    });

    return success(res, Array.from(titles).sort());
  } catch (error) {
    console.error('Error fetching job titles:', error);
    return failure(res, 'Failed to fetch job titles', { statusCode: 500, code: 'JOB_TITLES_FETCH_FAILED' });
  }
};

/**
 * Export applications to CSV
 */
exports.exportApplications = async (req, res) => {
  try {
    const { status = '', jobTitle = '' } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (jobTitle && jobTitle !== 'all') {
      const titleRegex = { $regex: jobTitle, $options: 'i' };
      const matchedJobs = await Job.find({ title: titleRegex }).select('_id').lean();
      const matchedJobIds = matchedJobs.map((job) => job._id);
      filter.$or = [{ job: { $in: matchedJobIds } }, { jobTitle: titleRegex }];
    }

    const applications = await Application.find(filter).populate('job', 'title company').lean();

    // Create CSV header
    const headers = [
      'Candidate Name',
      'Email',
      'Phone',
      'Job Title',
      'Status',
      'Score',
      'Applied Date',
      'Interview Date',
      'Interview Time'
    ];

    // Create CSV rows
    const rows = applications.map(app => [
      app.candidateName,
      app.candidateEmail,
      app.phone || '',
      resolveApplicationJobTitle(app),
      app.status,
      app.score || '',
      new Date(app.createdAt).toLocaleDateString(),
      app.interviewScheduled?.date ? new Date(app.interviewScheduled.date).toLocaleDateString() : '',
      app.interviewScheduled?.time || ''
    ]);

    // Combine headers and rows
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=applications.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting applications:', error);
    return failure(res, 'Failed to export applications', { statusCode: 500, code: 'APPLICATIONS_EXPORT_FAILED' });
  }
};

/**
 * Get application statistics
 */
exports.getApplicationStats = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          byJobTitle: [
            { $group: { _id: '$jobTitle', count: { $sum: 1 }, avgScore: { $avg: '$score' } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          avgScore: [
            { $group: { _id: null, average: { $avg: '$score' }, highest: { $max: '$score' }, lowest: { $min: '$score' } } }
          ],
          total: [
            { $count: 'count' }
          ]
        }
      }
    ]);

    return success(res, stats[0]);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return failure(res, 'Failed to fetch statistics', { statusCode: 500, code: 'APPLICATION_STATS_FETCH_FAILED' });
  }
};

/**
 * Withdraw an application (candidate only)
 */
exports.withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return failure(res, 'Authentication required', { statusCode: 401, code: 'AUTH_REQUIRED' });
    }

    // Find the application
    const application = await Application.findById(id);
    if (!application) {
      return failure(res, 'Application not found', { statusCode: 404, code: 'APPLICATION_NOT_FOUND' });
    }

    // Verify ownership - only the candidate who applied can withdraw
    if (!application.candidateId) {
      return failure(res, 'Application has no associated candidate', { statusCode: 403, code: 'APPLICATION_OWNERSHIP_INVALID' });
    }

    // Compare IDs - convert both to strings for reliable comparison
    const appCandidateId = application.candidateId.toString();
    const requestUserId = userId.toString ? userId.toString() : userId;
    
    if (appCandidateId !== requestUserId) {
      return failure(res, 'You can only withdraw your own applications', { statusCode: 403, code: 'FORBIDDEN_APPLICATION_ACCESS' });
    }

    // Check if already withdrawn or in final status
    if (application.status === 'withdrawn') {
      return failure(res, 'Application has already been withdrawn', { statusCode: 400, code: 'APPLICATION_ALREADY_WITHDRAWN' });
    }

    if (application.status === 'selected') {
      return failure(res, 'Cannot withdraw an application that has been accepted', { statusCode: 400, code: 'APPLICATION_WITHDRAW_NOT_ALLOWED' });
    }

    const previousStatus = application.status;

    // Update application to withdrawn
    const updated = await Application.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'withdrawn',
          updatedAt: new Date()
        },
        $push: {
          statusHistory: {
            fromStatus: previousStatus,
            toStatus: 'withdrawn',
            comment: 'Candidate withdrew application',
            changedBy: {
              userId: req.user?.id,
              name: req.user?.name || 'candidate',
              role: 'candidate'
            },
            changedAt: new Date()
          }
        }
      },
      { new: true }
    ).populate('job', 'title company');

    const resolvedJobTitle = resolveApplicationJobTitle(updated);

    // Log the action (non-blocking)
    try {
      await AuditLog.create({
        userId: req.user?.id,
        userName: req.user?.name || 'unknown',
        action: 'application_withdrawn',
        resourceType: 'application',
        resourceId: id,
        resourceName: updated.candidateName,
        details: { previousStatus, newStatus: 'withdrawn', jobTitle: resolvedJobTitle }
      });
    } catch (auditError) {
      console.error('Audit log error while withdrawing application:', auditError);
    }

    // Notify admins/recruiters via socket
    emitToRoles(['admin', 'recruiter'], 'application:withdrawn', {
      applicationId: updated._id,
      candidateName: updated.candidateName,
      jobTitle: resolvedJobTitle,
      withdrawnAt: new Date()
    });

    return success(res, updated, { message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    return failure(res, 'Failed to withdraw application', {
      statusCode: 500,
      code: 'APPLICATION_WITHDRAW_FAILED',
      details: process.env.NODE_ENV !== 'production' ? { error: error.message } : undefined
    });
  }
};

