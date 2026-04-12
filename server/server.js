// ATS SYSTEM BACKEND FOR RENDER.COM
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const app = express();

console.log('🚀 ATS BACKEND STARTING ON RENDER.COM...');

// MongoDB Connection with proper error handling
const MONGO_URI = process.env.MONGO_URI;

// Validate MONGO_URI exists
if (!MONGO_URI) {
  console.error('❌ CRITICAL: MONGO_URI environment variable is not set');
  console.error('   → Add MONGO_URI to Render environment variables');
  console.error('   → Format: mongodb+srv://username:password@cluster/database?retryWrites=true&w=majority');
  process.exit(1);
}

// Validate MONGO_URI format
if (!MONGO_URI.startsWith('mongodb+srv://') && !MONGO_URI.startsWith('mongodb://')) {
  console.error('❌ CRITICAL: MONGO_URI has invalid format');
  console.error('   → Must start with mongodb+srv:// or mongodb://');
  process.exit(1);
}

// Connect to MongoDB with proper configuration
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: 'majority'
};

mongoose.connect(MONGO_URI, mongooseOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed');
    console.error(`   Error: ${err.message}`);
    
    // Parse authentication errors
    if (err.message.includes('authentication failed') || err.message.includes('bad auth')) {
      console.error('   → This is an authentication error (bad username/password)');
      console.error('   → Check MONGO_URI credentials in Render environment variables');
      console.error('   → Verify the MongoDB Atlas user has correct role assignments');
    } else if (err.message.includes('connection failed') || err.message.includes('ECONNREFUSED')) {
      console.error('   → Connection refused (network or IP whitelist issue)');
      console.error('   → In MongoDB Atlas, add 0.0.0.0/0 to Network Access (Render uses dynamic IPs)');
    } else if (err.message.includes('unknown host') || err.message.includes('getaddrinfo')) {
      console.error('   → DNS resolution failed (cluster domain not found)');
      console.error('   → Verify cluster URL in MONGO_URI');
    } else if (err.message.includes('Timeout')) {
      console.error('   → Connection timeout (network unreachable or firewall blocked)');
      console.error('   → Verify 0.0.0.0/0 is added to MongoDB Atlas Network Access');
    }
    
    console.error('\n   Complete connection URI format example:');
    console.error('   mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/database_name?retryWrites=true&w=majority');
    
    process.exit(1);
  });

// Monitor connection state changes
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnecting', () => {
  console.log('🔄 MongoDB reconnecting...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Simple User schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true },
  phone: String,
  location: String,
  skills: { type: [String], default: [] },
  experience: String,
  education: String,
  summary: String,
  linkedIn: String,
  github: String,
  portfolio: String,
  preferredJobType: String,
  expectedSalary: String,
  availability: String,
  resume: {
    filename: String,
    url: String,
    uploadedAt: Date
  },
  updatedAt: Date,
  lastLoginAt: Date
});

