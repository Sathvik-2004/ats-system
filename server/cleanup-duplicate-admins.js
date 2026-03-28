require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is required in .env file');
  process.exit(1);
}

const cleanupDuplicateAdmins = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all admin users
    const admins = await User.find({ role: 'admin' });
    console.log(`\n📋 Found ${admins.length} admin record(s):`);
    
    admins.forEach((admin, idx) => {
      const isHashed = admin.password.startsWith('$2a$');
      console.log(`\n  ${idx + 1}. ${admin.name || admin.email}`);
      console.log(`     Email: ${admin.email}`);
      console.log(`     Password: ${isHashed ? '[HASHED]' : '[PLAINTEXT]'}`);
      console.log(`     ID: ${admin._id}`);
    });

    if (admins.length > 1) {
      console.log('\n⚠️  Multiple admin records found. Removing duplicates...');
      
      // Keep only the one with hashed password (the newer one)
      const hashedAdmin = admins.find(a => a.password.startsWith('$2a$'));
      const plainAdmin = admins.find(a => !a.password.startsWith('$2a$'));

      if (plainAdmin && hashedAdmin) {
        console.log(`\n🗑️  Deleting plaintext admin record: ${plainAdmin._id}`);
        await User.deleteOne({ _id: plainAdmin._id });
        console.log('✅ Deleted duplicate admin record');
      } else {
        console.log('\n⚠️  Could not identify which admin to delete. Keeping first record...');
        // Delete all except the first one
        for (let i = 1; i < admins.length; i++) {
          await User.deleteOne({ _id: admins[i]._id });
          console.log(`✅ Deleted admin record: ${admins[i]._id}`);
        }
      }
    }

    // Show final admin user
    const finalAdmin = await User.findOne({ role: 'admin' });
    if (finalAdmin) {
      console.log('\n✅ Final admin user:');
      console.log(`   Name: ${finalAdmin.name}`);
      console.log(`   Email: ${finalAdmin.email}`);
      console.log(`   Password: [${finalAdmin.password.startsWith('$2a$') ? 'HASHED' : 'PLAINTEXT'}]`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

cleanupDuplicateAdmins();
