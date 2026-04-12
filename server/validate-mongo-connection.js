#!/usr/bin/env node

/**
 * MongoDB Connection Validator
 * Tests MONGO_URI before deploying to Render
 * 
 * Usage:
 *   node validate-mongo-connection.js
 *   MONGO_URI="mongodb+srv://user:pass@cluster/db" node validate-mongo-connection.js
 */

const mongoose = require('mongoose');

async function validateConnection() {
  const mongoUri = process.env.MONGO_URI;

  console.log('\n🔍 MongoDB Connection Validator\n');
  console.log('=' .repeat(60));

  // Step 1: Check if MONGO_URI is set
  if (!mongoUri) {
    console.error('❌ MONGO_URI is not set in environment variables');
    console.error('\n   Set it using:');
    console.error('   Windows (PowerShell): $env:MONGO_URI = "mongodb+srv://..."');
    console.error('   macOS/Linux:          export MONGO_URI="mongodb+srv://..."');
    console.error('\n   Or pass it directly:');
    console.error('   MONGO_URI="..." node validate-mongo-connection.js\n');
    process.exit(1);
  }

  console.log('✅ MONGO_URI found');
  console.log('\n📋 Validating Connection String Format...\n');

  // Step 2: Validate format
  const formatChecks = [];

  // Check protocol
  if (mongoUri.startsWith('mongodb+srv://')) {
    formatChecks.push(['✅', 'Using mongodb+srv:// (Atlas)']);
  } else if (mongoUri.startsWith('mongodb://')) {
    formatChecks.push(['✅', 'Using mongodb:// (Local)']);
  } else {
    formatChecks.push(['❌', 'Invalid protocol (must be mongodb:// or mongodb+srv://)']);
  }

  // Check for username:password
  const afterProtocol = mongoUri.split('://')[1];
  if (afterProtocol && afterProtocol.includes('@')) {
    const credentials = afterProtocol.split('@')[0];
    const [username, password] = credentials.split(':');
    if (username && password) {
      formatChecks.push(['✅', `Has credentials (user: ${username})`]);
    } else {
      formatChecks.push(['❌', 'Credentials present but incomplete (missing username or password)']);
    }
  } else {
    formatChecks.push(['❌', 'Missing credentials (username:password)']);
  }

  // Check for host
  if (afterProtocol && afterProtocol.includes('@')) {
    const host = afterProtocol.split('@')[1];
    if (host) {
      formatChecks.push(['✅', 'Has host information']);
    }
  }

  // Check for database name
  if (mongoUri.includes('/') && !mongoUri.endsWith('/')) {
    const pathPart = mongoUri.split('/')[-1];
    if (pathPart && pathPart.length > 0) {
      formatChecks.push(['✅', 'Has database name']);
    }
  }

  // Print format checks
  formatChecks.forEach(([icon, message]) => {
    console.log(`   ${icon}  ${message}`);
  });

  // Step 3: Test actual connection
  console.log('\n🔗 Testing Connection to MongoDB...\n');

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4 // Use IPv4, skip IPv6 as some networks block it
    });

    console.log('✅ Connection successful!\n');
    console.log('   Database Name:', mongoose.connection.name);
    console.log('   Database Host:', mongoose.connection.host);
    console.log('   Database Port:', mongoose.connection.port);
    console.log('   Connection State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');

    // Try a simple operation
    console.log('\n🧪 Testing Database Operations...\n');
    
    const testCollection = mongoose.connection.collection('test_connection');
    const result = await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('   ✅ Insert operation successful');
    
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('   ✅ Delete operation successful');

    console.log('\n✅ All tests passed! Your MongoDB connection is working.\n');
    console.log('You can now safely deploy to Render with this MONGO_URI.\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Connection Failed\n');
    console.error('   Error Type:', error.name);
    console.error('   Error Message:', error.message);

    // Provide specific guidance based on error type
    console.error('\n💡 Troubleshooting Tips:\n');

    if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
      console.error('   This is an AUTHENTICATION ERROR (bad username/password)');
      console.error('   • Check username and password in MONGO_URI');
      console.error('   • Verify the user exists in MongoDB Atlas Database Access');
      console.error('   • Ensure the user has "readWriteAnyDatabase" or "Atlas Admin" role');
      console.error('   • Note: Do NOT URL-encode special characters in password');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('   This is a NETWORK ERROR (connection refused)');
      console.error('   • Check if MongoDB Atlas cluster is running');
      console.error('   • Verify Network Access: Add 0.0.0.0/0 to whitelist in MongoDB Atlas');
      console.error('   • Check your firewall/VPN settings');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('   This is a DNS ERROR (host not found)');
      console.error('   • Check if the cluster URL is correct');
      console.error('   • Copy the connection string directly from MongoDB Atlas');
      console.error('   • Verify no typos in the connection string');
    } else if (error.message.includes('Timeout')) {
      console.error('   This is a TIMEOUT ERROR (connection took too long)');
      console.error('   • Check MongoDB Atlas Network Access whitelist');
      console.error('   • Ensure your IP is whitelisted or 0.0.0.0/0 is set');
      console.error('   • Check your internet connection');
      console.error('   • Try from a different network to rule out local firewall issues');
    } else {
      console.error('   • Check all parts of the connection string');
      console.error('   • Verify database name is correct');
      console.error('   • Check MongoDB Atlas cluster status');
    }

    console.error('\n📚 For more help, see: MONGODB_RENDER_SETUP.md\n');

    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
}

// Run validation
validateConnection().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
