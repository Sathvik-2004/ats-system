const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const { logAction } = require('./auditController');
const { createNotification, notifyRoles } = require('../services/notificationService');
const { success, failure } = require('../utils/response');

const normalizeRequirements = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const getSalaryValue = (salary) => {
  if (typeof salary === 'number') return salary;
  if (typeof salary === 'string') {
    const matches = salary.replace(/,/g, '').match(/\d+/g);
    if (!matches || matches.length === 0) return 0;
    const nums = matches.map((value) => Number(value)).filter((value) => Number.isFinite(value));
    if (nums.length === 0) return 0;
    return Math.max(...nums);
  }
  return 0;
};

const listJobs = async (req, res) => {
  try {
    const {
      search = '',
      location = '',
      role = '',
      experience = '',
      jobType = '',
      salaryMin = '',
      sortBy = 'latest',
      page = '1',
      limit = '12',
      paginated = 'false'
    } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (role) filter.title = { $regex: role, $options: 'i' };
    const rawJobs = await Job.find(filter).lean();

    let jobs = rawJobs;
    if (experience) {
      const expNeedle = String(experience).toLowerCase();
      jobs = jobs.filter((job) => String(job.experience || '').toLowerCase().includes(expNeedle));
    }
    if (jobType) {
      const typeNeedle = String(jobType).toLowerCase();
      jobs = jobs.filter((job) => {
        const primary = String(job.jobType || '').toLowerCase();
        const secondary = String(job.type || '').toLowerCase();
        return primary === typeNeedle || secondary === typeNeedle;
      });
    }

    const minSalary = Number(salaryMin);
    if (Number.isFinite(minSalary) && minSalary > 0) {
      jobs = jobs.filter((job) => getSalaryValue(job.salary) >= minSalary);
    }

    if (sortBy === 'salary_high') {
      jobs = [...jobs].sort((a, b) => getSalaryValue(b.salary) - getSalaryValue(a.salary));
    } else if (sortBy === 'salary_low') {
      jobs = [...jobs].sort((a, b) => getSalaryValue(a.salary) - getSalaryValue(b.salary));
    } else {
      jobs = [...jobs].sort((a, b) => new Date(b.postedAt || 0) - new Date(a.postedAt || 0));
    }

    const isPaginated = String(paginated).toLowerCase() === 'true';
    if (!isPaginated) {
      return res.json(jobs);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    const start = (pageNum - 1) * pageSize;
    const pagedJobs = jobs.slice(start, start + pageSize);

    return res.json({
      success: true,
      data: pagedJobs,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.max(1, Math.ceil(jobs.length / pageSize)),
        totalItems: jobs.length,
        itemsPerPage: pageSize
      }
    });
  } catch (error) {
    return failure(res, 'Failed to fetch jobs', { statusCode: 500, code: 'JOBS_FETCH_FAILED' });
  }
};

const createJob = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.type && payload.jobType) payload.type = payload.jobType;
    if (!payload.jobType && payload.type) payload.jobType = payload.type;
    payload.requirements = normalizeRequirements(req.body.skills || req.body.requirements);

    const job = await Job.create(payload);

    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      action: 'create',
      resourceType: 'job',
      resourceId: job._id,
      resourceName: job.title,
      details: { company: job.company },
      ipAddress: req.ip
    });

    await notifyRoles({
      roles: ['admin', 'recruiter'],
      type: 'job',
      title: 'New Job Posted',
      message: `${job.title} at ${job.company} was created.`,
      priority: 'medium',
      metadata: { jobId: job._id },
      createdBy: { userId: req.user.id, name: req.user.name }
    });

    return success(res, job, { statusCode: 201, message: 'Job created successfully' });
  } catch (error) {
    return failure(res, 'Failed to create job', { statusCode: 500, code: 'JOB_CREATE_FAILED' });
  }
};

const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (!payload.type && payload.jobType) payload.type = payload.jobType;
    if (!payload.jobType && payload.type) payload.jobType = payload.type;
    payload.requirements = normalizeRequirements(req.body.skills || req.body.requirements);
    payload.updatedAt = new Date();

    const job = await Job.findByIdAndUpdate(id, payload, { new: true }).lean();
    if (!job) {
      return failure(res, 'Job not found', { statusCode: 404, code: 'JOB_NOT_FOUND' });
    }

    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      action: 'update',
      resourceType: 'job',
      resourceId: job._id,
      resourceName: job.title,
      details: { company: job.company, event: 'job_updated' },
      ipAddress: req.ip
    });

    return success(res, job, { message: 'Job updated successfully' });
  } catch (_error) {
    return failure(res, 'Failed to update job', { statusCode: 500, code: 'JOB_UPDATE_FAILED' });
  }
};

