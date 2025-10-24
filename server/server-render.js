const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

console.log('🚨 RENDER EMERGENCY SERVER - Minimal Dependencies');

const app = express();
app.use(cors());
app.use(express.json());

// Simple logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applicants', require('./routes/applicationRoutes'));
app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// MongoDB connection with error handling
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ats', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  // Continue without database for testing
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});