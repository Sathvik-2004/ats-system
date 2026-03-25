const Application = require('../models/Application');
const Job = require('../models/Job');
const { logAction } = require('./auditController');
const { success, failure } = require('../utils/response');
const { screenResumeAgainstJob } = require('../utils/resumeScreening');

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const buildCandidateResumeText = (application, overrideResumeText = '') => {
  if (typeof overrideResumeText === 'string' && overrideResumeText.trim()) {
    return overrideResumeText.trim();
  }

  const emailHandle = String(application?.candidateEmail || '').split('@')[0] || '';
  const inferred = [
    application?.resumeText,
    application?.resumeName,
    application?.coverLetter,
    application?.notes,
    application?.candidateName,
    emailHandle,
    Array.isArray(application?.matchingSkills) ? application.matchingSkills.join(' ') : ''
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return inferred;
};

const toObjectIdString = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return String(value._id || value.id || '');
  return '';
};

const titleKey = (value) => normalizeText(value);

const buildJobScreeningContext = (jobDoc, application) => {
  const jobRequirements = Array.isArray(jobDoc?.requirements) ? jobDoc.requirements : [];
  const fallbackDescription = [
    jobDoc?.description,
    jobDoc?.title,
    jobDoc?.company,
    jobDoc?.location,
    jobDoc?.experience,
    application?.jobTitle
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    jobDescription: fallbackDescription,
    jobRequirements
  };
};

const hasRealResumeContent = (application, overrideResumeText = '') => {
  if (typeof overrideResumeText === 'string' && overrideResumeText.trim()) return true;
  return [application?.resumeText, application?.coverLetter, application?.notes].some(
    (value) => Boolean(String(value || '').trim())
  );
};

const applySparseDataFallback = ({ result, application, jobDoc, hasRealContent }) => {
  if (Number(result?.matchScore || 0) > 0) return result;

  const hasResumeSignal = Boolean(String(application?.resumeName || '').trim() || String(application?.resumeUrl || '').trim());
  const sameRole = normalizeText(application?.jobTitle) === normalizeText(jobDoc?.title);

  if (!hasRealContent && sameRole) {
    return {
      matchScore: hasResumeSignal ? 35 : 25,
      matchedSkills: ['Role alignment'],
      missingSkills: Array.isArray(result?.missingSkills) ? result.missingSkills : []
    };
  }

  if (!hasRealContent && hasResumeSignal) {
    return {
      matchScore: 15,
      matchedSkills: Array.isArray(result?.matchedSkills) ? result.matchedSkills : [],
      missingSkills: Array.isArray(result?.missingSkills) ? result.missingSkills : []
    };
  }

  return result;
};

