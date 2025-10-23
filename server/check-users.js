const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');

const checkUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users
    const users = await User.find();
    console.log(`\n👥 Total users found: ${users.length}`);

    if (users.length > 0) {
      console.log('\n📋 Users:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - ID: ${user._id}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('💥 Error:', error);
    process.exit(1);
  }
};

checkUsers();