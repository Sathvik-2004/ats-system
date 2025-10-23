const axios = require('axios');

console.log('🧪 Testing server connectivity...');

// Simple server test
axios.get('http://localhost:5000')
  .then(response => {
    console.log('✅ Server is responding');
    console.log('Response status:', response.status);
  })
  .catch(error => {
    console.log('❌ Server connectivity error:');
    console.log('Code:', error.code);
    console.log('Message:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  });