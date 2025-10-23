const axios = require('axios');

async function quickTest() {
  try {
    // Test if server is running
    console.log('Testing server connectivity...');
    
    const response = await axios.get('http://localhost:5000/api/admin/ping');
    console.log('✅ Server is running and accessible');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Server connectivity test failed');
    console.log('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Server is not running. Please start the server first.');
    }
  }
}

quickTest();