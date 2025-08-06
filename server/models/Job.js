const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  salary: { type: Number, required: true },
  location: { type: String, required: true },
  experience: { type: String, required: true },
  jobType: { type: String, required: true },  // e.g., Full-time, Part-time
  description: { type: String },
  postedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