const applyToJob = async (req, res) => {
  try {
    const { jobId, coverLetter = '' } = req.body;
    const userId = req.user.id;

    const [job, existing] = await Promise.all([
      Job.findById(jobId).lean(),
      Application.findOne({ candidateId: userId, job: jobId }).lean()
    ]);

    if (!job) return failure(res, 'Job not found', { statusCode: 404, code: 'JOB_NOT_FOUND' });
    if (existing) return failure(res, 'Already applied to this job', { statusCode: 400, code: 'APPLICATION_EXISTS' });

    const application = await Application.create({
      candidateId: userId,
      job: jobId,
      candidateName: req.user.name,
      candidateEmail: req.user.email,
      jobTitle: job.title,
      status: 'applied',
      coverLetter,
      resumeUrl: req.body.resumeUrl || ''
    });

    await logAction({
      userId,
      userName: req.user.name,
      action: 'create',
      resourceType: 'application',
      resourceId: application._id,
      resourceName: application.jobTitle,
      details: { event: 'apply_job' },
      ipAddress: req.ip
    });

    await notifyRoles({
      roles: ['admin', 'recruiter'],
      type: 'application',
      title: 'New Job Application',
      message: `${req.user.name} applied for ${job.title}.`,
      priority: 'high',
      metadata: { applicationId: application._id, jobId, candidateId: userId },
      createdBy: { userId, name: req.user.name }
    });

    await createNotification({
      userId,
      type: 'application',
      title: 'Application Submitted',
      message: `Your application for ${job.title} has been submitted successfully.`,
      priority: 'medium',
      metadata: { applicationId: application._id, jobId },
      createdBy: { userId, name: req.user.name }
    });

    return success(res, application, { statusCode: 201, message: 'Application submitted successfully' });
  } catch (error) {
    return failure(res, 'Failed to apply for job', { statusCode: 500, code: 'APPLY_JOB_FAILED' });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean();

    if (!job) {
      return failure(res, 'Job not found', { statusCode: 404, code: 'JOB_NOT_FOUND' });
    }

    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      action: 'delete',
      resourceType: 'job',
      resourceId: id,
      resourceName: job.title,
      details: { event: 'job_deactivated' },
      ipAddress: req.ip
    });

    return success(res, job, { message: 'Job removed' });
  } catch (error) {
    return failure(res, 'Failed to delete job', { statusCode: 500, code: 'JOB_DELETE_FAILED' });
  }
};

const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('savedJobs')
      .populate({ path: 'savedJobs', match: { isActive: true } })
      .lean();

    return success(res, (user?.savedJobs || []).filter(Boolean));
  } catch (_error) {
    return failure(res, 'Failed to fetch saved jobs', { statusCode: 500, code: 'SAVED_JOBS_FETCH_FAILED' });
  }
};

const saveJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id).lean();
    if (!job || job.isActive === false) {
      return failure(res, 'Job not found', { statusCode: 404, code: 'JOB_NOT_FOUND' });
    }

    await User.updateOne({ _id: req.user.id }, { $addToSet: { savedJobs: id }, $set: { updatedAt: new Date() } });

    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      action: 'save',
      resourceType: 'saved_job',
      resourceId: id,
      resourceName: job.title,
      details: { event: 'save_job', company: job.company },
      ipAddress: req.ip
    });

    return success(res, null, { message: 'Job saved' });
  } catch (_error) {
    return failure(res, 'Failed to save job', { statusCode: 500, code: 'JOB_SAVE_FAILED' });
  }
};

const unsaveJob = async (req, res) => {
  try {
    const { id } = req.params;
    await User.updateOne({ _id: req.user.id }, { $pull: { savedJobs: id }, $set: { updatedAt: new Date() } });

    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      action: 'delete',
      resourceType: 'saved_job',
      resourceId: id,
      resourceName: 'saved-job',
      details: { event: 'unsave_job' },
      ipAddress: req.ip
    });

    return success(res, null, { message: 'Job removed from saved list' });
  } catch (_error) {
    return failure(res, 'Failed to remove saved job', { statusCode: 500, code: 'JOB_UNSAVE_FAILED' });
  }
};

module.exports = { listJobs, createJob, updateJob, applyToJob, deleteJob, getSavedJobs, saveJob, unsaveJob };
