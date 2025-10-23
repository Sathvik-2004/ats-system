const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Applicant = require('./models/Applicant');
const Job = require('./models/Job');

const linkApplicationsToUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users
    const users = await User.find();
    console.log(`\n👥 Found ${users.length} users`);

    let linkedCount = 0;

    for (const user of users) {
      console.log(`\n🔗 Linking applications for user: ${user.name} (${user.email})`);
      
      // Find applications with matching email but no userId
      const applicationsToLink = await Applicant.find({
        email: user.email,
        userId: { $exists: false }
      });

      if (applicationsToLink.length > 0) {
        console.log(`   Found ${applicationsToLink.length} applications to link`);
        
        // Update all matching applications
        const result = await Applicant.updateMany(
          { email: user.email, userId: { $exists: false } },
          { $set: { userId: user._id } }
        );

        console.log(`   ✅ Updated ${result.modifiedCount} applications`);
        linkedCount += result.modifiedCount;
      } else {
        console.log(`   No unlinked applications found for this user`);
      }
    }

    console.log(`\n🎉 Successfully linked ${linkedCount} applications to users!`);

    // Verify the results
    console.log('\n📊 Verification:');
    const allApplications = await Applicant.find().populate('jobId');
    const withUserId = allApplications.filter(app => app.userId);
    const withoutUserId = allApplications.filter(app => !app.userId);
    
    console.log(`   Applications with userId: ${withUserId.length}`);
    console.log(`   Applications without userId: ${withoutUserId.length}`);

    if (withUserId.length > 0) {
      console.log('\n✅ Linked applications:');
      withUserId.forEach((app, index) => {
        console.log(`   ${index + 1}. ${app.name} (${app.email}) - ${app.jobId?.title}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('💥 Error:', error);
    process.exit(1);
  }
};

linkApplicationsToUsers();