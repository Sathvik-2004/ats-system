const axios = require('axios');

async function testSettingsAPI() {
  try {
    console.log('🧪 Testing Settings API...\n');

    // 1. Test admin login first
    console.log('1. 📝 Testing admin login...');
    const loginResponse = await axios.post('http://localhost:5000/api/admin/login', {
      username: 'admin',
      password: 'ksreddy@2004'
    });
    
    if (loginResponse.data.token) {
      console.log('   ✅ Admin login successful');
      const token = loginResponse.data.token;

      // 2. Test settings endpoint
      console.log('\n2. 📊 Testing settings endpoint...');
      const settingsResponse = await axios.get('http://localhost:5000/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('   ✅ Settings endpoint working');
      console.log('   📋 Settings data:', JSON.stringify(settingsResponse.data, null, 2));
      
    } else {
      console.log('   ❌ Admin login failed');
    }

  } catch (error) {
    console.error('❌ API test failed:');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received');
    }
  }
}

testSettingsAPI();