require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PRODUCTION_MONGO_URI = process.env.MONGO_URI;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ksreddy@2004';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ats.local';

if (!PRODUCTION_MONGO_URI) {
  console.error('❌ Missing MONGO_URI in environment.');
  console.error('   → Add MONGO_URI in your deployment provider environment variables.');
  process.exit(1);
}

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
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

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
      { role: 'admin', $or: [{ name: ADMIN_USERNAME }, { email: ADMIN_EMAIL }] },
      { 
        name: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        isActive: true
      },
      { upsert: true, new: true }
    );

    console.log('\n✅ Admin credentials successfully updated:');
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log('   Status: Active');

    // Verify by testing password comparison
    const testUser = await User.findOne({ role: 'admin', $or: [{ name: ADMIN_USERNAME }, { email: ADMIN_EMAIL }] });
    if (testUser) {
      const isValid = await testUser.comparePassword(ADMIN_PASSWORD);
      console.log(`   Password verification: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    console.log('\n🎉 You can now login with:');
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
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
