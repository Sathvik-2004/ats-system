const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Configure dotenv
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🚀 ALTERNATIVE DEPLOYMENT - ATS Backend Starting');
console.log('📍 Platform: Vercel Alternative');
console.log('🔍 Environment check:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set ✅' : 'Missing ❌');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set ✅' : 'Missing ❌');

const app = express();

// Enable CORS for all origins (Vercel deployment)
app.use(cors({
  origin: ['https://ats-frontend-mu.vercel.app', 'http://localhost:3000', '*'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'Alternative ATS Backend is running!', 
    platform: 'Vercel Alternative',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// Import routes
const adminRoutes = require('./routes/admin');
const jobRoutes = require('./routes/jobRoutes');
const applicantRoutes = require('./routes/applicationRoutes');
const authRoutes = require('./routes/auth');

// Log incoming requests
app.use((req, res, next) => {
  console.log(`📩 ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Route registrations
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applicants', applicantRoutes);
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'ATS Backend Alternative - Deployed Successfully!',
    platform: 'Vercel Alternative', 
    status: 'running',
    endpoints: [
      '/api/health - Health check',
      '/api/jobs - Job listings',
      '/api/applicants/apply - Application submission (FIXED)',
      '/api/applicants/user - User applications',
      '/api/auth/login - User authentication'
    ]
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected to alternative deployment');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    // Don't exit process in serverless environment
  }
};

connectDB();

// For Vercel serverless
if (process.env.VERCEL) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Alternative backend running on port ${PORT}`);
  });
}