const runScreeningCore = async ({ requestedJobId = '', user, ipAddress }) => {
  const normalizedJobId = String(requestedJobId || '').trim();
  console.log('Screening job:', normalizedJobId || 'all');

  const query = normalizedJobId ? { job: normalizedJobId } : {};
  const applications = await Application.find(query)
    .populate('job', 'title company description requirements')
    .exec();

  let selectedJob = null;
  if (normalizedJobId) {
    selectedJob = await Job.findById(normalizedJobId)
      .select('title company description requirements')
      .lean();
  }

  // Include legacy rows in selected-job mode only when they have no job link and title matches selected job.
  let legacyApplications = [];
  if (normalizedJobId && selectedJob?.title) {
    const escapedTitle = selectedJob.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    legacyApplications = await Application.find({
      $or: [{ job: { $exists: false } }, { job: null }],
      jobTitle: { $regex: `^${escapedTitle}$`, $options: 'i' }
    }).exec();
  }

  const combinedApplications = [...applications, ...legacyApplications];

  if (!combinedApplications.length) {
    return { applications: [], updatedResults: [] };
  }

  const updatedResults = [];
  const jobByTitleCache = new Map();

  const resolveJobForApplication = async (application) => {
    if (application?.job && typeof application.job === 'object' && application.job.title) {
      return application.job;
    }

    const appTitle = String(application?.jobTitle || '').trim();
    if (!appTitle) return null;

    const key = titleKey(appTitle);
    if (jobByTitleCache.has(key)) {
      return jobByTitleCache.get(key);
    }

    const escapedTitle = appTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const resolved = await Job.findOne({ title: { $regex: `^${escapedTitle}$`, $options: 'i' } })
      .select('title company description requirements')
      .lean();

    jobByTitleCache.set(key, resolved || null);
    return resolved || null;
  };

  const screeningRuns = await Promise.allSettled(
    combinedApplications.map(async (application) => {
      const applicationJobId = toObjectIdString(application.job);
      console.log('Processing application:', application._id, 'Job:', applicationJobId || 'none');

      if (normalizedJobId && applicationJobId && applicationJobId !== normalizedJobId) {
        return;
      }

      const jobDoc = await resolveJobForApplication(application);
      if (!jobDoc) return;

      const resolvedJobId = toObjectIdString(jobDoc?._id || null);
      if (normalizedJobId && resolvedJobId && resolvedJobId !== normalizedJobId) return;

      const resumeText = buildCandidateResumeText(application);
      const jobContext = buildJobScreeningContext(jobDoc, application);
      const scored = screenResumeAgainstJob({
        resumeText,
        jobDescription: jobContext.jobDescription,
        jobRequirements: jobContext.jobRequirements
      });
      const result = applySparseDataFallback({
        result: scored,
        application,
        jobDoc,
        hasRealContent: hasRealResumeContent(application)
      });

      // Never modify job linkage in AI screening; update AI fields only.
      await Application.updateOne(
        { _id: application._id },
        {
          $set: {
            aiScore: result.matchScore,
            matchPercentage: result.matchScore,
            matchingSkills: result.matchedSkills,
            missingSkills: result.missingSkills,
            score: result.matchScore,
            updatedAt: new Date()
          }
        }
      );

      updatedResults.push({
        id: application._id,
        candidateName: application.candidateName,
        job: application.job,
        aiScore: result.matchScore,
        matchPercentage: result.matchScore,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills
      });
    })
  );

  const failedRuns = screeningRuns.filter((entry) => entry.status === 'rejected');
  if (failedRuns.length > 0) {
    console.error('[AI:screen] some applications failed during scoring', {
      failed: failedRuns.length,
      total: screeningRuns.length
    });
  }

  await logAction({
    userId: user.id,
    userName: user.name,
    action: 'update',
    resourceType: 'application',
    resourceId: normalizedJobId || 'all',
    resourceName: 'AI Screening Batch',
    details: {
      event: 'ai_screening_batch',
      jobId: normalizedJobId || 'all',
      processed: updatedResults.length
    },
    ipAddress
  });

  return { applications, updatedResults };
};

