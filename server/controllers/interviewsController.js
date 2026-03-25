const Application = require('../models/Application');
const { logAction } = require('./auditController');
const { createNotification, notifyRoles } = require('../services/notificationService');
const { emitToRoles, emitToUser } = require('../socket');
const { sendWorkflowEmail } = require('../services/emailService');
const { parsePagination, toPaginationMeta } = require('../utils/pagination');
const { success, failure } = require('../utils/response');

const normalizeInterviewMode = (modeValue) => {
  const raw = String(modeValue || '').trim().toLowerCase();
  if (raw === 'in person' || raw === 'in_person') return 'in-person';
  if (raw === 'in-person' || raw === 'online') return raw;
  return '';
};

const scheduleInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, mode, interviewLink = '', notes = '' } = req.body;
    const normalizedMode = normalizeInterviewMode(mode);

    if (!normalizedMode) {
      return failure(res, 'Interview mode is required and must be online or in-person', {
        statusCode: 400,
        code: 'INVALID_INTERVIEW_MODE'
      });
    }

    console.log('[Interview:schedule] payload', {
      applicationId: id,
      date,
      time,
      mode: normalizedMode
    });

    const current = await Application.findById(id).select('status').lean();
    if (!current) {
      return failure(res, 'Application not found', { statusCode: 404, code: 'APPLICATION_NOT_FOUND' });
    }

    const selectedDate = new Date(date);
    if (Number.isNaN(selectedDate.getTime())) {
      return failure(res, 'Invalid interview date', { statusCode: 400, code: 'INVALID_INTERVIEW_DATE' });
    }

    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const conflictingInterview = await Application.findOne({
      _id: { $ne: id },
      status: 'interview_scheduled',
      'interviewScheduled.date': { $gte: dayStart, $lte: dayEnd },
      'interviewScheduled.time': time
    })
      .select('_id candidateName jobTitle interviewScheduled')
      .lean();

    if (conflictingInterview) {
      return failure(res, `Time conflict: another interview is already scheduled at ${time} on ${selectedDate.toLocaleDateString()}`, {
        statusCode: 409,
        code: 'INTERVIEW_TIME_CONFLICT',
        details: {
          applicationId: conflictingInterview._id,
          candidateName: conflictingInterview.candidateName,
          jobTitle: conflictingInterview.jobTitle
        }
      });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'interview_scheduled',
          interviewScheduled: {
            date: selectedDate,
            time,
            mode: normalizedMode,
            interviewLink,
            notes: notes.trim()
          },
          updatedAt: new Date()
        },
        $push: {
          statusHistory: {
            fromStatus: current.status,
            toStatus: 'interview_scheduled',
            comment: `Interview scheduled on ${new Date(date).toLocaleDateString()} at ${time}${notes.trim() ? ` | Notes: ${notes.trim()}` : ''}`,
            changedBy: {
              userId: req.user.id,
              name: req.user.name,
              role: req.user.role
            },
            changedAt: new Date()
          }
        }
      },
      { new: true }
    ).lean();

    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      action: 'interview_scheduled',
      resourceType: 'interview',
      resourceId: application._id,
      resourceName: application.candidateName,
      details: { date, time, mode: normalizedMode, notes: notes.trim() },
      ipAddress: req.ip
    });

    if (application.candidateId) {
      await createNotification({
        userId: application.candidateId,
        type: 'interview',
        title: 'Interview Scheduled',
        message: `Your interview for ${application.jobTitle} is scheduled on ${new Date(date).toLocaleDateString()} at ${time}.`,
        priority: 'high',
        metadata: { applicationId: application._id },
        createdBy: { userId: req.user.id, name: req.user.name }
      });
    }

    await sendWorkflowEmail({
      to: application.candidateEmail,
      templateTypes: ['interview_invite'],
      fallbackSubject: `Interview Scheduled - ${application.jobTitle}`,
      fallbackContent: `Hello ${application.candidateName},\n\nYour interview for ${application.jobTitle} is scheduled on ${new Date(date).toLocaleDateString()} at ${time}.\nMode: ${normalizedMode}${interviewLink ? `\nLink/Location: ${interviewLink}` : ''}${notes.trim() ? `\nNotes: ${notes.trim()}` : ''}\n\nRegards,\nATS Team`,
      variables: {
        candidateName: application.candidateName,
        jobTitle: application.jobTitle,
        interviewDate: new Date(date).toLocaleDateString(),
        interviewTime: time,
        interviewLocation: interviewLink || normalizedMode,
        interviewerName: req.user.name,
        notes: notes.trim()
      }
    });

    await notifyRoles({
      roles: ['admin', 'recruiter'],
      type: 'interview',
      title: 'Interview Added',
      message: `Interview scheduled for ${application.candidateName}.`,
      priority: 'medium',
      metadata: { applicationId: application._id },
      createdBy: { userId: req.user.id, name: req.user.name }
    });

    emitToRoles(['admin', 'recruiter'], 'interview:scheduled', {
      applicationId: application._id,
      application
    });

    if (application.candidateId) {
      emitToUser(application.candidateId, 'interview:scheduled', {
        applicationId: application._id,
        application
      });
    }

    return success(res, application, { message: 'Interview scheduled' });
  } catch (error) {
    return failure(res, 'Failed to schedule interview', { statusCode: 500, code: 'INTERVIEW_SCHEDULE_FAILED' });
  }
};

