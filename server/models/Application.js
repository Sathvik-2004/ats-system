const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    alias: 'jobId'
  },
  candidateName: String,
  candidateEmail: String,
  phone: String,
  jobTitle: String,
  status: {
    type: String,
    enum: ['applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'selected', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  resumeUrl: String,
  resumeName: String,
  resumeText: String,
  coverLetter: String,
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  aiScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  matchPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  matchingSkills: [String],
  missingSkills: [String],
  interviewScheduled: {
    date: Date,
    time: String,
    mode: {
      type: String,
      enum: ['online', 'in-person'],
      default: 'online'
    },
    interviewLink: String,
    notes: String
  },
  notes: String,
  statusHistory: [
    {
      fromStatus: {
        type: String,
        enum: ['applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'selected', 'rejected', 'withdrawn', null],
        default: null
      },
      toStatus: {
        type: String,
        enum: ['applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'selected', 'rejected', 'withdrawn'],
        required: true
      },
      comment: {
        type: String,
        default: ''
      },
      changedBy: {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        name: String,
        role: String
      },
      changedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ApplicationSchema.index({ candidateEmail: 1, createdAt: -1 });
ApplicationSchema.index({ status: 1, createdAt: -1 });
ApplicationSchema.index({ job: 1, createdAt: -1 });

module.exports = mongoose.model('Application', ApplicationSchema);
