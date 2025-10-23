const axios = require('axios');

const testUserApplications = async () => {
  try {
    console.log('🔐 Testing user login and applications...');
    
    // Step 1: Login to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/user-login', {
      email: 'sathwikreddy9228@gmail.com',
      password: 'password123' // Assuming this is the password, adjust if needed
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.token;
      
      // Step 2: Get user applications
      const applicationsResponse = await axios.get('http://localhost:5000/api/auth/my-applications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('\n📋 User Applications:');
      console.log(`Found: ${applicationsResponse.data.applications.length} applications`);
      
      applicationsResponse.data.applications.forEach((app, index) => {
        console.log(`\n${index + 1}. ${app.jobTitle}`);
        console.log(`   Company: ${app.company}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Applied: ${new Date(app.appliedAt).toLocaleDateString()}`);
      });

      // Step 3: Get application stats
      const statsResponse = await axios.get('http://localhost:5000/api/auth/application-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('\n📊 Application Statistics:');
      console.log(statsResponse.data.stats);

    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }

  } catch (error) {
    console.error('💥 Error:', error.response?.data || error.message);
  }
};

testUserApplications();