const listUpcomingInterviews = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, { page: 1, limit: 20, maxLimit: 100 });
    // Interview date is stored as date-only; use start-of-day so same-day interviews remain visible.
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const filter = {
      status: 'interview_scheduled',
      'interviewScheduled.date': { $gte: startOfToday }
    };
    const [interviews, totalItems] = await Promise.all([
      Application.find(filter)
        .select('candidateName candidateEmail jobTitle status interviewScheduled createdAt updatedAt')
        .sort({ 'interviewScheduled.date': 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments(filter)
    ]);

    return success(res, interviews, { meta: { pagination: toPaginationMeta({ page, limit, totalItems }) } });
  } catch (error) {
    return failure(res, 'Failed to fetch interviews', { statusCode: 500, code: 'INTERVIEWS_FETCH_FAILED' });
  }
};

const submitInterviewFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = req.body || {};

    const current = await Application.findById(id).select('status').lean();
    if (!current) {
      return failure(res, 'Application not found', { statusCode: 404, code: 'APPLICATION_NOT_FOUND' });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      {
        $set: {
          interviewFeedback: feedback,
          status: feedback?.recommendation === 'hire' ? 'selected' : 'reviewing',
          updatedAt: new Date()
        },
        $push: {
          statusHistory: {
            fromStatus: current.status,
            toStatus: feedback?.recommendation === 'hire' ? 'selected' : 'reviewing',
            comment: feedback?.comments || `Interview feedback: ${feedback?.recommendation || 'n/a'}`,
            changedBy: {
              userId: req.user.id,
              name: req.user.name,
              role: req.user.role
            },
            changedAt: new Date()
          }
        }
      },
      { new: true }
    ).lean();

    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      action: 'update',
      resourceType: 'interview',
      resourceId: application._id,
      resourceName: application.candidateName,
      details: { event: 'interview_feedback', recommendation: feedback?.recommendation || 'n/a' },
      ipAddress: req.ip
    });

    if (application.candidateId) {
      await createNotification({
        userId: application.candidateId,
        type: 'status_update',
        title: 'Application Status Updated',
        message: `Your status for ${application.jobTitle} is now ${application.status}.`,
        priority: 'medium',
        metadata: { applicationId: application._id, status: application.status },
        createdBy: { userId: req.user.id, name: req.user.name }
      });
    }

    await sendWorkflowEmail({
      to: application.candidateEmail,
      templateTypes:
        application.status === 'selected'
          ? ['job_offer', 'status_change']
          : application.status === 'rejected'
            ? ['rejection_letter', 'status_change']
            : ['status_change'],
      fallbackSubject: `Application Status Update - ${application.jobTitle}`,
      fallbackContent: `Hello ${application.candidateName},\n\nYour application status is now ${application.status}.\n\nFeedback: ${feedback?.comments || 'No additional comments'}\n\nRegards,\nATS Team`,
      variables: {
        candidateName: application.candidateName,
        jobTitle: application.jobTitle,
        newStatus: application.status,
        feedback: feedback?.comments || ''
      }
    });

    emitToRoles(['admin', 'recruiter'], 'application:status-updated', {
      applicationId: application._id,
      newStatus: application.status,
      application
    });

    if (application.candidateId) {
      emitToUser(application.candidateId, 'application:status-updated', {
        applicationId: application._id,
        newStatus: application.status,
        application
      });
    }

    return success(res, application, { message: 'Interview feedback saved' });
  } catch (error) {
    return failure(res, 'Failed to submit feedback', { statusCode: 500, code: 'INTERVIEW_FEEDBACK_FAILED' });
  }
};

module.exports = { scheduleInterview, listUpcomingInterviews, submitInterviewFeedback };
