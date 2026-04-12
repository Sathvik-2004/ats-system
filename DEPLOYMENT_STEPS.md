# MongoDB + Render Deployment Guide - Step-by-Step

Complete walkthrough for deploying your ATS application with MongoDB Atlas and Render.

---

## 📋 Overview

This guide covers 4 main steps:
1. ✅ Create MongoDB Atlas Cluster
2. ✅ Set MONGO_URI in Render Environment Variables
3. ✅ Redeploy Application to Render
4. ✅ Monitor Logs for Connection Success

**Estimated Time**: 20-30 minutes

---

## ✅ Step 1: Create MongoDB Atlas Cluster

### 1.1 - Sign Up/Login to MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **Start Free**
3. Create account or sign in with:
   - Email
   - Google account
   - GitHub account
4. Verify email if needed
5. Create/select organization

### 1.2 - Create a New Project

1. In Atlas Dashboard, click **New Project**
2. Project Name: `ATS Production` (or your choice)
3. Click **Create Project**
4. Wait for project to load

### 1.3 - Create a Cluster

1. Click **Create a Deployment** or **Build a Cluster**
2. Choose deployment:
   - **Provider**: AWS
   - **Region**: Select closest to your users
     - If US-based: `us-east-1` (N. Virginia)
     - If Europe-based: `eu-west-1` (Ireland)
     - If Asia-based: `ap-south-1` (Mumbai)
   - **Cluster Tier**: `M0` (Free, great for testing)
     - For production: `M2` or `M5`
3. Cluster Name: `ats-production-cluster` (or your choice)
4. Click **Create Deployment**
5. **Wait 5-10 minutes** for cluster to be created

### 1.4 - Create Database User

**Important**: The cluster MUST be created before this step

1. In your cluster page, click **Security** → **Database Access**
2. Click **+ Add New Database User**
3. Fill in:
   - **Authentication Method**: Choose `Password`
   - **Username**: `ats_production_user`
   - **Password**: Create a strong password:
     - At least 16 characters
     - Mix uppercase + lowercase + numbers + symbols
     - Example: `AtsSystem@2024!Secure123`
     - **Copy this password - you'll need it!**
4. **Built-in Role**: Select `Atlas Admin`
   - This gives full database access (good for development)
   - For production: use `readWriteAnyDatabase`
5. Click **Add User**

✅ **You should see the user listed now**

### 1.5 - Configure Network Access (CRITICAL!)

This is **essential** for Render to connect:

