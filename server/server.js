const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const adminRoutes = require('./routes/admin');
const jobRoutes = require('./routes/jobRoutes');
const applicantRoutes = require('./routes/applicationRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`📩 ${req.method} ${req.url}`);
  next();
});

// Route registrations (✅ ONLY ONCE)
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applicants', applicantRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