// Simple Application schema
const ApplicationSchema = new mongoose.Schema({
  name: String,
  candidateName: String,
  email: String,
  candidateEmail: String,
  phone: String,
  userId: String,
  jobId: String,
  jobTitle: String,
  resumeFilename: String,
  resumeUrl: String,
  position: String,
  experience: String,
  status: { type: String, default: 'pending' },
  appliedDate: Date,
  interviewScheduled: {
    date: Date,
    time: String,
    mode: String,
    interviewLink: String,
    notes: String
  },
  interviewFeedback: {
    recommendation: String,
    comments: String,
    updatedAt: Date
  },
  aiScore: Number,
  score: Number,
  missingSkills: { type: [String], default: [] },
  statusHistory: { type: [mongoose.Schema.Types.Mixed], default: [] },
  updatedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const JobSchema = new mongoose.Schema({}, { strict: false, collection: 'jobs' });

const User = mongoose.model('User', UserSchema);
const Application = mongoose.model('Application', ApplicationSchema);
const Job = mongoose.model('Job', JobSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}-refresh`;
const refreshTokenBlocklist = new Set();
const DEPLOY_ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const DEPLOY_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ksreddy@2004';
const DEPLOY_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ats.local';

const signAccessToken = (user) => {
  return jwt.sign(
    {
      id: String(user._id),
      email: user.email,
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

const signRefreshToken = (user) => {
  return jwt.sign(
    {
      id: String(user._id),
      tokenType: 'refresh',
      jti: `jti-${Date.now()}-${String(user._id)}`
    },
    JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration for Render.com
app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const explicitOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://ats-system-flame.vercel.app',
      ...(process.env.CORS_ORIGIN || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    ];

    const isAllowedByHost =
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com');

    if (explicitOrigins.includes(origin) || isAllowedByHost) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  console.log('✅ Health check');
  res.json({ status: 'OK', time: new Date() });
});

// Health check for Railway
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Basic health check
app.get('/', (req, res) => {
  res.json({ message: 'ATS Basic Server Running', status: 'OK' });
});

const createApplicationRecord = async ({ payload, file, authUserId }) => {
  const jobId = String(payload.jobId || payload.job || '').trim();
  let resolvedTitle = String(payload.jobTitle || payload.position || '').trim();

  if (!resolvedTitle && jobId) {
    const matchedJob = await Job.findById(jobId).lean();
    resolvedTitle = matchedJob?.title || '';
  }

  const nextStatus = String(payload.status || '').trim().toLowerCase() || 'applied';
  const statusHistory = [
    {
      status: nextStatus,
      timestamp: new Date(),
      source: 'candidate'
    }
  ];

  const doc = await Application.create({
    name: payload.name,
    candidateName: payload.name,
    email: payload.email,
    candidateEmail: payload.email,
    phone: payload.phone || '',
    userId: authUserId || payload.userId || '',
    jobId,
    jobTitle: resolvedTitle || 'Unknown Role',
    resumeFilename: file?.originalname || payload.resumeFilename || '',
    resumeUrl: payload.resumeUrl || '',
    position: resolvedTitle || payload.position || 'Unknown Role',
    experience: payload.experience || '',
    status: nextStatus,
    appliedDate: new Date(),
    statusHistory,
    aiScore: Number(payload.aiScore || 0),
    score: Number(payload.score || 0),
    updatedAt: new Date(),
    createdAt: new Date()
  });

  return doc;
};

// Basic application endpoint
app.post('/api/applicants/apply', async (req, res) => {
  console.log('📝 Application received:', req.body);
  try {
    const application = await createApplicationRecord({
      payload: req.body || {},
      file: null,
      authUserId: ''
    });

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Error saving application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  }
});

app.post('/api/applications/apply', upload.single('resume'), async (req, res) => {
  try {
    const authCheck = verifyAccessToken(req);
    const authUserId = authCheck.ok ? String(authCheck.decoded.id || '') : '';
    const payload = req.body || {};

    if (!payload.name || !payload.email || !payload.jobId) {
      return res.status(400).json({ success: false, message: 'name, email and jobId are required' });
    }

    const application = await createApplicationRecord({
      payload,
      file: req.file || null,
      authUserId
    });

    return res.json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit application' });
  }
});

app.post('/api/jobs/apply', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.auth.id).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const payload = {
      name: user.name || req.body?.name || 'Candidate',
      email: user.email || req.body?.email,
      phone: user.phone || req.body?.phone || '',
      jobId: req.body?.jobId,
      resumeUrl: req.body?.resumeUrl || user?.resume?.url || '',
      experience: user.experience || '',
      status: 'applied'
    };

    if (!payload.jobId || !payload.email) {
      return res.status(400).json({ success: false, message: 'jobId is required' });
    }

    const alreadyApplied = await Application.findOne({
      jobId: String(payload.jobId),
      $or: [
        { userId: String(user._id) },
        { email: String(user.email).toLowerCase() }
      ],
      status: { $ne: 'withdrawn' }
    }).lean();

    if (alreadyApplied) {
      return res.status(409).json({ success: false, message: 'You already applied to this job' });
    }

    const application = await createApplicationRecord({
      payload,
      file: null,
      authUserId: String(user._id)
    });

    return res.json({ success: true, message: 'Application submitted successfully', data: application });
  } catch (error) {
    console.error('Error in quick apply:', error);
    return res.status(500).json({ success: false, message: 'Failed to apply for job' });
  }
});

// Test endpoint
app.post('/api/applicants/test-submit', (req, res) => {
  console.log('🧪 Test submission:', req.body);
  res.json({ success: true, test: 'working' });
});

// Add missing endpoints that frontend expects
app.get('/api/jobs', async (req, res) => {
  console.log('📋 Jobs requested');
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;
    const isPaginated = String(req.query.paginated || 'false').toLowerCase() === 'true';

    const search = String(req.query.search || '').trim();
    const location = String(req.query.location || '').trim();
    const experience = String(req.query.experience || '').trim();
    const jobType = String(req.query.jobType || '').trim();
    const salaryMin = Number(req.query.salaryMin);
    const sortBy = String(req.query.sortBy || 'latest').toLowerCase();

    const filter = {
      isActive: { $ne: false }
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (experience) {
      filter.experience = { $regex: experience, $options: 'i' };
    }
    if (jobType) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { jobType: { $regex: `^${jobType}$`, $options: 'i' } },
          { type: { $regex: `^${jobType}$`, $options: 'i' } }
        ]
      });
    }
    if (!Number.isNaN(salaryMin) && salaryMin > 0) {
      filter.salary = { $gte: salaryMin };
    }

    const sort = sortBy === 'oldest' ? { postedAt: 1, createdAt: 1 } : { postedAt: -1, createdAt: -1 };

    const [jobs, totalItems] = await Promise.all([
      Job.find(filter)
        .sort(sort)
        .skip(isPaginated ? skip : 0)
        .limit(isPaginated ? limit : 100)
        .lean(),
      Job.countDocuments(filter)
    ]);

    console.log(`✅ Returning ${jobs.length} jobs from MongoDB`);
    return res.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit))
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch jobs' });
  }
});

app.post(['/api/auth/user-register', '/api/auth/register'], async (req, res) => {
  console.log('👤 User registration:', req.body);
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Create new user
    const user = new User({ name, email, password, role: 'user' });
    await user.save();
    
    res.json({ 
      success: true,
      message: 'User registered successfully',
      user: { name, email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed'
    });
  }
});

app.post('/api/auth/user-login', async (req, res) => {
  console.log('👤 User login attempt:', req.body);
  try {
    const { email, password } = req.body;
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    
    // Find user in database and support both hashed and legacy plaintext passwords.
    const user = await User.findOne({ email });
    let userPasswordMatched = false;
    if (user) {
      try {
        userPasswordMatched = await bcrypt.compare(password, user.password);
      } catch (_err) {
        userPasswordMatched = false;
      }

      if (!userPasswordMatched && user.password === password) {
        userPasswordMatched = true;
      }
    }

    if (user && userPasswordMatched) {
      const token = signAccessToken(user);
      const refreshToken = signRefreshToken(user);

      res.json({ 
        success: true,
        message: 'User login successful',
        data: {
          token,
          refreshToken,
          user: { email: user.email, name: user.name, id: user._id, role: user.role || 'user' }
        }
      });
    } else {
      res.status(401).json({ 
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed'
    });
  }
});

app.post('/api/auth/admin-login', async (req, res) => {
  console.log('👨‍💼 Admin login attempt:', req.body);
  const { username, password } = req.body;
  try {
    const isEnvAdminEnabled = Boolean(DEPLOY_ADMIN_USERNAME && DEPLOY_ADMIN_PASSWORD);
    if (isEnvAdminEnabled && username === DEPLOY_ADMIN_USERNAME && password === DEPLOY_ADMIN_PASSWORD) {
      const envAdminUser = {
        _id: 'env-admin',
        email: DEPLOY_ADMIN_EMAIL,
        role: 'admin',
        username: DEPLOY_ADMIN_USERNAME,
        name: DEPLOY_ADMIN_USERNAME
      };
      const token = signAccessToken(envAdminUser);
      const refreshToken = signRefreshToken(envAdminUser);

      return res.json({
        success: true,
        message: 'Admin login successful',
        data: {
          token,
          refreshToken,
          admin: { username: DEPLOY_ADMIN_USERNAME, role: 'admin', id: 'env-admin' }
        }
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    
    // Try database first and support legacy records that used `username` field.
    const admin = await User.findOne({ 
      $or: [
        { email: username, role: 'admin' },
        { name: username, role: 'admin' },
        { username: username, role: 'admin' }
      ],
    });

    let adminPasswordMatched = false;
    if (admin) {
      try {
        adminPasswordMatched = await bcrypt.compare(password, admin.password);
      } catch (_err) {
        adminPasswordMatched = false;
      }

      if (!adminPasswordMatched && admin.password === password) {
        adminPasswordMatched = true;
      }
    }
    
    if (admin && adminPasswordMatched) {
      const token = signAccessToken(admin);
      const refreshToken = signRefreshToken(admin);

      res.json({ 
        success: true,
        message: 'Admin login successful',
        data: {
          token,
          refreshToken,
          admin: { username: admin.username || admin.name || admin.email, role: 'admin', id: admin._id }
        }
      });
    } else {
      res.status(401).json({ 
        success: false,
        message: 'Invalid admin credentials'
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Admin login failed'
    });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    if (refreshTokenBlocklist.has(refreshToken)) {
      return res.status(401).json({ success: false, message: 'Refresh token revoked' });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    if (decoded.tokenType !== 'refresh' || !decoded.id) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    if (decoded.id === 'env-admin' && DEPLOY_ADMIN_USERNAME && DEPLOY_ADMIN_PASSWORD) {
      const envAdminUser = {
        _id: 'env-admin',
        email: DEPLOY_ADMIN_EMAIL,
        role: 'admin'
      };
      const nextAccessToken = signAccessToken(envAdminUser);
      const nextRefreshToken = signRefreshToken(envAdminUser);
      refreshTokenBlocklist.add(refreshToken);

      return res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: nextAccessToken,
          refreshToken: nextRefreshToken
        }
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found for refresh token' });
    }

    const nextAccessToken = signAccessToken(user);
    const nextRefreshToken = signRefreshToken(user);
    refreshTokenBlocklist.add(refreshToken);

    return res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: nextAccessToken,
        refreshToken: nextRefreshToken
      }
    });
  } catch (_error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const { refreshToken } = req.body || {};
  if (refreshToken) {
    refreshTokenBlocklist.add(refreshToken);
  }

  return res.json({ success: true, message: 'Logged out successfully' });
});

const defaultSystemSettings = {
  autoProcessing: {
    enabled: true,
    approvalThreshold: 70,
    interviewThreshold: 60,
    rejectionThreshold: 40,
    schedule: 'manual'
  },
  application: {
    maxFileSizeMB: 5,
    allowedFileTypes: ['pdf', 'doc', 'docx'],
    autoCloseAfterDays: 30
  },
  email: {
    enabled: false,
    adminNotifications: {
      newApplication: true,
      systemAlerts: true,
      weeklyReport: false
    }
  },
  security: {
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15
  },
  system: {
    companyInfo: {
      name: 'ATS System',
      website: '',
      email: '',
      phone: ''
    },
    timezone: 'UTC',
    dateFormat: 'DD/MM/YYYY',
    language: 'en',
    theme: {
      mode: 'light'
    }
  },
  dataManagement: {
    retentionPolicyDays: 365,
    autoDeleteOldApplications: false,
    auditLogging: true
  },
  integrations: {
    calendar: { enabled: false, provider: 'none' },
    notifications: {
      slack: { enabled: false },
      teams: { enabled: false }
    }
  }
};

let runtimeSettings = { ...defaultSystemSettings };

function verifyAccessToken(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return { ok: false, reason: 'Authentication token required' };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { ok: true, decoded };
  } catch (_error) {
    return { ok: false, reason: 'Invalid or expired token' };
  }
}

function requireAuth(req, res, next) {
  const authCheck = verifyAccessToken(req);
  if (!authCheck.ok) {
    return res.status(401).json({ success: false, message: authCheck.reason });
  }

  req.auth = authCheck.decoded;
  return next();
}

function requireAdminOrRecruiter(req, res, next) {
  const authCheck = verifyAccessToken(req);
  if (!authCheck.ok) {
    return res.status(401).json({ success: false, message: authCheck.reason });
  }

  const role = String(authCheck.decoded.role || '').toLowerCase();
  if (!['admin', 'recruiter'].includes(role)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }

  req.auth = authCheck.decoded;
  return next();
}

app.get('/api/users', requireAdminOrRecruiter, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;
    const search = String(req.query.search || '').trim();
    const role = String(req.query.role || '').trim();

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role && role !== 'all') {
      filter.role = role;
    }

    const [users, totalItems] = await Promise.all([
      User.find(filter)
        .select('name email role isActive createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data: users,
      meta: {
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.max(1, Math.ceil(totalItems / limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

app.post('/api/users', requireAdminOrRecruiter, async (req, res) => {
  try {
    const { name, email, role = 'candidate', password = 'password123' } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'name and email are required' });
    }

    const existingUser = await User.findOne({ email: String(email).toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password: hashedPassword,
      role,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

app.put('/api/users/:id/role', requireAdminOrRecruiter, async (req, res) => {
  try {
    const { role } = req.body || {};
    if (!role) {
      return res.status(400).json({ success: false, message: 'role is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
});

app.put('/api/users/:id/active', requireAdminOrRecruiter, async (req, res) => {
  try {
    const isActive = Boolean(req.body?.isActive);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error toggling user active state:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
});

app.post('/api/users/bulk/active', requireAdminOrRecruiter, async (req, res) => {
  try {
    const userIds = Array.isArray(req.body?.userIds) ? req.body.userIds : [];
    if (!userIds.length) {
      return res.status(400).json({ success: false, message: 'No users selected' });
    }

    const isActive = Boolean(req.body?.isActive);
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { isActive, updatedAt: new Date() } }
    );

    return res.json({ success: true, data: { modifiedCount: result.modifiedCount } });
  } catch (error) {
    console.error('Error bulk updating users:', error);
    return res.status(500).json({ success: false, message: 'Failed to bulk update users' });
  }
});

app.delete('/api/users/:id', requireAdminOrRecruiter, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

app.get('/api/settings', requireAdminOrRecruiter, (req, res) => {
  return res.json({ success: true, settings: runtimeSettings });
});

app.put('/api/settings', requireAdminOrRecruiter, (req, res) => {
  const updates = req.body || {};
  runtimeSettings = {
    ...runtimeSettings,
    ...updates,
    system: {
      ...runtimeSettings.system,
      ...(updates.system || {})
    },
    autoProcessing: {
      ...runtimeSettings.autoProcessing,
      ...(updates.autoProcessing || {})
    },
    application: {
      ...runtimeSettings.application,
      ...(updates.application || {})
    },
    email: {
      ...runtimeSettings.email,
      ...(updates.email || {})
    },
    security: {
      ...runtimeSettings.security,
      ...(updates.security || {})
    },
    dataManagement: {
      ...runtimeSettings.dataManagement,
      ...(updates.dataManagement || {})
    },
    integrations: {
      ...runtimeSettings.integrations,
      ...(updates.integrations || {})
    }
  };

  return res.json({ success: true, settings: runtimeSettings, message: 'Settings updated' });
});

app.post('/api/settings/reset', requireAdminOrRecruiter, (req, res) => {
  runtimeSettings = { ...defaultSystemSettings };
  return res.json({ success: true, settings: runtimeSettings, message: 'Settings reset to defaults' });
});

app.get('/api/audit-logs', requireAdminOrRecruiter, (req, res) => {
  return res.json({ success: true, data: [] });
});

app.get('/api/notifications', requireAuth, (req, res) => {
  return res.json({ success: true, data: [], unreadCount: 0 });
});

app.put('/api/notifications/:id/read', requireAuth, (req, res) => {
  return res.json({ success: true, message: 'Notification marked as read' });
});

app.put('/api/notifications/read-all', requireAuth, (req, res) => {
  return res.json({ success: true, message: 'Notifications marked as read' });
});

app.get('/api/applications', requireAdminOrRecruiter, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const [applications, totalItems] = await Promise.all([
      Application.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Application.countDocuments()
    ]);

    return res.json({
      success: true,
      data: applications,
      meta: {
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.max(1, Math.ceil(totalItems / limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
});

app.get('/api/interviews/upcoming', requireAdminOrRecruiter, async (req, res) => {
  try {
    const interviews = await Application.find({
      'interviewScheduled.date': { $exists: true, $ne: null }
    })
      .sort({ 'interviewScheduled.date': 1 })
      .limit(100)
      .lean();

    return res.json({ success: true, data: interviews });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch interview data' });
  }
});

app.put('/api/interviews/:id/schedule', requireAdminOrRecruiter, async (req, res) => {
  try {
    const { date, time, mode, interviewLink, notes } = req.body || {};
    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          interviewScheduled: {
            date,
            time,
            mode,
            interviewLink: interviewLink || '',
            notes: notes || ''
          },
          status: 'interview_scheduled'
        }
      },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    return res.json({ success: true, data: updated, message: 'Interview scheduled' });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    return res.status(500).json({ success: false, message: 'Failed to schedule interview' });
  }
});

app.put('/api/interviews/:id/feedback', requireAdminOrRecruiter, async (req, res) => {
  try {
    const { recommendation, comments } = req.body || {};
    const nextStatus = recommendation === 'hire' ? 'approved' : recommendation === 'no_hire' ? 'rejected' : 'under_review';
    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          interviewFeedback: {
            recommendation: recommendation || '',
            comments: comments || '',
            updatedAt: new Date()
          },
          status: nextStatus
        }
      },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    return res.json({ success: true, data: updated, message: 'Interview feedback saved' });
  } catch (error) {
    console.error('Error saving interview feedback:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit interview feedback' });
  }
});

app.post('/api/ai/screen', requireAdminOrRecruiter, async (req, res) => {
  try {
    const jobId = req.body?.jobId;
    const query = jobId ? { jobId } : {};
    const applications = await Application.find(query).sort({ createdAt: -1 }).limit(100).lean();

    const scored = applications.map((item) => {
      const base = Number(item.aiScore || item.score || 0);
      const aiScore = Math.max(0, Math.min(100, base || 50));
      return {
        ...item,
        aiScore,
        score: aiScore,
        matchPercentage: aiScore,
        missingSkills: Array.isArray(item.missingSkills) ? item.missingSkills : []
      };
    });

    return res.json({ success: true, data: scored, message: 'AI screening completed' });
  } catch (error) {
    console.error('Error running AI screening:', error);
    return res.status(500).json({ success: false, message: 'AI screening failed' });
  }
});

app.put('/api/ai/screen/:id', requireAdminOrRecruiter, async (req, res) => {
  try {
    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: { aiScore: 70, score: 70, updatedAt: new Date() } },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    return res.json({ success: true, data: updated, message: 'Application screened' });
  } catch (error) {
    console.error('Error screening application:', error);
    return res.status(500).json({ success: false, message: 'AI screening failed' });
  }
});

const buildCandidateApplicationQuery = (userDoc) => {
  const clauses = [];

  if (userDoc?._id) {
    clauses.push({ userId: String(userDoc._id) });
    clauses.push({ userId: userDoc._id });
    clauses.push({ candidateId: String(userDoc._id) });
    clauses.push({ candidateId: userDoc._id });
    clauses.push({ createdBy: String(userDoc._id) });
    clauses.push({ createdBy: userDoc._id });
  }

  if (userDoc?.email) {
    const normalizedEmail = String(userDoc.email).toLowerCase();
    clauses.push({ email: normalizedEmail });
    clauses.push({ candidateEmail: normalizedEmail });
    clauses.push({ userEmail: normalizedEmail });
    clauses.push({ applicantEmail: normalizedEmail });
  }

  if (!clauses.length) {
    return { _id: null };
  }

  return { $or: clauses };
};

app.get('/api/users/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.auth.id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ success: false, message: 'Failed to load profile' });
  }
});

app.put('/api/users/me', requireAuth, async (req, res) => {
  try {
    const updates = {
      name: req.body?.name,
      phone: req.body?.phone,
      location: req.body?.location,
      skills: Array.isArray(req.body?.skills) ? req.body.skills : undefined,
      experience: req.body?.experience,
      education: req.body?.education,
      summary: req.body?.summary,
      linkedIn: req.body?.linkedIn,
      github: req.body?.github,
      portfolio: req.body?.portfolio,
      preferredJobType: req.body?.preferredJobType,
      expectedSalary: req.body?.expectedSalary,
      availability: req.body?.availability,
      updatedAt: new Date()
    };

    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.auth.id, updates, { new: true }).select('-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: user, message: 'Profile updated' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

app.put('/api/users/me/resume', requireAuth, async (req, res) => {
  try {
    const { filename, url } = req.body || {};
    if (!filename || !url) {
      return res.status(400).json({ success: false, message: 'filename and url are required' });
    }

    const user = await User.findByIdAndUpdate(
      req.auth.id,
      {
        resume: {
          filename,
          url,
          uploadedAt: new Date()
        },
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password').lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: user, message: 'Resume updated' });
  } catch (error) {
    console.error('Error updating resume:', error);
    return res.status(500).json({ success: false, message: 'Failed to update resume' });
  }
});

app.post('/api/users/me/resume/parse', requireAuth, async (req, res) => {
  try {
    const text = String(req.body?.text || '').toLowerCase();
    if (!text.trim()) {
      return res.status(400).json({ success: false, message: 'text is required' });
    }

    const knownSkills = [
      'javascript', 'typescript', 'react', 'node', 'node.js', 'express', 'mongodb', 'sql', 'python', 'java', 'aws',
      'docker', 'kubernetes', 'html', 'css', 'redux', 'graphql'
    ];
    const extractedSkills = knownSkills.filter((skill) => text.includes(skill));

    if (extractedSkills.length) {
      await User.findByIdAndUpdate(
        req.auth.id,
        { $addToSet: { skills: { $each: extractedSkills } }, updatedAt: new Date() }
      );
    }

    return res.json({ success: true, data: { extractedSkills } });
  } catch (error) {
    console.error('Error parsing resume:', error);
    return res.status(500).json({ success: false, message: 'Failed to parse resume' });
  }
});

app.get('/api/applications/mine', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.auth.id).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const includeWithdrawn = String(req.query?.includeWithdrawn || 'false').toLowerCase() === 'true';
    const query = buildCandidateApplicationQuery(user);
    if (!includeWithdrawn) {
      query.status = { $ne: 'withdrawn' };
    }

    const applications = await Application.find(query).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching my applications:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch your applications' });
  }
});

app.get('/api/applications/mine/stats', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.auth.id).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const query = buildCandidateApplicationQuery(user);
    const applications = await Application.find(query).lean();

    const stats = {
      total: applications.length,
      pending: applications.filter((item) => ['pending', 'applied'].includes(String(item.status || '').toLowerCase())).length,
      underReview: applications.filter((item) => ['reviewing', 'shortlisted', 'under_review', 'screening'].includes(String(item.status || '').toLowerCase())).length,
      approved: applications.filter((item) => ['approved', 'selected', 'offer'].includes(String(item.status || '').toLowerCase())).length,
      rejected: applications.filter((item) => ['rejected', 'withdrawn'].includes(String(item.status || '').toLowerCase())).length
    };

    return res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching my application stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch application statistics' });
  }
});

app.post('/api/applications/:id/withdraw', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.auth.id).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const ownershipQuery = buildCandidateApplicationQuery(user);
    const updated = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: ownershipQuery.$or || []
      },
      {
        $set: {
          status: 'withdrawn',
          updatedAt: new Date()
        }
      },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    return res.json({ success: true, application: updated, message: 'Application withdrawn' });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    return res.status(500).json({ success: false, message: 'Failed to withdraw application' });
  }
});

app.get('/api/auth/my-applications', async (req, res) => {
  console.log('📋 My applications requested');
  try {
    const authCheck = verifyAccessToken(req);
    if (!authCheck.ok) {
      return res.status(401).json({ success: false, message: authCheck.reason });
    }

    const user = await User.findById(authCheck.decoded.id).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const applications = await Application.find(buildCandidateApplicationQuery(user)).sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications', applications: [] });
  }
});

app.get('/api/auth/application-stats', async (req, res) => {
  console.log('📊 Application stats requested');
  try {
    const authCheck = verifyAccessToken(req);
    if (!authCheck.ok) {
      return res.status(401).json({ success: false, message: authCheck.reason });
    }

    const user = await User.findById(authCheck.decoded.id).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const applications = await Application.find(buildCandidateApplicationQuery(user)).lean();
    const stats = {
      total: applications.length,
      pending: applications.filter((item) => ['pending', 'applied'].includes(String(item.status || '').toLowerCase())).length,
      approved: applications.filter((item) => ['approved', 'selected', 'offer'].includes(String(item.status || '').toLowerCase())).length,
      rejected: applications.filter((item) => ['rejected', 'withdrawn'].includes(String(item.status || '').toLowerCase())).length,
      underReview: applications.filter((item) => ['reviewing', 'shortlisted', 'under_review', 'screening'].includes(String(item.status || '').toLowerCase())).length
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats', stats: { total: 0, pending: 0, approved: 0, rejected: 0, underReview: 0 } });
  }
});

// Analytics endpoints
app.get('/api/analytics/dashboard/full-data', async (req, res) => {
  console.log('📊 Full analytics dashboard data requested');
  try {
    const totalApplications = await Application.countDocuments();
    const totalJobs = await Job.countDocuments({ isActive: { $ne: false } });
    const totalUsers = await User.countDocuments();
    
    res.json({
      success: true,
      data: {
        totalApplications,
        totalJobs,
        totalUsers,
        applicationsByStatus: {
          pending: await Application.countDocuments({ status: 'pending' }),
          approved: await Application.countDocuments({ status: 'approved' }),
          rejected: await Application.countDocuments({ status: 'rejected' })
        },
        recentApplications: await Application.find().sort({ createdAt: -1 }).limit(10)
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics data' });
  }
});

app.get('/api/reports/summary', async (req, res) => {
  console.log('📈 Reports summary requested');
  try {
    res.json({
      success: true,
      data: {
        totalApplications: await Application.countDocuments(),
        totalJobs: await Job.countDocuments({ isActive: { $ne: false } }),
        conversionRate: 0,
        averageTimeToHire: 0
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports summary' });
  }
});

// Catch all API routes
app.use('/api', (req, res) => {
  console.log(`❓ Unknown API route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Endpoint not found (basic server mode)',
    method: req.method,
    path: req.originalUrl 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Basic server running on port ${PORT}`);
});