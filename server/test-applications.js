const mongoose = require('mongoose');
const Applicant = require('./models/Applicant');
const Job = require('./models/Job'); // Need this for populate to work

// Configure dotenv
require('dotenv').config();

const testApplications = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if applications exist
    const applications = await Applicant.find().populate('jobId');
    console.log(`📊 Found ${applications.length} applications in database`);
    
    if (applications.length > 0) {
      console.log('📋 Applications found:');
      applications.forEach((app, index) => {
        console.log(`${index + 1}. ${app.name} (${app.email}) - ${app.status}`);
        console.log(`   Applied for: ${app.jobId?.title || 'Unknown Job'} at ${app.jobId?.company || 'Unknown Company'}`);
        console.log(`   User ID: ${app.userId}`);
        console.log(`   Applied At: ${app.appliedAt}`);
        console.log('---');
      });
    } else {
      console.log('❌ No applications found in database');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

testApplications();