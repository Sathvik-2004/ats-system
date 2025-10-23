const mongoose = require('mongoose');
const Job = require('./models/Job');

// Configure dotenv
require('dotenv').config();

const testJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if jobs exist
    const jobs = await Job.find();
    console.log(`📊 Found ${jobs.length} jobs in database`);
    
    if (jobs.length === 0) {
      console.log('🆕 Adding sample jobs...');
      
      const sampleJobs = [
        {
          title: 'Software Engineer',
          company: 'TechCorp',
          salary: '$80k - $120k',
          location: 'San Francisco, CA',
          experience: 'Mid-level',
          jobType: 'Full-time',
          description: 'We are looking for a skilled software engineer to join our team. You will be responsible for developing and maintaining web applications using modern technologies.'
        },
        {
          title: 'Frontend Developer',
          company: 'WebStudio',
          salary: '$70k - $100k',
          location: 'Remote',
          experience: 'Junior',
          jobType: 'Full-time',
          description: 'Join our frontend team to create beautiful and responsive user interfaces. Experience with React, HTML, CSS, and JavaScript required.'
        },
        {
          title: 'Full Stack Developer',
          company: 'StartupXYZ',
          salary: '$90k - $130k',
          location: 'New York, NY',
          experience: 'Senior',
          jobType: 'Full-time',
          description: 'We need a full stack developer who can work on both frontend and backend technologies. Experience with Node.js, React, and databases required.'
        }
      ];
      
      await Job.insertMany(sampleJobs);
      console.log('✅ Sample jobs added successfully');
    } else {
      console.log('📋 Existing jobs:');
      jobs.forEach((job, index) => {
        console.log(`${index + 1}. ${job.title} at ${job.company} - ${job.location}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

testJobs();