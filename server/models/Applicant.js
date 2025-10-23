// server/models/Applicant.js
const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  name: String,
  email: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for backward compatibility
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  resume: String,
  appliedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Interview Scheduled', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  notes: {
    type: String,
    default: ''
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Applicant', applicantSchema);
