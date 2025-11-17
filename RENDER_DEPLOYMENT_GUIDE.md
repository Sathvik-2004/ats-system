# 🚀 RENDER.COM DEPLOYMENT GUIDE - FREE TIER

## 🎯 Deploy Your ATS Backend to Render (FREE)

### ✅ What You Get FREE:
- ✅ **512 MB RAM, 0.1 CPU**
- ✅ **750 hours/month** (≈25 days)
- ⚠️ **Sleeps after 15 min** (wakes in 30 sec)
- ✅ **No credit card required**
- ✅ **SSL/HTTPS included**
- ✅ **Custom domains**

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### Step 1: Go to Render.com
1. **Open:** https://render.com
2. **Click:** "Get Started for Free"
3. **Sign up:** with GitHub account
4. **Authorize:** Render to access repositories

### Step 2: Create Web Service
1. **Click:** "New +" → "Web Service"
2. **Connect:** your GitHub repository
3. **Select:** `Sathvik-2004/ats-system`
4. **Click:** "Connect"

### Step 3: Configure Your Service
**Basic Settings:**
```
Name: ats-system-backend
Environment: Node
Region: Oregon (US West) or closest to you
Branch: main
Root Directory: server
```

**Build & Deploy:**
```
Build Command: npm install
Start Command: npm start
```

**Instance Type:**
```
Select: Free (Free - $0/month)
```

### Step 4: Environment Variables
**Click "Advanced"** and add these environment variables:

**Required:**
```
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://sathwikreddy9228_db_user:AtsSystem2024%21@ats-production-cluster.gl3adlt.mongodb.net/ats_production?retryWrites=true&w=majority&appName=ats-production-cluster
```

**Optional (for enhanced features):**
```
JWT_SECRET=your_secure_jwt_secret_here
CORS_ORIGIN=https://ats-system-flame.vercel.app
```

### Step 5: Deploy!
1. **Click:** "Create Web Service"
2. **Wait:** 3-5 minutes for build and deployment
3. **Watch:** the build logs for any errors

---

## 🎯 AFTER DEPLOYMENT

### Your New Backend URL:
```
https://ats-system-backend.onrender.com
```

### Test Your Deployment:
Open these URLs in browser:

**Health Check:**
```
https://ats-system-backend.onrender.com/health
```

**API Status:**
```
https://ats-system-backend.onrender.com/api/status
```

### Expected Response:
```json
{
  "status": "OK",
  "timestamp": "2025-11-17T...",
  "uptime": 123.45,
  "database": "connected"
}
```

---

## 🔧 UPDATE VERCEL FRONTEND

### Step 1: Update Environment Variables
1. **Go to:** https://vercel.com/dashboard
2. **Select:** ats-system-flame project
3. **Go to:** Settings → Environment Variables
4. **Edit:** `REACT_APP_API_URL`
5. **Change to:** `https://ats-system-backend.onrender.com`
6. **Save**

### Step 2: Redeploy Frontend
**Option A (Automatic):**
- Push any small change to GitHub
- Vercel will auto-redeploy

**Option B (Manual):**
- Go to Deployments tab
- Click "Redeploy" on latest deployment

---

## 🧪 TESTING YOUR FULL SETUP

### Test Backend:
```powershell
# Test health
curl https://ats-system-backend.onrender.com/health

# Test API
curl https://ats-system-backend.onrender.com/api/status
```

### Test Frontend:
1. **Visit:** https://ats-system-flame.vercel.app
2. **Check:** Browser console for API calls
3. **Test:** Login functionality
4. **Verify:** Job applications work

---

## ⚠️ IMPORTANT: FREE TIER LIMITATIONS

### Sleep Behavior:
- **Sleeps:** After 15 minutes of no requests
- **Wakes:** In ~30 seconds when accessed
- **Solution:** First visitor may wait 30 seconds

### Monthly Limits:
- **750 hours/month** ≈ 25 days of uptime
- **Resets:** Every month
- **If exceeded:** Service suspends until next month

### Performance:
- **512 MB RAM** - Sufficient for your ATS app
- **0.1 CPU** - Good for light to moderate traffic

---

## 🔧 TROUBLESHOOTING

### Build Failed:
```bash
# Common issues:
# 1. Check package.json has all dependencies
# 2. Verify Root Directory is "server"
# 3. Ensure Start Command is "npm start"
```

### Database Connection Error:
```bash
# Check MongoDB Atlas:
# 1. Network Access allows 0.0.0.0/0
# 2. Connection string is correct
# 3. Environment variable MONGO_URI is set
```

### App Won't Wake:
```bash
# If app doesn't respond after sleep:
# 1. Check Render logs in dashboard
# 2. Restart service from Render dashboard
# 3. Verify environment variables
```

---

## 💰 UPGRADE OPTIONS (WHEN NEEDED)

### If Sleep Becomes Issue:
**Starter Plan: $7/month**
- ✅ **No hibernation**
- ✅ **512 MB RAM, 0.5 CPU** 
- ✅ **Unlimited hours**

### If Need More Resources:
**Standard Plan: $25/month**
- ✅ **2 GB RAM, 1 CPU**
- ✅ **High performance**

---

## 🎉 BENEFITS OF THIS SETUP

### ✅ **Cost Effective:**
- **Frontend:** Vercel (FREE forever)
- **Backend:** Render (FREE with limitations)
- **Database:** MongoDB Atlas (512MB free)
- **Total:** $0/month

### ✅ **Professional Features:**
- **SSL certificates** included
- **Custom domains** supported
- **Auto-deployments** from Git
- **Build logs** and monitoring
- **Environment management**

---

## 📞 NEED HELP?

### Render Support:
- **Docs:** https://render.com/docs
- **Community:** Discord and forums
- **Email:** support@render.com

### Common Issues:
1. **Build failures** - Check logs in dashboard
2. **Database errors** - Verify MongoDB Atlas
3. **CORS errors** - Already configured
4. **Sleep issues** - Normal for free tier

---

## 🎯 SUCCESS CHECKLIST

After deployment:
- [ ] Backend responds to `/health`
- [ ] Database connection works
- [ ] Vercel frontend updated
- [ ] Frontend can call backend APIs
- [ ] Login functionality works
- [ ] Job applications work
- [ ] No CORS errors

**Ready to deploy? Let's go! 🚀**

**Your URL will be:** `https://ats-system-backend.onrender.com`