const jwt = require('jsonwebtoken');
require('dotenv').config();

// Test JWT token creation and verification
const testToken = () => {
  try {
    // Create a test token for the user with applications
    const testUserId = '68d6aee9650416c385bc0f5b';
    const testEmail = 'sathwikreddy9228@gmail.com';
    
    const token = jwt.sign(
      { 
        userId: testUserId, 
        email: testEmail, 
        role: 'user' 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
    
    console.log('🔑 Generated test token:', token);
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    console.log('✅ Decoded token:', decoded);
    
    console.log('\n📋 To test the application:');
    console.log('1. Open browser developer tools');
    console.log('2. Go to localStorage');
    console.log('3. Set token:', token);
    console.log('4. Set userData:', JSON.stringify({
      id: testUserId,
      name: 'k. sathvik reddy',
      email: testEmail,
      role: 'user'
    }));
    
  } catch (error) {
    console.error('❌ Token error:', error);
  }
};

testToken();