# 🚀 LIVE DEPLOYMENT GUIDE

## STEP 1: Deploy Backend to Railway (IN PROGRESS)

### Current Status: Railway New Project page is open

1. **On Railway (railway.app/new):**
   - Click "Deploy from GitHub repo"
   - Select "Sathvik-2004/ats-system" repository
   - ⚠️ IMPORTANT: Set root directory to `server` 
   - Click "Deploy"

2. **After initial deployment, set these environment variables:**
   ```
   NODE_ENV=production
   PORT=${{RAILWAY_PUBLIC_PORT}}
   MONGO_URI=mongodb+srv://sathwikreddy9228_db_user:AtsSystem2024%21@ats-production-cluster.gl3adlt.mongodb.net/ats_production?retryWrites=true&w=majority&appName=ats-production-cluster
   JWT_SECRET=ats_super_secure_jwt_secret_for_production_2024_change_this_key
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:3000
   ```

3. **Get your Railway URL:**
   - After deployment, copy the generated URL (format: https://service-name.up.railway.app)
   - Save this URL - we'll need it for the frontend

### Expected Railway URL format:
`https://[generated-name].up.railway.app`

---

## STEP 2: Deploy Frontend to Vercel (NEXT)

Will update with Vercel steps once backend is deployed...

---

## Current Environment Status:
- ✅ MongoDB Atlas: Connected and populated
- ✅ GitHub Repo: All code pushed
- 🟡 Railway Backend: In deployment
- ⏳ Vercel Frontend: Waiting for backend URL
- ⏳ Cross-linking: Pending both deployments

## Admin Login:
- Username: `admin`
- Password: `ksreddy@2004`

## Test User Login:
- Email: `sathwikreddy9228@gmail.com`
- Password: `password123`