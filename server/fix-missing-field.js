const mongoose = require('mongoose');
const Settings = require('./models/Settings');

async function fixMissingField() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/atsdb');
    console.log('✅ Connected to MongoDB');

    // Get the current settings document
    const currentSettings = await Settings.findOne();
    
    if (currentSettings) {
      console.log('📋 Current passwordRequirements:', currentSettings.security.passwordRequirements);
      
      // Add the missing requireLowercase field if it doesn't exist
      if (currentSettings.security.passwordRequirements.requireLowercase === undefined) {
        currentSettings.security.passwordRequirements.requireLowercase = true;
        await currentSettings.save();
        console.log('✅ Added missing requireLowercase field');
      } else {
        console.log('✅ requireLowercase field already exists');
      }
      
      console.log('📋 Updated passwordRequirements:', currentSettings.security.passwordRequirements);
    } else {
      console.log('❌ No settings document found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixMissingField();