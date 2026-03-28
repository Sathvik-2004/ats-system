require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const mongoose = require('mongoose');
const Job = require('./models/Job');

const MONGO_URI = process.env.MONGO_URI;

const jobs = [
  {
    title: 'Frontend Developer',
    company: 'TechCorp Solutions',
    location: 'Remote',
    type: 'Full-time',
    jobType: 'Full-time',
    salary: '$75,000 - $95,000',
    experience: 'Mid-level (2-4 years)',
    description: 'Build responsive and modern React applications.',
    requirements: ['React', 'TypeScript', 'CSS', 'REST APIs']
  },
  {
    title: 'Backend Developer',
    company: 'DataFlow Systems',
    location: 'New York, NY',
    type: 'Full-time',
    jobType: 'Full-time',
    salary: '$85,000 - $110,000',
    experience: 'Senior (3-5 years)',
    description: 'Design scalable APIs and microservices using Node.js.',
    requirements: ['Node.js', 'MongoDB', 'Express', 'Docker']
  },
  {
    title: 'Full Stack Developer',
    company: 'Innovation Labs Inc',
    location: 'San Francisco, CA',
    type: 'Contract',
    jobType: 'Contract',
    salary: '$65 - $85/hour',
    experience: 'Mid-Senior (3-6 years)',
    description: 'Own frontend and backend features in a fast-paced team.',
    requirements: ['React', 'Node.js', 'PostgreSQL', 'GraphQL']
  },
  {
    title: 'DevOps Engineer',
    company: 'CloudTech Enterprises',
    location: 'Austin, TX',
    type: 'Full-time',
    jobType: 'Full-time',
    salary: '$90,000 - $120,000',
    experience: 'Senior (4-6 years)',
    description: 'Manage CI/CD, cloud infra, and reliability.',
    requirements: ['AWS', 'Kubernetes', 'Terraform', 'Jenkins']
  },
  {
    title: 'UI/UX Designer',
    company: 'Design Studio Pro',
    location: 'Los Angeles, CA',
    type: 'Full-time',
    jobType: 'Full-time',
    salary: '$70,000 - $90,000',
    experience: 'Mid-level (2-4 years)',
    description: 'Design intuitive user experiences and interfaces.',
    requirements: ['Figma', 'User Research', 'Design Systems']
  }
];

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await Job.deleteMany({});
    const inserted = await Job.insertMany(jobs);
    console.log(`✅ Seeded ${inserted.length} jobs`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed jobs:', error.message);
    process.exit(1);
  }
})();