const screenOne = async (req, res) => {
  try {
    const { id } = req.params;
    const overrideResumeText = String(req.body?.resumeText || '');
    const requestedJobId = String(req.body?.jobId || '').trim();
    const application = await Application.findById(id).populate('job', 'title company description requirements');
    if (!application) {
      return failure(res, 'Application not found', { statusCode: 404, code: 'APPLICATION_NOT_FOUND' });
    }

    const applicationJobId = toObjectIdString(application.job);

    console.log('[AI:screenOne] screening payload', {
      applicationId: id,
      requestedJobId,
      applicationJobId
    });

    if (requestedJobId && applicationJobId !== requestedJobId) {
      return failure(res, 'Application does not belong to selected job', {
        statusCode: 400,
        code: 'APPLICATION_JOB_MISMATCH'
      });
    }

    const job = application.job;
    if (!job || typeof job !== 'object') {
      return failure(res, 'Job not found for this application', { statusCode: 404, code: 'JOB_NOT_FOUND' });
    }

    const resumeText = buildCandidateResumeText(application, overrideResumeText);
    const jobContext = buildJobScreeningContext(job, application);
    const scored = screenResumeAgainstJob({
      resumeText,
      jobDescription: jobContext.jobDescription,
      jobRequirements: jobContext.jobRequirements
    });
    const result = applySparseDataFallback({
      result: scored,
      application,
      jobDoc: job,
      hasRealContent: hasRealResumeContent(application, overrideResumeText)
    });

    await Application.updateOne(
      { _id: application._id },
      {
        $set: {
          ...(overrideResumeText.trim() ? { resumeText: overrideResumeText.trim() } : {}),
          aiScore: result.matchScore,
          matchPercentage: result.matchScore,
          matchingSkills: result.matchedSkills,
          missingSkills: result.missingSkills,
          score: result.matchScore,
          updatedAt: new Date()
        }
      }
    );
    const updated = await Application.findById(id).populate('job', 'title company').lean();

    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      action: 'update',
      resourceType: 'application',
      resourceId: id,
      resourceName: application.candidateName,
      details: { event: 'ai_screening', score: result.matchScore, matched: result.matchedSkills.length, missing: result.missingSkills.length },
      ipAddress: req.ip
    });

    return success(res, {
      application: updated,
      matchScore: result.matchScore,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills
    }, { message: 'AI screening completed' });
  } catch (error) {
    return failure(res, 'Failed to run AI screening', { statusCode: 500, code: 'AI_SCREENING_FAILED' });
  }
};

const screenApplications = async (req, res) => {
  try {
    const requestedJobId = String(req.body?.jobId || '').trim();
    if (requestedJobId) {
      const job = await Job.findById(requestedJobId).lean();
      if (!job) {
        return failure(res, 'Job not found', { statusCode: 404, code: 'JOB_NOT_FOUND' });
      }
    }

    const { updatedResults } = await runScreeningCore({
      requestedJobId,
      user: req.user,
      ipAddress: req.ip
    });

    if (!updatedResults.length) {
      return failure(res, 'No applications found', { statusCode: 404, code: 'APPLICATIONS_NOT_FOUND' });
    }

    return success(res, updatedResults.sort((a, b) => b.aiScore - a.aiScore), {
      message: `AI screening completed for ${updatedResults.length} applications`
    });
  } catch (error) {
    return failure(res, 'Failed to run AI screening', { statusCode: 500, code: 'AI_SCREENING_FAILED' });
  }
};

const screenByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId).lean();
    if (!job) {
      return failure(res, 'Job not found', { statusCode: 404, code: 'JOB_NOT_FOUND' });
    }

    console.log('[AI:screenByJob] filtering applications', {
      selectedJobId: String(jobId),
      selectedJobTitle: job.title
    });

    const { updatedResults } = await runScreeningCore({
      requestedJobId: String(jobId),
      user: req.user,
      ipAddress: req.ip
    });

    if (!updatedResults.length) {
      return failure(res, 'No applications found', { statusCode: 404, code: 'APPLICATIONS_NOT_FOUND' });
    }

    return success(res, updatedResults.sort((a, b) => b.aiScore - a.aiScore), {
      message: `AI screening completed for ${updatedResults.length} applications`
    });
  } catch (error) {
    return failure(res, 'Failed to run job screening', { statusCode: 500, code: 'AI_JOB_SCREENING_FAILED' });
  }
};

const compareResumeWithJob = async (req, res) => {
  try {
    const { resumeText = '', jobDescription = '', jobRequirements = [] } = req.body || {};

    const result = screenResumeAgainstJob({ resumeText, jobDescription, jobRequirements });
    return success(res, {
      matchScore: result.matchScore,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills
    });
  } catch (_error) {
    return failure(res, 'Failed to compare resume with job description', {
      statusCode: 500,
      code: 'AI_COMPARE_FAILED'
    });
  }
};

module.exports = { screenOne, screenByJob, screenApplications, compareResumeWithJob };
