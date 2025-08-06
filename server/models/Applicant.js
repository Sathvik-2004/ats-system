// server/models/Applicant.js
const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  name: String,
  email: String,
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  resume: String,
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Applicant', applicantSchema);
