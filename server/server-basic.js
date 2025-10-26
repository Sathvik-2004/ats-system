// ABSOLUTE MINIMAL SERVER FOR RENDER
const express = require('express');
const app = express();

console.log('🚀 BASIC SERVER STARTING...');

// Basic middleware
app.use(express.json());

// Allow CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  console.log('✅ Health check');
  res.json({ status: 'OK', time: new Date() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'ATS Basic Server Running', status: 'OK' });
});

// Basic application endpoint
app.post('/api/applicants/apply', (req, res) => {
  console.log('📝 Application received:', req.body);
  res.json({ 
    success: true, 
    message: 'Application received',
    data: req.body 
  });
});

// Test endpoint
app.post('/api/applicants/test-submit', (req, res) => {
  console.log('🧪 Test submission:', req.body);
  res.json({ success: true, test: 'working' });
});

// Add missing endpoints that frontend expects
app.get('/api/jobs', (req, res) => {
  console.log('📋 Jobs requested');
  res.json([
    { _id: 'test123', title: 'Sample Job', company: 'Test Company', description: 'Test job description' }
  ]);
});

app.post('/api/auth/user-login', (req, res) => {
  console.log('👤 User login attempt:', req.body);
  res.json({ message: 'Login endpoint (test mode)', user: null });
});

app.post('/api/auth/admin-login', (req, res) => {
  console.log('👨‍💼 Admin login attempt:', req.body);
  res.json({ message: 'Admin login endpoint (test mode)', admin: null });
});

app.get('/api/auth/my-applications', (req, res) => {
  console.log('📋 My applications requested');
  res.json([]);
});

app.get('/api/auth/application-stats', (req, res) => {
  console.log('📊 Application stats requested');
  res.json({ total: 0, pending: 0, approved: 0, rejected: 0 });
});

// Catch all API routes
app.use('/api/*', (req, res) => {
  console.log(`❓ Unknown API route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Endpoint not found (basic server mode)',
    method: req.method,
    path: req.originalUrl 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Basic server running on port ${PORT}`);
});