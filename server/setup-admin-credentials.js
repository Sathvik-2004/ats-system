require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is required in .env file');
  process.exit(1);
}

// Use the actual User model from the project
const User = require('./models/User');

const setupAdminCredentials = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Hash the password using bcrypt (same as User model does)
    const hashedPassword = await bcrypt.hash('ksreddy@2004', 10);

    // Update or create admin user
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

    console.log('✅ Admin credentials set successfully:');
    console.log('   Username: admin');
    console.log('   Password: ksreddy@2004');
    console.log('   Email: admin@ats.local');
    console.log('   Role: admin');
    console.log('   Status: Active');
    console.log('   Operation:', result.isNew ? 'CREATED' : 'UPDATED');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

setupAdminCredentials();
