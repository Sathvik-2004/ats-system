const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Applicant = require('./models/Applicant');
const Job = require('./models/Job');

const checkApplications = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all applications
    const applications = await Applicant.find().populate('jobId');
    console.log(`\n📊 Total applications found: ${applications.length}`);

    if (applications.length > 0) {
      console.log('\n📋 Sample applications:');
      applications.slice(0, 3).forEach((app, index) => {
        console.log(`\n${index + 1}. Application:`, {
          id: app._id,
          name: app.name,
          email: app.email,
          userId: app.userId,
          status: app.status,
          appliedAt: app.appliedAt,
          jobTitle: app.jobId?.title || 'No job linked'
        });
      });

      // Check how many have userId set
      const withUserId = applications.filter(app => app.userId);
      const withoutUserId = applications.filter(app => !app.userId);
      
      console.log(`\n🔗 Applications with userId: ${withUserId.length}`);
      console.log(`❌ Applications without userId: ${withoutUserId.length}`);

      if (withoutUserId.length > 0) {
        console.log('\n⚠️  Applications missing userId:');
        withoutUserId.forEach((app, index) => {
          console.log(`${index + 1}. ${app.name} (${app.email}) - Applied: ${app.appliedAt}`);
        });
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('💥 Error:', error);
    process.exit(1);
  }
};

checkApplications();