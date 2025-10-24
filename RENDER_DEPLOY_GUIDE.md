# Render Deployment Guide for ATS System

## 🚀 Quick Deploy to Render.com

### Step 1: Prepare Repository
✅ Repository is already prepared with all necessary files

### Step 2: Deploy to Render

1. **Go to Render.com**: https://render.com/
2. **Sign up/Login** with your GitHub account
3. **Click "New +"** → **"Web Service"**
4. **Connect Repository**: `Sathvik-2004/ats-system`
5. **Configure Service**:
   - **Name**: `ats-system-backend`
   - **Environment**: `Node`
   - **Region**: `Oregon (US West)` (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

### Step 3: Environment Variables
Add these environment variables in Render dashboard:

**Required:**
- `MONGO_URI`: (Your MongoDB Atlas connection string)
- `JWT_SECRET`: (Your JWT secret)
- `NODE_ENV`: `production`

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. You'll get a URL like: `https://ats-system-backend.onrender.com`

### Step 5: Update Frontend
Update your frontend API configuration to use the new Render URL.

---

## 🔧 Automated Deployment Commands

Run these commands to commit and prepare for Render:

```bash
# Commit Render configuration
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

Then follow the Render dashboard steps above.

---

## ✅ Benefits of Render vs Railway

- ✅ **More reliable deployments** 
- ✅ **Better incident handling**
- ✅ **Free tier available**
- ✅ **Automatic HTTPS**
- ✅ **GitHub integration**

---

## 🧪 Testing After Deployment

Once deployed, test your new Render URL:

```bash
# Test health
curl https://your-render-url.onrender.com/api/jobs

# Test application submission
curl -X POST https://your-render-url.onrender.com/api/applicants/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test User","email":"test@example.com","jobId":"VALID_JOB_ID"}'
```

## 📱 Update Frontend Configuration

Update `client/src/config/api.js` with your new Render URL:

```javascript
const API_CONFIG = {
  BASE_URL: 'https://your-render-url.onrender.com',
  // ... rest of config
};
```

---

**Expected deployment time: 5-10 minutes total** 🚀