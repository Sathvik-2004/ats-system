const axios = require('axios');

const testRegistration = async () => {
  try {
    console.log('Testing registration API...');
    
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('✅ Registration successful:', response.data);
  } catch (error) {
    console.log('❌ Registration failed:', error.response?.data || error.message);
  }
};

const testAuthRoutes = async () => {
  try {
    console.log('Testing auth routes...');
    
    const response = await axios.get('http://localhost:5000/api/auth/test');
    console.log('✅ Auth routes working:', response.data);
  } catch (error) {
    console.log('❌ Auth routes not working:', error.response?.data || error.message);
  }
};

// Run tests
testAuthRoutes();
setTimeout(() => testRegistration(), 1000);