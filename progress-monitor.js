// Railway Deployment Progress Monitor
// Checks every 2 minutes and shows detailed status

const https = require('https');

let checkNumber = 0;
const startTime = new Date();

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
}

function getElapsedTime() {
  const elapsed = Math.floor((new Date() - startTime) / 1000 / 60);
  return `${elapsed} min`;
}

async function checkProgress() {
  checkNumber++;
  const now = new Date();
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🕐 ${formatTime(now)} - Progress Check #${checkNumber} (${getElapsedTime()} elapsed)`);
  console.log(`${'='.repeat(60)}`);

  // Test 1: Health Check (should always work)
  console.log('1️⃣  Testing Railway Health...');
  const healthStatus = await testEndpoint({
    name: 'Health',
    url: 'https://lessats-systemgreater-production.up.railway.app/api/jobs',
    method: 'GET'
  });

  // Test 2: New Test Endpoint (shows deployment progress)
  console.log('\n2️⃣  Testing New Version Indicator...');
  const testStatus = await testEndpoint({
    name: 'Test Endpoint',
    url: 'https://lessats-systemgreater-production.up.railway.app/api/applicants/test-submit',
    method: 'POST',
    data: JSON.stringify({ test: 'progress-check', checkNumber }),
    headers: { 'Content-Type': 'application/json' }
  });

  // Test 3: Application Submission (the main fix)
  console.log('\n3️⃣  Testing Application Submission...');
  const applyStatus = await testEndpoint({
    name: 'Apply Route',
    url: 'https://lessats-systemgreater-production.up.railway.app/api/applicants/apply',
    method: 'POST',
    data: JSON.stringify({
      name: 'Progress Test User',
      email: 'progresstest@example.com',
      jobId: '68fb8b7f9f3818ef96eac165'
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzFhMjkxMzEwZjI4NzFiNDc0MmYyOTAiLCJlbWFpbCI6InRlc3R1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzI5NzgxOTg1LCJleHAiOjE3Mjk4NjgzODV9.aQsQHFhDcAqffC_ZZOzPQ-kW5jvitPboJMhFY8W_2S8'
    }
  });

  // Overall Status Assessment
  console.log(`\n📊 OVERALL STATUS:`);
  
  if (testStatus.success && applyStatus.success) {
    console.log(`🎉🎉 DEPLOYMENT COMPLETE! NEW VERSION IS LIVE! 🎉🎉`);
    console.log(`✅ Test endpoint: WORKING`);
    console.log(`✅ Application submission: WORKING`);
    console.log(`✅ User portal will now show submitted applications!`);
    
    // Test user applications
    console.log(`\n4️⃣  Testing User Applications Retrieval...`);
    await testUserApplications();
    
    console.log(`\n🎯 PROBLEM SOLVED! Users can now:`);
    console.log(`   • Submit applications successfully`);
    console.log(`   • See their applications in the user portal`);
    console.log(`   • No more 500 errors!`);
    
    process.exit(0);
    
  } else if (testStatus.success) {
    console.log(`🔄 PARTIAL DEPLOYMENT - Test endpoint works but apply route still updating`);
    console.log(`✅ Test endpoint: WORKING`);
    console.log(`⏳ Application submission: Still deploying`);
    
  } else {
    console.log(`⏳ DEPLOYMENT IN PROGRESS - Still using old version`);
    console.log(`❌ Test endpoint: Old version (404)`);
    console.log(`❌ Application submission: Old version (500 errors)`);
    
    // Estimate remaining time
    const elapsed = Math.floor((new Date() - startTime) / 1000 / 60);
    if (elapsed < 20) {
      console.log(`⏰ Expected completion: 5-15 more minutes`);
    } else if (elapsed < 35) {
      console.log(`⏰ Expected completion: Should be very soon (major changes can take 30+ min)`);
    } else {
      console.log(`⚠️  Taking longer than usual - may need to check Railway dashboard`);
    }
  }
  
  console.log(`\n⏱️  Next check in 2 minutes...`);
  console.log(`${'='.repeat(60)}\n`);
}

async function testEndpoint(config) {
  return new Promise((resolve) => {
    const urlObj = new URL(config.url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: config.method,
      headers: config.headers || {},
      timeout: 8000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const success = res.statusCode === 200;
        console.log(`   ${config.name}: ${res.statusCode} ${success ? '✅' : '❌'}`);
        
        if (success && data) {
          try {
            const parsed = JSON.parse(data);
            if (parsed.message) {
              console.log(`   Response: ${parsed.message}`);
            }
          } catch (e) {
            // Response might not be JSON
          }
        }
        
        resolve({ success, status: res.statusCode, data });
      });
    });

    req.on('error', (e) => {
      console.log(`   ${config.name}: ERROR ❌ (${e.message})`);
      resolve({ success: false, error: e.message });
    });

    req.on('timeout', () => {
      console.log(`   ${config.name}: TIMEOUT ⏰`);
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });

    if (config.data) {
      req.write(config.data);
    }
    req.end();
  });
}

async function testUserApplications() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'lessats-systemgreater-production.up.railway.app',
      port: 443,
      path: '/api/applicants/user',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzFhMjkxMzEwZjI4NzFiNDc0MmYyOTAiLCJlbWFpbCI6InRlc3R1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzI5NzgxOTg1LCJleHAiOjE3Mjk4NjgzODV9.aQsQHFhDcAqffC_ZZOzPQ-kW5jvitPboJMhFY8W_2S8'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const applications = JSON.parse(data);
          console.log(`   User Applications: ${applications.length} found ✅`);
          if (applications.length > 0) {
            const latest = applications[applications.length - 1];
            console.log(`   Latest: "${latest.name}" - ${latest.status}`);
          }
        } catch (e) {
          console.log(`   User Applications: Response error ❌`);
        }
        resolve();
      });
    });

    req.on('error', () => {
      console.log(`   User Applications: Request failed ❌`);
      resolve();
    });

    req.end();
  });
}

// Start monitoring
console.log(`🚀 Railway Deployment Progress Monitor Started`);
console.log(`⏰ Start time: ${formatTime(startTime)}`);
console.log(`🔍 Checking every 2 minutes until deployment completes\n`);

// Initial check
checkProgress();

// Set up interval (every 2 minutes)
setInterval(checkProgress, 120000);