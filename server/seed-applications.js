require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const mongoose = require('mongoose');
const Application = require('./models/Application');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is required');
  process.exit(1);
}

const seedApplications = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing applications
    await Application.deleteMany({});
    console.log('🗑️  Cleared existing applications');

    // Sample applications data
    const sampleApplications = [
      {
        candidateId: '60d5ec49c1234567890abcd1',
        jobId: '60d5ec49c1234567890abcd2',
        candidateName: 'John Smith',
        candidateEmail: 'john.smith@email.com',
        jobTitle: 'Frontend Developer',
        status: 'reviewing',
        resumeUrl: 'https://example.com/resume/john-smith.pdf',
        score: 85,
        matchingSkills: ['React', 'TypeScript', 'CSS', 'JavaScript'],
        missingSkills: ['GraphQL'],
        notes: 'Strong candidate, good communication skills'
      },
      {
        candidateId: '60d5ec49c1234567890abcd3',
        jobId: '60d5ec49c1234567890abcd2',
        candidateName: 'Sarah Johnson',
        candidateEmail: 'sarah.j@email.com',
        jobTitle: 'Frontend Developer',
        status: 'shortlisted',
        resumeUrl: 'https://example.com/resume/sarah-johnson.pdf',
        score: 92,
        matchingSkills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'REST APIs'],
        missingSkills: [],
        notes: 'Excellent fit, experienced with React',
        interviewScheduled: {
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          time: '10:00 AM',
          mode: 'online'
        }
      },
      {
        candidateId: '60d5ec49c1234567890abcd4',
        jobId: '60d5ec49c1234567890abcd4',
        candidateName: 'Michael Chen',
        candidateEmail: 'michael.chen@email.com',
        jobTitle: 'Backend Developer',
        status: 'interview_scheduled',
        resumeUrl: 'https://example.com/resume/michael-chen.pdf',
        score: 88,
        matchingSkills: ['Node.js', 'PostgreSQL', 'AWS', 'Docker'],
        missingSkills: ['Python'],
        interviewScheduled: {
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          time: '2:00 PM',
          mode: 'in-person'
        }
      },
      {
        candidateId: '60d5ec49c1234567890abcd5',
        jobId: '60d5ec49c1234567890abcd4',
        candidateName: 'Emma Wilson',
        candidateEmail: 'emma.wilson@email.com',
        jobTitle: 'Backend Developer',
        status: 'selected',
        resumeUrl: 'https://example.com/resume/emma-wilson.pdf',
        score: 95,
        matchingSkills: ['Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker'],
        missingSkills: [],
        notes: 'Hired - start date June 1st'
      },
      {
        candidateId: '60d5ec49c1234567890abcd6',
        jobId: '60d5ec49c1234567890abcd5',
        candidateName: 'David Brown',
        candidateEmail: 'david.brown@email.com',
        jobTitle: 'Full Stack Developer',
        status: 'applied',
        resumeUrl: 'https://example.com/resume/david-brown.pdf',
        score: 72,
        matchingSkills: ['React', 'Node.js', 'MongoDB'],
        missingSkills: ['TypeScript', 'GraphQL', 'Docker']
      },
      {
        candidateId: '60d5ec49c1234567890abcd7',
        jobId: '60d5ec49c1234567890abcd5',
        candidateName: 'Lisa Anderson',
        candidateEmail: 'lisa.anderson@email.com',
        jobTitle: 'Full Stack Developer',
        status: 'rejected',
        resumeUrl: 'https://example.com/resume/lisa-anderson.pdf',
        score: 45,
        matchingSkills: ['HTML', 'CSS', 'JavaScript'],
        missingSkills: ['React', 'Node.js', 'Database Design'],
        notes: 'Does not meet minimum skill requirements'
      },
      {
        candidateId: '60d5ec49c1234567890abcd8',
        jobId: '60d5ec49c1234567890abcd6',
        candidateName: 'Robert Taylor',
        candidateEmail: 'robert.taylor@email.com',
        jobTitle: 'UI/UX Designer',
        status: 'reviewing',
        resumeUrl: 'https://example.com/resume/robert-taylor.pdf',
        score: 78,
        matchingSkills: ['Figma', 'User Research', 'Design Systems'],
        missingSkills: ['Adobe XD', 'Prototyping']
      },
      {
        candidateId: '60d5ec49c1234567890abcd9',
        jobId: '60d5ec49c1234567890abcd7',
        candidateName: 'Jennifer Martinez',
        candidateEmail: 'jen.martinez@email.com',
        jobTitle: 'DevOps Engineer',
        status: 'shortlisted',
        resumeUrl: 'https://example.com/resume/jennifer-martinez.pdf',
        score: 89,
        matchingSkills: ['AWS', 'Kubernetes', 'Docker', 'Jenkins', 'Terraform'],
        missingSkills: ['Azure'],
        notes: 'Strong Infrastructure background'
      },
      {
        candidateId: '60d5ec49c1234567890abcda',
        jobId: '60d5ec49c1234567890abcd2',
        candidateName: 'Christopher Lee',
        candidateEmail: 'chris.lee@email.com',
        jobTitle: 'Frontend Developer',
        status: 'applied',
        resumeUrl: 'https://example.com/resume/chris-lee.pdf',
        score: 68,
        matchingSkills: ['React', 'JavaScript', 'CSS'],
        missingSkills: ['TypeScript', 'Git', 'Testing']
      },
      {
        candidateId: '60d5ec49c1234567890abcdb',
        jobId: '60d5ec49c1234567890abcd8',
        candidateName: 'Amanda White',
        candidateEmail: 'amanda.white@email.com',
        jobTitle: 'Product Manager',
        status: 'interview_scheduled',
        resumeUrl: 'https://example.com/resume/amanda-white.pdf',
        score: 87,
        matchingSkills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research'],
        missingSkills: ['Market Research'],
        interviewScheduled: {
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          time: '11:00 AM',
          mode: 'online'
        }
      },
      {
        candidateId: '60d5ec49c1234567890abcdc',
        jobId: '60d5ec49c1234567890abcd9',
        candidateName: 'Kevin Johnson',
        candidateEmail: 'kevin.j@email.com',
        jobTitle: 'Data Scientist',
        status: 'applied',
        resumeUrl: 'https://example.com/resume/kevin-johnson.pdf',
        score: 80,
        matchingSkills: ['Python', 'R', 'SQL', 'Machine Learning'],
        missingSkills: ['TensorFlow', 'PyTorch']
      }
    ];

    // Insert sample applications
    const result = await Application.insertMany(sampleApplications);
    console.log(`✅ Created ${result.length} sample applications`);

    // Print summary
    console.log('\n📊 Applications Summary:');
    console.log('  - Total: ' + result.length);
    
    const statusCounts = {};
    result.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedApplications();
