const axios = require('axios');

const testAdminLogin = async () => {
  try {
    console.log('🔍 Testing admin login...');
    
    const response = await axios.post('http://localhost:5000/api/admin/login', {
      username: 'admin',
      password: 'ksreddy@2004'
    });
    
    console.log('✅ Admin login successful:', response.data);
    const adminToken = response.data.token;
    
    // Test fetching applicants with admin token
    console.log('🔍 Testing applicants fetch with admin token...');
    const applicantsResponse = await axios.get('http://localhost:5000/api/applicants', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`✅ Successfully fetched ${applicantsResponse.data.length} applicants`);
    console.log('📋 Sample applicant:', applicantsResponse.data[0]);
    
  } catch (error) {
    console.error('❌ Error testing admin functionality:', error.response?.data || error.message);
  }
};

testAdminLogin();