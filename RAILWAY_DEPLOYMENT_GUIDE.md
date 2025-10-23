🚀 RAILWAY DEPLOYMENT STEP-BY-STEP GUIDE
===============================================

## CURRENT STATUS: Ready to Deploy Backend

### Step 1: Deploy to Railway (DO THIS NOW)

1. **Go to Railway Dashboard:**
   - Open: https://railway.app/dashboard
   - Make sure you're logged in with your GitHub account

2. **Create New Project:**
   - Click "New Project" button
   - Select "Deploy from GitHub repo"
   - Choose "Sathvik-2004/ats-system" repository
   
3. **CRITICAL CONFIGURATION:**
   - ⚠️ ROOT DIRECTORY: Set to "server" (not root)
   - ⚠️ Build Command: npm install
   - ⚠️ Start Command: npm run production

4. **Environment Variables to Set:**
   ```
   NODE_ENV=production
   PORT=${{RAILWAY_PUBLIC_PORT}}
   MONGO_URI=mongodb+srv://sathwikreddy9228_db_user:AtsSystem2024%21@ats-production-cluster.gl3adlt.mongodb.net/ats_production?retryWrites=true&w=majority&appName=ats-production-cluster
   JWT_SECRET=ats_super_secure_jwt_secret_for_production_2024_change_this_key
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:3000
   ```

5. **After Deployment:**
   - Copy the generated Railway URL (e.g., https://ats-system-production-xxxx.up.railway.app)
   - Test the API endpoints
   - Save the URL for frontend configuration

### Expected Railway URL Format:
`https://[project-name]-production-[hash].up.railway.app`

---

## Next: Frontend Deployment to Vercel
(Will proceed once Railway backend is live)

## Files Ready for Deployment:
✅ server.js - Main server file
✅ package.json - Dependencies and scripts
✅ railway.json - Railway configuration
✅ Procfile - Process configuration
✅ All route files and models
✅ MongoDB connection configured