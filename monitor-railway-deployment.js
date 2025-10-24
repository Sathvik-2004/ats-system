// Auto-monitor Railway deployment
const https = require('https');

let attempts = 0;
const maxAttempts = 20; // Test for ~10 minutes

async function checkDeployment() {
  attempts++;
  console.log(`\n🔍 Deployment check #${attempts}/${maxAttempts}`);
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'lessats-systemgreater-production.up.railway.app',
      port: 443,
      path: '/api/applicants/test-submit',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ NEW VERSION DEPLOYED! Test endpoint is working');
        testApplicationSubmission();
        resolve(true);
      } else if (res.statusCode === 404) {
        console.log('⏳ Still old version (404 on test-submit)');
        resolve(false);
      } else {
        console.log(`🤔 Unexpected status: ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', (e) => {
      console.log(`❌ Connection error: ${e.message}`);
      resolve(false);
    });

    req.write(JSON.stringify({test: 'deployment'}));
    req.end();
  });
}

async function testApplicationSubmission() {
  console.log('\n🧪 Testing application submission with new version...');
  
  const options = {
    hostname: 'lessats-systemgreater-production.up.railway.app',
    port: 443,
    path: '/api/applicants/apply',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzFhMjkxMzEwZjI4NzFiNDc0MmYyOTAiLCJlbWFpbCI6InRlc3R1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzI5NzgxOTg1LCJleHAiOjE3Mjk4NjgzODV9.aQsQHFhDcAqffC_ZZOzPQ-kW5jvitPboJMhFY8W_2S8'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`Application submit status: ${res.statusCode}`);
      try {
        const parsed = JSON.parse(data);
        console.log('Response:', JSON.stringify(parsed, null, 2));
        
        if (res.statusCode === 200) {
          console.log('\n🎉 SUCCESS! Application submission is now working!');
          console.log('📋 User can now submit applications and they will appear in their portal');
        }
      } catch (e) {
        console.log('Response (raw):', data);
      }
    });
  });

  req.on('error', (e) => {
    console.log(`Error: ${e.message}`);
  });

  req.write(JSON.stringify({
    name: 'Final Test User',
    email: 'finaltest@example.com',
    jobId: '68fb8b7f9f3818ef96eac165'
  }));
  req.end();
}

async function monitor() {
  console.log('🚀 Monitoring Railway deployment...');
  console.log('Will check every 30 seconds until new version is deployed\n');
  
  const interval = setInterval(async () => {
    const isDeployed = await checkDeployment();
    
    if (isDeployed || attempts >= maxAttempts) {
      clearInterval(interval);
      if (!isDeployed) {
        console.log('\n⏰ Max attempts reached. Railway might need more time to deploy.');
        console.log('You can run this script again later or test manually.');
      }
    }
  }, 30000); // Check every 30 seconds
  
  // Initial check
  const isDeployed = await checkDeployment();
  if (isDeployed) {
    clearInterval(interval);
  }
}

monitor();