1. Go to **Security** → **Network Access**
2. Click **+ Add IP Address**
3. Fill in:
   - **Access List Entry**: `0.0.0.0/0`
   - **Description**: `Render Backend - Allow All IPs`
   - This allows any IP to connect (necessary for Render's dynamic IPs)
4. Click **Confirm** or **Add Entry**

⚠️ **Important**: `0.0.0.0/0` is secure for development but only with strong credentials

### 1.6 - Get Connection String

1. Go to **Deployment** → Your Cluster
2. Click **Connect** button
3. Choose **Drivers** tab
4. Select **Node.js** as driver and version **5.x**
5. You'll see a connection string like:
   ```
   mongodb+srv://<username>:<password>@cluster-name.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 1.7 - Format Your Connection String

Copy the string and modify it:

**Template:**
```
mongodb+srv://USERNAME:PASSWORD@cluster-name.xxxxx.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

**Example filled in:**
```
mongodb+srv://ats_production_user:AtsSystem@2024!Secure123@ats-production-cluster.a1b2c3d4.mongodb.net/ats_production?retryWrites=true&w=majority
```

**Replace:**
- `ats_production_user` = Your database username from Step 1.4
- `AtsSystem@2024!Secure123` = Your password from Step 1.4
- `ats-production-cluster.a1b2c3d4.mongodb.net` = Copy from Atlas connection string
- `ats_production` = Your database name (Atlas will create it automatically)

⚠️ **Important**: 
- Do NOT URL-encode the password (use special characters directly)
- Include `?retryWrites=true&w=majority` at the end
- Include the database name: `/ats_production`

✅ **Your connection string is ready for Step 2!**

---

## ✅ Step 2: Set MONGO_URI in Render Environment Variables

### 2.1 - Go to Render Dashboard

1. Open https://dashboard.render.com
2. Sign in with your account
3. Click your ATS backend service

### 2.2 - Access Environment Settings

1. Click **Settings** in the top menu
2. Scroll down to **Environment** section
3. Or click **Environment** tab if available

### 2.3 - Add MONGO_URI Variable

1. Look for **Environment Variables** section
2. Click **+ Add Environment Variable** button (or **Add Variable**)
3. Fill in:
   - **Key**: `MONGO_URI`
   - **Value**: Paste your complete connection string from Step 1.7
     ```
     mongodb+srv://ats_production_user:AtsSystem@2024!Secure123@ats-production-cluster.a1b2c3d4.mongodb.net/ats_production?retryWrites=true&w=majority
     ```
4. Click **Save** (or **Add**)

### 2.4 - Verify Variable Added

You should see:
```
MONGO_URI = mongodb+srv://ats_production_user:***@...
```

(Password is masked with asterisks for security)

### 2.5 - Save and Trigger Redeploy

After adding the variable:
- Click **Save Changes** if you see that button
- Render will automatically redeploy your service
- You should see a notification: "Deploying..." or similar

---

## ✅ Step 3: Redeploy to Render

### 3.1 - Manual Redeploy (if automatic didn't trigger)

1. In your Render service dashboard
2. Look for **Manual Deploy** button or **Redeploy** button
3. Click **Manual Deploy** → **Redeploy**
4. Wait for deployment to start

### 3.2 - Deployment Progress

You should see:
```
Building your application...
Installing dependencies...
Starting application...
✅ Your service is live!
```

This takes **2-5 minutes** typically.

### 3.3 - Check Build Status

- Look at the top of your dashboard
- You should see a green checkmark: **✅ Live**
- Or a blue icon: **🔄 Building**
- Don't proceed to Step 4 until you see **✅ Live**

---

## ✅ Step 4: Monitor Logs for Connection Success

### 4.1 - Open Logs

1. In your Render service dashboard
2. Click **Logs** tab (at the top)
3. You should see recent deployment logs streaming

### 4.2 - Look for Success Message

**Scroll through logs and look for:**

```
✅ Connected to MongoDB Atlas successfully
   Database: ats_production
```

**If you see this:** ✅ SUCCESS! Your MongoDB is connected!

### 4.3 - If You See Error Messages

**Common errors and fixes:**

#### Error: `MONGO_URI environment variable is not set`
```
Fix: 
1. Go back to Step 2.3
2. Make sure MONGO_URI is added to environment variables
3. Click Save
4. Wait for redeploy to complete
5. Check logs again
```

#### Error: `MongoServerError: bad auth : authentication failed`
```
Fix:
1. Check username and password in MONGO_URI
2. Verify they match MongoDB Atlas Database Access user
3. Don't URL-encode special characters
4. Example: Password@2024! should be used directly, not Password%402024%21
5. Update MONGO_URI in Render Step 2.3
6. Redeploy
```

#### Error: `connection refused` or `ECONNREFUSED`
```
Fix:
1. In MongoDB Atlas, go to Security → Network Access
2. Verify 0.0.0.0/0 is added
3. If not, add it (Step 1.5)
4. Wait 1-2 minutes for changes to propagate
5. Redeploy Render service
```

#### Error: `Timeout` or `socket timeout`
```
Fix:
1. Verify MongoDB Atlas cluster is running (green status)
2. Check Network Access has 0.0.0.0/0
3. Try redeploying
4. If persistent, try a different MongoDB region
```

### 4.4 - Test the Health Endpoint

Once you see "✅ Connected":

1. Copy your Render service URL (e.g., `https://ats-backend.onrender.com`)
2. Open in browser or terminal:
   ```
   https://ats-backend.onrender.com/api/status
   ```
3. You should see JSON response:
   ```json
   {
     "status": "OK",
     "timestamp": "2024-04-12T10:30:00.123Z",
     "uptime": 45.234,
     "database": "connected"
   }
   ```

✅ **If `"database": "connected"` - you're all set!**

---

## 🧪 Verification Checklist

Before considering deployment complete:

- [ ] MongoDB Atlas cluster created and running (green status)
- [ ] Database user created with strong password
- [ ] Network Access includes `0.0.0.0/0`
- [ ] MONGO_URI added to Render environment
- [ ] Render service shows **✅ Live**
- [ ] Logs show `✅ Connected to MongoDB Atlas successfully`
- [ ] `/api/status` endpoint returns `"database": "connected"`
- [ ] Can access login page without errors
- [ ] Can submit application form

---

## 🔧 Troubleshooting Quick Links

| Issue | Check |
|-------|-------|
| Can't create MongoDB user | Cluster must finish creating first (5-10 min) |
| Network Access changes not working | Wait 1-2 minutes for propagation |
| Connection timeout | Verify MongoDB cluster running + network access |
| Authentication failed | Double-check username/password in MONGO_URI |
| Environment variable not working | Verify exact variable name is `MONGO_URI` (case-sensitive) |

---

## 📱 Need More Details?

Related documentation:
- **Complete Setup Guide**: [server/MONGODB_RENDER_SETUP.md](../server/MONGODB_RENDER_SETUP.md)
- **Technical Summary**: [MONGODB_FIX_SUMMARY.md](../MONGODB_FIX_SUMMARY.md)
- **Quick Reference**: [MONGODB_QUICK_START.md](../MONGODB_QUICK_START.md)
- **Test Script**: [server/validate-mongo-connection.js](../server/validate-mongo-connection.js)

---

## ⏱️ Timeline Reference

| Task | Duration | Status |
|------|----------|--------|
| Create MongoDB cluster | 5-10 min | Automatic |
| Create database user | 1 min | Immediate |
| Configure network access | 1 min | Need 1-2 min to propagate |
| Get connection string | 1 min | Copy from Atlas |
| Add to Render env vars | 1 min | Triggers redeploy |
| Render redeploy | 2-5 min | Automatic |
| Verify connection | 2-3 min | Manual test |
| **Total Estimated** | **~20-30 min** | |

---

## ✅ Success Indicators

You're done when you see:

1. ✅ Render dashboard shows **Live** (green checkmark)
2. ✅ Logs show `✅ Connected to MongoDB Atlas successfully`
3. ✅ `/api/status` returns `"database": "connected"`
4. ✅ Your application loads in browser
5. ✅ Login page works

---

## 🆘 If Stuck

### Quick Debug Steps:

1. **Check MONGO_URI is set:**
   ```bash
   curl https://your-render-url/api/status
   # Should show "database": "connected"
   ```

2. **View Render Logs:**
   - Render Dashboard → Click your service → Click "Logs"
   - Look for error messages
   - Share the error here

3. **Test MongoDB Atlas:**
   - Go to https://cloud.mongodb.com
   - Check cluster status (should be green)
   - Verify network access includes 0.0.0.0/0

4. **Local Testing (Optional):**
   ```bash
   cd server
   $env:MONGO_URI = "your-connection-string"
   node validate-mongo-connection.js
   ```

---

## 🎉 Next Steps After Success

Once deployment is complete:

1. ✅ Test login with admin credentials
2. ✅ Post a test application
3. ✅ Verify data appears in database
4. ✅ Check Render logs for errors
5. ✅ Monitor performance

You're now running a **production-ready ATS system** with:
- ✅ MongoDB Atlas for reliable data storage
- ✅ Render for backend hosting
- ✅ Proper environment variable management
- ✅ Comprehensive error monitoring
- ✅ Production-grade connection pooling

**Congratulations! 🚀**
