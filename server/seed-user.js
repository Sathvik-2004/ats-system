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

const seedUser = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create/update regular user
    const result = await User.updateOne(
      { email: 'user@ats.local' },
      { 
        $set: { 
          name: 'John Doe',
          email: 'user@ats.local',
          password: 'user123456',
          role: 'user'
        }
      },
      { upsert: true }
    );

    console.log('✅ User account created/updated:');
    console.log('   Name: John Doe');
    console.log('   Email: user@ats.local');
    console.log('   Password: user123456');
    console.log('   Role: user');
    console.log('   Updated/Inserted:', result.modifiedCount > 0 ? 'UPDATED' : 'INSERTED');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedUser();
