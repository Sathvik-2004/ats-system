const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'ksreddy@2004'
};

let adminToken = '';

// Test function to verify all settings functionality
async function testSettingsAPI() {
  try {
    console.log('🧪 Testing Complete Settings API...\n');

    // 1. Admin Login
    console.log('1. 📝 Admin Login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/admin/login`, ADMIN_CREDENTIALS);
    
    if (loginResponse.data.token) {
      adminToken = loginResponse.data.token;
      console.log('   ✅ Admin login successful\n');
    } else {
      console.log('   ❌ Admin login failed');
      return;
    }

    // 2. Test GET Settings (should create defaults if none exist)
    console.log('2. 📊 Fetching default settings...');
    const getResponse = await axios.get(`${BASE_URL}/api/admin/settings`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (getResponse.data.success) {
      console.log('   ✅ Settings fetched successfully');
      console.log('   📋 Auto-processing enabled:', getResponse.data.settings.autoProcessing.enabled);
      console.log('   📋 Approval threshold:', getResponse.data.settings.autoProcessing.approvalThreshold);
      console.log('   📋 Company name:', getResponse.data.settings.system.companyInfo.name);
      console.log('');
    } else {
      console.log('   ❌ Failed to fetch settings');
      return;
    }

    // 3. Test UPDATE Settings - Auto-processing
    console.log('3. ⚙️ Updating auto-processing settings...');
    const autoProcessingUpdate = {
      autoProcessing: {
        ...getResponse.data.settings.autoProcessing,
        enabled: true,
        approvalThreshold: 75,
        interviewThreshold: 65,
        rejectionThreshold: 35
      }
    };

    const updateResponse = await axios.put(`${BASE_URL}/api/admin/settings`, autoProcessingUpdate, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (updateResponse.data.success) {
      console.log('   ✅ Auto-processing settings updated');
      console.log('   📋 New approval threshold:', updateResponse.data.settings.autoProcessing.approvalThreshold);
      console.log('');
    } else {
      console.log('   ❌ Failed to update auto-processing settings');
    }

    // 4. Test UPDATE Settings - Company Info
    console.log('4. 🏢 Updating company information...');
    const companyUpdate = {
      system: {
        ...getResponse.data.settings.system,
        companyInfo: {
          name: 'Test ATS Company',
          website: 'https://test-ats.com',
          email: 'hr@test-ats.com',
          phone: '+1-555-123-4567',
          address: '123 Business St, Tech City, TC 12345'
        }
      }
    };

    const companyResponse = await axios.put(`${BASE_URL}/api/admin/settings`, companyUpdate, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (companyResponse.data.success) {
      console.log('   ✅ Company information updated');
      console.log('   📋 Company name:', companyResponse.data.settings.system.companyInfo.name);
      console.log('   📋 Website:', companyResponse.data.settings.system.companyInfo.website);
      console.log('');
    } else {
      console.log('   ❌ Failed to update company information');
    }

    // 5. Test UPDATE Settings - Email Configuration
    console.log('5. 📧 Updating email settings...');
    const emailUpdate = {
      email: {
        ...getResponse.data.settings.email,
        enabled: true,
        smtp: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          username: 'test@gmail.com',
          password: 'test-password'
        },
        adminNotifications: {
          newApplication: true,
          systemAlerts: true,
          weeklyReport: false
        }
      }
    };

    const emailResponse = await axios.put(`${BASE_URL}/api/admin/settings`, emailUpdate, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (emailResponse.data.success) {
      console.log('   ✅ Email settings updated');
      console.log('   📋 Email enabled:', emailResponse.data.settings.email.enabled);
      console.log('   📋 SMTP host:', emailResponse.data.settings.email.smtp.host);
      console.log('');
    } else {
      console.log('   ❌ Failed to update email settings');
    }

    // 6. Test Validation - Invalid thresholds
    console.log('6. ⚠️ Testing validation with invalid settings...');
    const invalidUpdate = {
      autoProcessing: {
        ...getResponse.data.settings.autoProcessing,
        approvalThreshold: 50, // Invalid: lower than interview threshold
        interviewThreshold: 65,
        rejectionThreshold: 35
      }
    };

    try {
      await axios.put(`${BASE_URL}/api/admin/settings`, invalidUpdate, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('   ❌ Validation failed - invalid settings were accepted');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('   ✅ Validation working - invalid settings rejected');
      } else {
        console.log('   ⚠️ Unexpected error during validation test');
      }
    }
    console.log('');

    // 7. Test GET specific section
    console.log('7. 📊 Testing specific section retrieval...');
    const sectionResponse = await axios.get(`${BASE_URL}/api/admin/settings/autoProcessing`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (sectionResponse.data.success) {
      console.log('   ✅ Auto-processing section retrieved');
      console.log('   📋 Section data:', JSON.stringify(sectionResponse.data.data, null, 2));
      console.log('');
    } else {
      console.log('   ❌ Failed to retrieve specific section');
    }

    // 8. Test Settings Reset
    console.log('8. 🔄 Testing settings reset...');
    const resetResponse = await axios.post(`${BASE_URL}/api/admin/settings/reset`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (resetResponse.data.success) {
      console.log('   ✅ Settings reset successfully');
      console.log('   📋 Company name after reset:', resetResponse.data.settings.system.companyInfo.name);
      console.log('   📋 Auto-processing enabled after reset:', resetResponse.data.settings.autoProcessing.enabled);
      console.log('');
    } else {
      console.log('   ❌ Failed to reset settings');
    }

    console.log('🎉 All settings tests completed successfully!');

  } catch (error) {
    console.error('❌ Settings API test failed:', error.response?.data || error.message);
  }
}

// Run the test
testSettingsAPI();
