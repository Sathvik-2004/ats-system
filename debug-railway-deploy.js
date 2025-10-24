// Debug script to test Railway deployment
const https = require('https');

const testEndpoints = [
  {
    name: 'Health Check (Jobs)',
    url: 'https://lessats-systemgreater-production.up.railway.app/api/jobs',
    method: 'GET'
  },
  {
    name: 'Test Submit (New)',
    url: 'https://lessats-systemgreater-production.up.railway.app/api/applicants/test-submit',
    method: 'POST',
    data: JSON.stringify({test: 'deployment'}),
    headers: {'Content-Type': 'application/json'}
  },
  {
    name: 'Apply Route (Modified)',
    url: 'https://lessats-systemgreater-production.up.railway.app/api/applicants/apply',
    method: 'POST',
    data: JSON.stringify({
      name: 'Debug Test User',
      email: 'debugtest@example.com', 
      jobId: '68fb8b7f9f3818ef96eac165'
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzFhMjkxMzEwZjI4NzFiNDc0MmYyOTAiLCJlbWFpbCI6InRlc3R1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzI5NzgxOTg1LCJleHAiOjE3Mjk4NjgzODV9.aQsQHFhDcAqffC_ZZOzPQ-kW5jvitPboJMhFY8W_2S8'
    }
  }
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing: ${endpoint.name}`);
    console.log(`   URL: ${endpoint.url}`);
    
    const urlObj = new URL(endpoint.url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: endpoint.method,
      headers: endpoint.headers || {}
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        try {
          const parsed = JSON.parse(data);
          console.log(`   Response: ${JSON.stringify(parsed, null, 2)}`);
        } catch (e) {
          console.log(`   Response (raw): ${data.substring(0, 200)}...`);
        }
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (e) => {
      console.log(`   Error: ${e.message}`);
      resolve({ error: e.message });
    });

    if (endpoint.data) {
      req.write(endpoint.data);
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Testing Railway deployment...\n');
  
  for (const endpoint of testEndpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between tests
  }
  
  console.log('\n✅ Tests completed');
}

runTests();