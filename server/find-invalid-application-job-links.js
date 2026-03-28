/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const Application = require('./models/Application');
const Job = require('./models/Job');

const connect = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is required in environment variables');
  }
  await mongoose.connect(mongoUri);
};

const run = async () => {
  await connect();

  const invalidStructure = await Application.find({
    $or: [
      { job: { $exists: false } },
      { job: null },
      { job: { $type: 'string' } }
    ]
  })
    .select('_id candidateName candidateEmail job jobTitle createdAt')
    .lean();

  const linkedApplications = await Application.find({
    job: { $exists: true, $ne: null, $type: 'objectId' }
  })
    .select('_id candidateName candidateEmail job jobTitle createdAt')
    .lean();

  const jobIds = Array.from(new Set(linkedApplications.map((app) => String(app.job))));
  const existingJobs = await Job.find({ _id: { $in: jobIds } }).select('_id').lean();
  const existingJobIdSet = new Set(existingJobs.map((job) => String(job._id)));

  const brokenReferences = linkedApplications.filter((app) => !existingJobIdSet.has(String(app.job)));

  console.log('=== Application Job Link Audit ===');
  console.log(`Invalid structure records: ${invalidStructure.length}`);
  console.log(`Broken job references: ${brokenReferences.length}`);

  if (invalidStructure.length > 0) {
    console.log('\n--- Invalid Structure Records ---');
    invalidStructure.forEach((app) => {
      console.log(
        JSON.stringify(
          {
            _id: app._id,
            candidateName: app.candidateName,
            candidateEmail: app.candidateEmail,
            job: app.job,
            jobTitle: app.jobTitle,
            createdAt: app.createdAt
          },
          null,
          2
        )
      );
    });
  }

  if (brokenReferences.length > 0) {
    console.log('\n--- Broken Job Reference Records ---');
    brokenReferences.forEach((app) => {
      console.log(
        JSON.stringify(
          {
            _id: app._id,
            candidateName: app.candidateName,
            candidateEmail: app.candidateEmail,
            job: app.job,
            jobTitle: app.jobTitle,
            createdAt: app.createdAt
          },
          null,
          2
        )
      );
    });
  }

  if (invalidStructure.length === 0 && brokenReferences.length === 0) {
    console.log('No invalid job linkage records found.');
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Failed to audit application job links:', error.message);
  try {
    await mongoose.disconnect();
  } catch (_error) {
    // Ignore disconnect errors in failure path.
  }
  process.exit(1);
});
