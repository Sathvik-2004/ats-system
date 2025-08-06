// server/routes/jobRoutes.js
const express = require("express");
const router = express.Router();
const Job = require("../models/Job");

// ✅ Add a new job — POST /api/jobs/add
router.post('/add', async (req, res) => {
  try {
    const {
      title,
      company,
      salary,
      location,
      experience,
      jobType,
      description
    } = req.body;

    const job = new Job({
      title,
      company,
      salary,
      location,
      experience,
      jobType,
      description
    });

    await job.save();
    res.status(201).json({ message: '✅ Job added successfully', job });
  } catch (error) {
    console.error('❌ Error adding job:', error.message);
    res.status(500).json({ error: 'Failed to add job' });
  }
});

// GET /api/jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: "failed to fetch jobs" });
  }
});

module.exports = router;
