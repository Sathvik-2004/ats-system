const express = require('express');
const cors = require('cors');

console.log('🚀 RENDER ULTRA MINIMAL SERVER - Starting...');

const app = express();

// Basic middleware
app.use(cors({
  origin: ['https://ats-client-three.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Simple logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Ultra-minimal routes without database dependencies
app.get('/health', (req, res) => {
  console.log('✅ Health check requested');
  res.status(200).json({ 
    status: 'OK', 
    server: 'Render Ultra Minimal',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test application submission
app.post('/api/applicants/apply', (req, res) => {
  try {
    console.log('✅ Application received:', req.body);
    const { name, email, jobId } = req.body;
    
    if (!name || !email || !jobId) {
      return res.status(400).json({ error: 'Missing required fields: name, email, jobId' });
    }
    
    // Success response (no database for now)
    res.status(200).json({ 
      message: 'Application submitted successfully (test mode)',
      data: { name, email, jobId },
      applicationId: 'test-' + Date.now(),
      success: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Application error:', error);
    res.status(500).json({ 
      error: 'Submission failed',
      details: error.message 
    });
  }
});

// Test endpoint
app.post('/api/applicants/test-submit', (req, res) => {
  console.log('✅ Test submission:', req.body);
  res.status(200).json({ 
    message: 'Test successful',
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

// Get applications (placeholder)
app.get('/api/applicants', (req, res) => {
  res.status(200).json({ 
    message: 'Applications endpoint working',
    applications: [],
    count: 0
  });
});

// Catch all other routes
app.use('*', (req, res) => {
  console.log(`❓ Unknown route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    path: req.originalUrl,
    available: ['/health', '/api/applicants/apply', '/api/applicants/test-submit']
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 RENDER ULTRA MINIMAL SERVER RUNNING`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔗 Health: /health`);
  console.log(`📝 Apply: /api/applicants/apply`);
  console.log(`✅ Server successfully started!`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  process.exit(0);
});