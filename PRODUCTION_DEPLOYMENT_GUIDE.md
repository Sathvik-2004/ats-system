# 🚀 ATS System Production Deployment Guide

## 📋 Overview
This guide covers deploying your enterprise ATS system to production with:
- **Backend**: Heroku (Node.js/Express/MongoDB)
- **Frontend**: Vercel (React.js)
- **Database**: MongoDB Atlas

## 🛠️ Prerequisites
- Git repository (GitHub/GitLab)
- Heroku account
- Vercel account
- MongoDB Atlas account

## 📦 Phase 1: Database Setup (MongoDB Atlas)

### 1.1 Create MongoDB Atlas Cluster
```bash
1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string
```

### 1.2 Update Environment Variables
Replace in `.env.production`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ats_production
```

## 🖥️ Phase 2: Backend Deployment (Heroku)

### 2.1 Prepare Repository
```bash
# Navigate to server directory
cd server

# Initialize git if not done
git init
git add .
git commit -m "Initial commit"
```

### 2.2 Deploy to Heroku
```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create your-ats-backend

# Set environment variables
heroku config:set MONGO_URI="your_mongodb_atlas_connection_string"
heroku config:set JWT_SECRET="your_secure_jwt_secret"
heroku config:set NODE_ENV="production"
heroku config:set CORS_ORIGIN="https://your-frontend-domain.vercel.app"

# Deploy
git push heroku main
```

### 2.3 Verify Backend
```bash
# Check logs
heroku logs --tail

# Test API endpoint
curl https://your-ats-backend.herokuapp.com/api/test
```

## 🌐 Phase 3: Frontend Deployment (Vercel)

### 3.1 Update Environment Variables
Update `client/.env.production`:
```env
REACT_APP_API_URL=https://your-ats-backend.herokuapp.com
```

### 3.2 Deploy to Vercel
```bash
# Navigate to client directory
cd client

# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod

# Or use Vercel Dashboard:
# 1. Connect GitHub repository
# 2. Set root directory to "client"
# 3. Add environment variables
# 4. Deploy
```

## 🔧 Phase 4: Configuration & Testing

### 4.1 Update CORS Settings
Update backend CORS origin with actual Vercel URL:
```bash
heroku config:set CORS_ORIGIN="https://your-actual-vercel-url.vercel.app"
```

### 4.2 Test Complete System
1. **Frontend**: Visit Vercel URL
2. **User Registration**: Test user signup/login
3. **Admin Panel**: Test admin login
4. **Job Applications**: Submit test application
5. **File Uploads**: Test resume upload
6. **Email Notifications**: Verify email delivery

## 📊 Phase 5: Production Monitoring

### 5.1 Backend Monitoring
```bash
# Check Heroku metrics
heroku logs --tail
heroku ps:scale web=1

# Monitor database
# Use MongoDB Atlas monitoring dashboard
```

### 5.2 Frontend Monitoring
- Use Vercel Analytics dashboard
- Monitor Core Web Vitals
- Check deployment logs

## 🔐 Security Checklist

### 5.1 Environment Variables
- ✅ Strong JWT secret (32+ characters)
- ✅ Secure MongoDB credentials
- ✅ CORS properly configured
- ✅ No sensitive data in code

### 5.2 Database Security
- ✅ Database user with limited permissions
- ✅ IP whitelist configured
- ✅ Connection string secured

## 🚨 Common Issues & Solutions

### Issue 1: CORS Errors
**Solution**: Update CORS_ORIGIN with exact frontend URL

### Issue 2: Database Connection Failed
**Solution**: Check MongoDB Atlas IP whitelist and connection string

### Issue 3: File Upload Errors
**Solution**: Verify upload directory exists and permissions

### Issue 4: Build Failures
**Solution**: Check package.json scripts and dependencies

## 📞 Production URLs
- **Frontend**: https://your-ats-frontend.vercel.app
- **Backend**: https://your-ats-backend.herokuapp.com
- **Database**: MongoDB Atlas cluster

## 🎉 Next Steps After Deployment
1. **Domain Setup**: Configure custom domain
2. **SSL Certificates**: Ensure HTTPS (automatic on Vercel/Heroku)
3. **Backup Strategy**: Set up database backups
4. **Monitoring**: Set up application monitoring
5. **Documentation**: Create user guides
6. **Maintenance**: Schedule regular updates

---

## 🆘 Support Commands

### Backend Troubleshooting
```bash
# Check Heroku app status
heroku ps

# View logs
heroku logs --tail

# Restart app
heroku restart

# Run one-off dyno
heroku run node server.js
```

### Frontend Troubleshooting
```bash
# Check build logs
vercel logs

# Redeploy
vercel --prod

# Check deployment status
vercel ls
```

Your enterprise ATS system is now ready for production! 🎉