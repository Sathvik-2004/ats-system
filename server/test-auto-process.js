const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Applicant = require('./models/Applicant');
const Job = require('./models/Job');

const testAutoProcessing = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for testing');

    // First, let's reset some applications to Pending status for testing
    const resetResult = await Applicant.updateMany(
      { status: { $in: ['Under Review', 'Approved'] } },
      { status: 'Pending' }
    );
    
    console.log(`🔄 Reset ${resetResult.modifiedCount} applications to Pending for testing`);

    // Show current applications
    const applications = await Applicant.find().populate('jobId');
    console.log('\n📋 Current applications:');
    applications.forEach((app, index) => {
      console.log(`${index + 1}. ${app.name} (${app.email}) - ${app.jobId?.title} - Status: ${app.status}`);
    });

    console.log('\n🤖 Now you can test the auto-processing from the admin dashboard!');
    console.log('\nThe new auto-processing will:');
    console.log('• Score each application based on multiple criteria');
    console.log('• Auto-approve high-scoring candidates (80+ points)');
    console.log('• Schedule interviews for good candidates (70+ points)');
    console.log('• Auto-reject problematic applications (30 or below)');
    console.log('• Send others to human review (31-79 points)');

    process.exit(0);
  } catch (error) {
    console.error('💥 Error:', error);
    process.exit(1);
  }
};

testAutoProcessing();