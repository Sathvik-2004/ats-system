const jwt = require('jsonwebtoken');

// Generate a new token for the test user
const userData = {
  userId: '68d6aee9650416c385bc0f5b',
  email: 'sathwikreddy9228@gmail.com',
  role: 'user'
};

require('dotenv').config();
const token = jwt.sign(userData, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

console.log('🔑 New Token Generated:');
console.log(token);
console.log('\n📋 Copy this token to replace the expired one in App.js');