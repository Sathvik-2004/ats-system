// Continuous deployment monitor - checks every 20 seconds
const https = require('https');

let checkCount = 0;

async function quickTest() {
    checkCount++;
    const timestamp = new Date().toLocaleTimeString();
    
    console.log(`\n⏰ ${timestamp} - Check #${checkCount}`);
    
    // Test 1: Basic health check
    await testEndpoint({
        name: 'Health Check',
        url: 'https://lessats-systemgreater-production.up.railway.app/api/jobs',
        method: 'GET'
    });
    
    // Test 2: New test endpoint (shows if deployment completed)
    await testEndpoint({
        name: 'New Test Endpoint',
        url: 'https://lessats-systemgreater-production.up.railway.app/api/applicants/test-submit',
        method: 'POST',
        data: JSON.stringify({test: 'check'}),
        headers: {'Content-Type': 'application/json'}
    });
    
    console.log('---');
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
            timeout: 5000
        };

        const req = https.request(options, (res) => {
            console.log(`${config.name}: ${res.statusCode} ${res.statusCode === 200 ? '✅' : res.statusCode === 404 ? '⏳' : '❌'}`);
            
            if (res.statusCode === 200 && config.name === 'New Test Endpoint') {
                console.log('\n🎉 DEPLOYMENT COMPLETE! Testing application submission...');
                testApplicationSubmission();
            }
            
            resolve();
        });

        req.on('error', () => {
            console.log(`${config.name}: ERROR ❌`);
            resolve();
        });

        req.on('timeout', () => {
            console.log(`${config.name}: TIMEOUT ⏰`);
            req.destroy();
            resolve();
        });

        if (config.data) req.write(config.data);
        req.end();
    });
}

async function testApplicationSubmission() {
    console.log('\n🧪 Testing FIXED application submission...');
    
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
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`\n🚀 APPLICATION SUBMISSION RESULT:`);
            console.log(`Status: ${res.statusCode}`);
            try {
                const parsed = JSON.parse(data);
                console.log('Response:', JSON.stringify(parsed, null, 2));
                
                if (res.statusCode === 200) {
                    console.log('\n🎉🎉 SUCCESS! APPLICATION SUBMISSION IS NOW WORKING! 🎉🎉');
                    console.log('✅ Users can now submit applications and they will appear in their portal!');
                    
                    // Test user applications
                    testUserApplications();
                } else {
                    console.log('\n❌ Still having issues, but this gives us better error info');
                }
            } catch (e) {
                console.log('Raw response:', data);
            }
        });
    });

    req.on('error', e => console.log('Error:', e.message));

    req.write(JSON.stringify({
        name: 'FINAL TEST USER',
        email: 'finaltest@example.com',
        jobId: '68fb8b7f9f3818ef96eac165'
    }));
    req.end();
}

async function testUserApplications() {
    console.log('\n📋 Testing user applications retrieval...');
    
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
                const parsed = JSON.parse(data);
                console.log(`✅ User has ${parsed.length} applications`);
                if (parsed.length > 0) {
                    console.log('📄 Latest application:', {
                        name: parsed[0].name,
                        email: parsed[0].email,
                        status: parsed[0].status,
                        submittedAt: parsed[0].appliedAt
                    });
                    console.log('\n🎯 PROBLEM SOLVED! Applications now appear in user portal!');
                }
            } catch (e) {
                console.log('User applications response:', data);
            }
        });
    });

    req.end();
}

// Start monitoring
console.log('🔍 Starting continuous Railway deployment monitor...');
console.log('Will check every 20 seconds until deployment completes\n');

setInterval(quickTest, 20000);
quickTest(); // Initial check