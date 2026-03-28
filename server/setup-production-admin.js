require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Production MongoDB URI with properly decoded password (! is %21 in URL encoding)
const PRODUCTION_MONGO_URI = 'mongodb+srv://sathwikreddy9228_db_user:AtsSystem2024!@ats-production-cluster.gl3adlt.mongodb.net/ats_production?retryWrites=true&w=majority&appName=ats-production-cluster';

const User = require('./models/User');

const setupProductionAdminCredentials = async () => {
  try {
    console.log('🔗 Connecting to production MongoDB Atlas...');
    await mongoose.connect(PRODUCTION_MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      retryWrites: true
    });
    console.log('✅ Connected to production MongoDB');

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash('ksreddy@2004', 10);

    // First, find and list existing admins
    const existingAdmins = await User.find({ role: 'admin' });
    console.log(`\n📋 Found ${existingAdmins.length} existing admin record(s)`);
    existingAdmins.forEach(admin => {
      const isHashed = admin.password.startsWith('$2a$');
      console.log(`   - ${admin.name} (${admin.email}): ${isHashed ? '[HASHED]' : '[PLAINTEXT]'}`);
    });

    // Remove any plaintext admin records
    const plainAdmins = existingAdmins.filter(a => !a.password.startsWith('$2a$'));
    if (plainAdmins.length > 0) {
      console.log(`\n🗑️  Removing ${plainAdmins.length} plaintext admin record(s)...`);
      for (const admin of plainAdmins) {
        await User.deleteOne({ _id: admin._id });
        console.log(`   ✅ Deleted: ${admin._id}`);
      }
    }

    // Update or create admin user with proper hashed password
    const result = await User.findOneAndUpdate(
      { name: 'admin', role: 'admin' },
      { 
        name: 'admin',
        email: 'admin@ats.local',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      },
      { upsert: true, new: true }
    );

    console.log('\n✅ Admin credentials successfully updated:');
    console.log('   Username: admin');
    console.log('   Password: ksreddy@2004');
    console.log('   Email: admin@ats.local');
    console.log('   Status: Active');

    // Verify by testing password comparison
    const testUser = await User.findOne({ name: 'admin', role: 'admin' });
    if (testUser) {
      const isValid = await testUser.comparePassword('ksreddy@2004');
      console.log(`   Password verification: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    console.log('\n🎉 You can now login with:');
    console.log('   Username: admin');
    console.log('   Password: ksreddy@2004');
    console.log('   Visit: https://ats-system-flame.vercel.app/admin-login');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('authentication failed')) {
      console.error('   → MongoDB password might be incorrect');
      console.error('   → Check the MONGO_URI in render.yaml and .env');
    }
    process.exit(1);
  }
};

setupProductionAdminCredentials();
