const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');

const checkUserPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: 'sathwikreddy9228@gmail.com' });
    
    if (user) {
      console.log('👤 User found:', user.name);
      console.log('🔐 Password hash:', user.password.substring(0, 20) + '...');
      
      // Test common passwords
      const testPasswords = ['password', 'password123', '123456', 'sathvik', 'admin'];
      
      for (const pwd of testPasswords) {
        try {
          const isMatch = await user.comparePassword(pwd);
          if (isMatch) {
            console.log(`✅ Password found: "${pwd}"`);
            break;
          } else {
            console.log(`❌ Not: "${pwd}"`);
          }
        } catch (error) {
          console.log(`❌ Error testing "${pwd}":`, error.message);
        }
      }
    } else {
      console.log('❌ User not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('💥 Error:', error);
    process.exit(1);
  }
};

checkUserPassword();