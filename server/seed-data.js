require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('./models/Job');
const User = require('./models/User');

const sampleJobs = [
  // Technology Roles
  {
    title: "Frontend Developer",
    company: "Tech Solutions Inc",
    location: "Remote",
    description: "We are looking for a skilled Frontend Developer with experience in React.js, Vue.js, and modern JavaScript frameworks",
    salary: 80000,
    experience: "3+ years",
    jobType: "Full-time"
  },
  {
    title: "Backend Developer",
    company: "Data Corp",
    location: "New York, NY",
    description: "Seeking an experienced Backend Developer to build scalable APIs using Node.js, Python, and cloud technologies",
    salary: 95000,
    experience: "5+ years",
    jobType: "Full-time"
  },
  {
    title: "Full Stack Developer",
    company: "StartupXYZ",
    location: "Austin, TX",
    description: "Join our dynamic startup as a Full Stack Developer working with MERN stack and AWS",
    salary: 85000,
    experience: "4+ years",
    jobType: "Full-time"
  },
  {
    title: "DevOps Engineer",
    company: "CloudTech Solutions",
    location: "Seattle, WA",
    description: "DevOps Engineer to manage CI/CD pipelines, Docker, Kubernetes, and cloud infrastructure",
    salary: 110000,
    experience: "5+ years",
    jobType: "Full-time"
  },
  {
    title: "Mobile App Developer",
    company: "MobileFirst Inc",
    location: "Los Angeles, CA",
    description: "React Native and Flutter developer to build cross-platform mobile applications",
    salary: 90000,
    experience: "3+ years",
    jobType: "Full-time"
  },
  {
    title: "Data Scientist",
    company: "AI Innovations",
    location: "Boston, MA",
    description: "Data Scientist with expertise in machine learning, Python, and statistical analysis",
    salary: 120000,
    experience: "4+ years",
    jobType: "Full-time"
  },
  {
    title: "Cybersecurity Analyst",
    company: "SecureNet Corp",
    location: "Washington, DC",
    description: "Cybersecurity professional to monitor, analyze, and protect against security threats",
    salary: 95000,
    experience: "3+ years",
    jobType: "Full-time"
  },
  
  // Design & UX Roles
  {
    title: "UX Designer",
    company: "Design Studio",
    location: "Chicago, IL",
    description: "Creative UX Designer to enhance user experience and create intuitive interfaces",
    salary: 75000,
    experience: "3+ years",
    jobType: "Full-time"
  },
  {
    title: "UI/UX Designer",
    company: "Creative Agency",
    location: "Portland, OR",
    description: "UI/UX Designer to create beautiful and functional digital experiences",
    salary: 72000,
    experience: "2+ years",
    jobType: "Full-time"
  },
  {
    title: "Graphic Designer",
    company: "BrandWorks",
    location: "Miami, FL",
    description: "Graphic Designer for brand identity, marketing materials, and digital assets",
    salary: 55000,
    experience: "2+ years",
    jobType: "Full-time"
  },
  
  // Data & Analytics
  {
    title: "Data Analyst",
    company: "Analytics Pro",
    location: "San Francisco, CA",
    description: "Join our team as a Data Analyst to help drive business decisions using SQL, Python, and BI tools",
    salary: 70000,
    experience: "2+ years",
    jobType: "Full-time"
  },
  {
    title: "Business Intelligence Analyst",
    company: "DataDriven Corp",
    location: "Dallas, TX",
    description: "BI Analyst to create dashboards, reports, and insights using Tableau and Power BI",
    salary: 75000,
    experience: "3+ years",
    jobType: "Full-time"
  },
  {
    title: "Database Administrator",
    company: "Enterprise Solutions",
    location: "Atlanta, GA",
    description: "DBA to manage and optimize SQL Server, MySQL, and PostgreSQL databases",
    salary: 85000,
    experience: "4+ years",
    jobType: "Full-time"
  },
  
  // Marketing & Sales
  {
    title: "Digital Marketing Manager",
    company: "GrowthCo",
    location: "Remote",
    description: "Lead digital marketing campaigns across social media, email, and content marketing",
    salary: 65000,
    experience: "3+ years",
    jobType: "Full-time"
  },
  {
    title: "Content Marketing Specialist",
    company: "ContentFirst",
    location: "Denver, CO",
    description: "Create engaging content strategies and manage blog, social media, and email campaigns",
    salary: 55000,
    experience: "2+ years",
    jobType: "Full-time"
  },
  {
    title: "Sales Development Representative",
    company: "SalesPro Inc",
    location: "Phoenix, AZ",
    description: "SDR to generate leads, qualify prospects, and support the sales pipeline",
    salary: 50000,
    experience: "1+ years",
    jobType: "Full-time"
  },
  
  // Project Management
  {
    title: "Project Manager",
    company: "ProjectFlow",
    location: "Nashville, TN",
    description: "Agile Project Manager to lead cross-functional teams and deliver software projects",
    salary: 85000,
    experience: "5+ years",
    jobType: "Full-time"
  },
  {
    title: "Scrum Master",
    company: "AgileWorks",
    location: "Remote",
    description: "Certified Scrum Master to facilitate agile ceremonies and coach development teams",
    salary: 90000,
    experience: "3+ years",
    jobType: "Full-time"
  },
  
  // Finance & Operations
  {
    title: "Financial Analyst",
    company: "FinanceFirst",
    location: "Charlotte, NC",
    description: "Financial Analyst to perform budgeting, forecasting, and financial modeling",
    salary: 65000,
    experience: "2+ years",
    jobType: "Full-time"
  },
  {
    title: "Operations Manager",
    company: "EfficiencyPro",
    location: "Indianapolis, IN",
    description: "Operations Manager to optimize processes and manage day-to-day business operations",
    salary: 75000,
    experience: "4+ years",
    jobType: "Full-time"
  },
  
  // Customer Success & Support
  {
    title: "Customer Success Manager",
    company: "ClientCare Inc",
    location: "Remote",
    description: "CSM to ensure customer satisfaction, retention, and growth within existing accounts",
    salary: 70000,
    experience: "3+ years",
    jobType: "Full-time"
  },
  {
    title: "Technical Support Specialist",
    company: "HelpDesk Solutions",
    location: "Remote",
    description: "Provide technical support and troubleshooting for software and hardware issues",
    salary: 45000,
    experience: "1+ years",
    jobType: "Full-time"
  },
  
  // Part-time and Contract Roles
  {
    title: "Junior Web Developer",
    company: "WebCraft Studio",
    location: "Remote",
    description: "Entry-level web developer position to learn and grow with HTML, CSS, JavaScript",
    salary: 40000,
    experience: "0-1 years",
    jobType: "Part-time"
  },
  {
    title: "Freelance Content Writer",
    company: "WritePro Agency",
    location: "Remote",
    description: "Contract content writer for blog posts, articles, and marketing copy",
    salary: 35000,
    experience: "1+ years",
    jobType: "Contract"
  },
  {
    title: "Social Media Coordinator",
    company: "SocialBuzz",
    location: "Remote",
    description: "Part-time social media coordinator to manage accounts and create content",
    salary: 30000,
    experience: "1+ years",
    jobType: "Part-time"
  }
];

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Job.deleteMany({});
    const Applicant = require('./models/Applicant');
    await Applicant.deleteMany({});

    // Insert jobs first
    console.log('📋 Creating sample jobs...');
    const createdJobs = await Job.insertMany(sampleJobs);
    console.log(`✅ Created ${createdJobs.length} jobs`);

    // Create applications with real job IDs
    const sampleApplications = [
      // Technology Applications
      {
        name: "John Doe",
        email: "john.doe@example.com",
        jobId: createdJobs[0]._id, // Frontend Developer
        resume: "john_doe_resume.pdf",
        status: "Pending"
      },
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        jobId: createdJobs[1]._id, // Backend Developer
        resume: "jane_smith_resume.pdf",
        status: "Under Review"
      },
      {
        name: "Alex Rodriguez",
        email: "alex.rodriguez@example.com",
        jobId: createdJobs[2]._id, // Full Stack Developer
        resume: "alex_rodriguez_resume.pdf",
        status: "Interview Scheduled"
      },
      {
        name: "Emily Chen",
        email: "emily.chen@example.com",
        jobId: createdJobs[3]._id, // DevOps Engineer
        resume: "emily_chen_resume.pdf",
        status: "Approved"
      },
      {
        name: "Marcus Johnson",
        email: "marcus.johnson@example.com",
        jobId: createdJobs[4]._id, // Mobile App Developer
        resume: "marcus_johnson_resume.pdf",
        status: "Pending"
      },
      {
        name: "Dr. Sarah Williams",
        email: "sarah.williams@example.com",
        jobId: createdJobs[5]._id, // Data Scientist
        resume: "sarah_williams_resume.pdf",
        status: "Under Review"
      },
      {
        name: "Kevin Park",
        email: "kevin.park@example.com",
        jobId: createdJobs[6]._id, // Cybersecurity Analyst
        resume: "kevin_park_resume.pdf",
        status: "Interview Scheduled"
      },
      
      // Design Applications
      {
        name: "Lisa Zhang",
        email: "lisa.zhang@example.com",
        jobId: createdJobs[7]._id, // UX Designer
        resume: "lisa_zhang_resume.pdf",
        status: "Pending"
      },
      {
        name: "David Miller",
        email: "david.miller@example.com",
        jobId: createdJobs[8]._id, // UI/UX Designer
        resume: "david_miller_resume.pdf",
        status: "Approved"
      },
      {
        name: "Rachel Adams",
        email: "rachel.adams@example.com",
        jobId: createdJobs[9]._id, // Graphic Designer
        resume: "rachel_adams_resume.pdf",
        status: "Under Review"
      },
      
      // Data & Analytics Applications
      {
        name: "Mike Johnson",
        email: "mike.johnson@example.com",
        jobId: createdJobs[10]._id, // Data Analyst
        resume: "mike_johnson_resume.pdf",
        status: "Interview Scheduled"
      },
      {
        name: "Jennifer Lopez",
        email: "jennifer.lopez@example.com",
        jobId: createdJobs[11]._id, // BI Analyst
        resume: "jennifer_lopez_resume.pdf",
        status: "Pending"
      },
      {
        name: "Robert Taylor",
        email: "robert.taylor@example.com",
        jobId: createdJobs[12]._id, // Database Administrator
        resume: "robert_taylor_resume.pdf",
        status: "Approved"
      },
      
      // Marketing Applications
      {
        name: "Amanda Foster",
        email: "amanda.foster@example.com",
        jobId: createdJobs[13]._id, // Digital Marketing Manager
        resume: "amanda_foster_resume.pdf",
        status: "Under Review"
      },
      {
        name: "Chris Thompson",
        email: "chris.thompson@example.com",
        jobId: createdJobs[14]._id, // Content Marketing Specialist
        resume: "chris_thompson_resume.pdf",
        status: "Pending"
      },
      {
        name: "Nicole Brown",
        email: "nicole.brown@example.com",
        jobId: createdJobs[15]._id, // Sales Development Representative
        resume: "nicole_brown_resume.pdf",
        status: "Interview Scheduled"
      },
      
      // Project Management Applications
      {
        name: "Steven Garcia",
        email: "steven.garcia@example.com",
        jobId: createdJobs[16]._id, // Project Manager
        resume: "steven_garcia_resume.pdf",
        status: "Approved"
      },
      {
        name: "Michelle Davis",
        email: "michelle.davis@example.com",
        jobId: createdJobs[17]._id, // Scrum Master
        resume: "michelle_davis_resume.pdf",
        status: "Under Review"
      },
      
      // Finance & Operations Applications
      {
        name: "James Wilson",
        email: "james.wilson@example.com",
        jobId: createdJobs[18]._id, // Financial Analyst
        resume: "james_wilson_resume.pdf",
        status: "Pending"
      },
      {
        name: "Laura Martinez",
        email: "laura.martinez@example.com",
        jobId: createdJobs[19]._id, // Operations Manager
        resume: "laura_martinez_resume.pdf",
        status: "Interview Scheduled"
      },
      
      // Customer Success Applications
      {
        name: "Daniel Lee",
        email: "daniel.lee@example.com",
        jobId: createdJobs[20]._id, // Customer Success Manager
        resume: "daniel_lee_resume.pdf",
        status: "Approved"
      },
      {
        name: "Samantha White",
        email: "samantha.white@example.com",
        jobId: createdJobs[21]._id, // Technical Support Specialist
        resume: "samantha_white_resume.pdf",
        status: "Under Review"
      },
      
      // Entry Level Applications
      {
        name: "Tyler Johnson",
        email: "tyler.johnson@example.com",
        jobId: createdJobs[22]._id, // Junior Web Developer
        resume: "tyler_johnson_resume.pdf",
        status: "Pending"
      },
      {
        name: "Maria Gonzalez",
        email: "maria.gonzalez@example.com",
        jobId: createdJobs[23]._id, // Freelance Content Writer
        resume: "maria_gonzalez_resume.pdf",
        status: "Interview Scheduled"
      },
      {
        name: "Ashley Clark",
        email: "ashley.clark@example.com",
        jobId: createdJobs[24]._id, // Social Media Coordinator
        resume: "ashley_clark_resume.pdf",
        status: "Approved"
      }
    ];

    // Insert applications
    console.log('📝 Creating sample applications...');
    const createdApplications = await Applicant.insertMany(sampleApplications);
    console.log(`✅ Created ${createdApplications.length} applications`);

    console.log('🎉 Sample data created successfully!');
    console.log('\nCreated Jobs:');
    createdJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} at ${job.company} - $${job.salary}`);
    });

    console.log('\nCreated Applications:');
    createdApplications.forEach((app, index) => {
      console.log(`${index + 1}. ${app.name} - ${app.status}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

seedDatabase();