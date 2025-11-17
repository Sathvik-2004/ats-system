# 🔄 Update Vercel Frontend for Cyclic.sh Backend

## 🎯 Quick Update Guide

Since your frontend is already deployed at `https://ats-system-flame.vercel.app`, you just need to update the backend URL configuration.

---

## 🚀 Steps to Update

### Step 1: Get Your Cyclic.sh Backend URL
After deploying to Cyclic.sh, you'll get a URL like:
```
https://ats-system-backend-xyz.cyclic.app
```

### Step 2: Update Vercel Environment Variables

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to **https://vercel.com/dashboard**
2. Find your **ats-system-flame** project
3. Click **Settings** → **Environment Variables**
4. Find `REACT_APP_API_URL` and **Edit**
5. Change from:
   ```
   https://lessats-systemgreater-production.up.railway.app
   ```
   To:
   ```
   https://your-cyclic-app.cyclic.app
   ```
6. Click **Save**

**Option B: Via Vercel CLI**
```powershell
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variable
cd client
vercel env add REACT_APP_API_URL production
# Enter: https://your-cyclic-app.cyclic.app
```

### Step 3: Redeploy Frontend
**Automatic Method:**
1. Push any small change to your GitHub repo
2. Vercel will auto-deploy with new environment variables

**Manual Method:**
```powershell
# Via Vercel CLI
cd client
vercel --prod
```

**Dashboard Method:**
1. Go to **Deployments** tab in Vercel
2. Click **"Redeploy"** on latest deployment

---

## 🔧 Frontend Configuration Files

### Update vercel.json (if needed):
```json
{
  "framework": "create-react-app",
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "installCommand": "npm install",
  "env": {
    "REACT_APP_API_URL": "https://your-cyclic-app.cyclic.app"
  }
}
```

### Update client/.env.production:
```env
REACT_APP_API_URL=https://your-cyclic-app.cyclic.app
CI=false
GENERATE_SOURCEMAP=false
```

---

## 🧪 Testing the Integration

### 1. Test Backend Health:
```powershell
curl https://your-cyclic-app.cyclic.app/health
```

### 2. Test Frontend API Calls:
1. Open: **https://ats-system-flame.vercel.app**
2. Check browser console for API calls
3. Test login functionality
4. Verify job applications work

### 3. Expected API Endpoints:
```
✅ https://your-cyclic-app.cyclic.app/health
✅ https://your-cyclic-app.cyclic.app/api/status
✅ https://your-cyclic-app.cyclic.app/api/admin/login
✅ https://your-cyclic-app.cyclic.app/api/jobs
✅ https://your-cyclic-app.cyclic.app/api/applications
```

---

## 🎯 Complete Free Setup

After this update, you'll have:

### ✅ **Frontend (Vercel - FREE):**
- URL: `https://ats-system-flame.vercel.app`
- Features: React app, CDN, Custom domain
- Cost: **$0 forever**

### ✅ **Backend (Cyclic.sh - FREE):**  
- URL: `https://your-app.cyclic.app`
- Features: Node.js, No hibernation, Auto-deploy
- Cost: **$0 forever**

### ✅ **Database (MongoDB Atlas - FREE):**
- Storage: 512MB free tier
- Features: Cloud database, Global access
- Cost: **$0 forever**

---

## 🔍 Verification Checklist

### After Update:
- [ ] Vercel environment variable updated
- [ ] Frontend redeployed successfully  
- [ ] Backend responding to health checks
- [ ] Database connection working
- [ ] Frontend can call backend APIs
- [ ] Login functionality works
- [ ] Job applications can be submitted

### If Issues:
1. **Check browser console** for errors
2. **Verify CORS settings** in backend
3. **Test API endpoints directly**
4. **Clear browser cache**
5. **Check Vercel deployment logs**

---

## 📞 Next Steps

Once everything is working:
1. **Test all features** thoroughly
2. **Update any documentation** with new URLs
3. **Share the live application** with users
4. **Monitor performance** and usage

**Your ATS system is now running 100% free forever! 🎉**