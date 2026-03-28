require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is required');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' }
});

const User = mongoose.model('User', UserSchema);

const updateAdminPassword = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Update admin user with correct password
    const result = await User.updateOne(
      { name: 'admin', role: 'admin' },
      { 
        $set: { 
          name: 'admin',
          email: 'admin@ats.local',
          password: 'ksreddy@2004',
          role: 'admin'
        }
      },
      { upsert: true }
    );

    console.log('✅ Admin credentials updated:');
    console.log('   Username: admin');
    console.log('   Password: ksreddy@2004');
    console.log('   Email: admin@ats.local');
    console.log('   Role: admin');
    console.log('   Updated/Inserted:', result.modifiedCount > 0 ? 'UPDATED' : 'INSERTED');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

updateAdminPassword();
