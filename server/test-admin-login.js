const axios = require('axios');

console.log('🧪 Testing admin login...');

const testAdminLogin = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/admin/login', {
      username: 'admin',
      password: 'ksreddy@2004'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', response.data.token);
    
    // Test with the token
    const appsResponse = await axios.get('http://localhost:5000/api/admin/applications', {
      headers: {
        Authorization: `Bearer ${response.data.token}`
      }
    });
    
    console.log('✅ Applications fetched:', appsResponse.data.length);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testAdminLogin();
