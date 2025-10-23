const axios = require('axios');

const testAutoProcess = async () => {
  try {
    console.log('🤖 Testing auto-processing API...');
    
    // We need an admin token for this
    const loginResponse = await axios.post('http://localhost:5000/api/admin/login', {
      username: 'admin',
      password: 'ksreddy@2004'
    });

    if (loginResponse.data.token) {
      console.log('✅ Admin login successful');
      const adminToken = loginResponse.data.token;
      
      // Now test auto-processing
      const processResponse = await axios.post('http://localhost:5000/api/applicants/auto-process', {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      console.log('\n🎯 Auto-processing results:');
      console.log('Message:', processResponse.data.message);
      console.log('Processed Count:', processResponse.data.processedCount);
      console.log('Statistics:', processResponse.data.statistics);
      
      if (processResponse.data.processedApplicants && processResponse.data.processedApplicants.length > 0) {
        console.log('\n📋 Processed Applications:');
        processResponse.data.processedApplicants.forEach((app, index) => {
          console.log(`${index + 1}. ${app.name} - ${app.status}`);
          console.log(`   Reason: ${app.processingReason || 'No reason provided'}`);
        });
      }
    } else {
      console.log('❌ Admin login failed');
    }

  } catch (error) {
    console.error('💥 Error:', error.response?.data || error.message);
  }
};

testAutoProcess();