const axios = require('axios');

// Test the auto-processing with enhanced scoring
async function testAutoProcessing() {
  try {
    console.log('🔄 Testing Auto-Processing with Enhanced Scoring...');
    
    // First, login as admin to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/admin-login', {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    
    const adminToken = loginResponse.data.token;
    console.log(`✅ Admin logged in successfully`);
    
    // Test auto-processing
    const autoProcessResponse = await axios.post(
      'http://localhost:5000/api/applications/auto-process',
      {},
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n📊 Auto-Processing Results:');
    console.log(`Total applications processed: ${autoProcessResponse.data.processed}`);
    console.log(`Applications updated: ${autoProcessResponse.data.updated}`);
    console.log('\n📋 Detailed Results:');
    
    if (autoProcessResponse.data.results && autoProcessResponse.data.results.length > 0) {
      autoProcessResponse.data.results.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.name} (${result.email})`);
        console.log(`   Job: ${result.jobTitle}`);
        console.log(`   Status: ${result.oldStatus} → ${result.newStatus}`);
        console.log(`   Reason: ${result.reason}`);
      });
    } else {
      console.log('No applications were processed (all may already be in final states)');
    }
    
    // Fetch all applications to see current status
    const allAppsResponse = await axios.get('http://localhost:5000/api/applications', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('\n📈 Current Application Status Summary:');
    const statusCounts = {};
    allAppsResponse.data.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} applications`);
    });
    
  } catch (error) {
    console.error('❌ Error testing auto-processing:', error.response?.data || error.message);
  }
}

testAutoProcessing();