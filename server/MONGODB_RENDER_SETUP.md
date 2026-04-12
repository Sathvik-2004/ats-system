# MongoDB Atlas + Render Configuration Guide

## 1. MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account & Cluster
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Create a new project (e.g., "ATS Production")
4. Click "Create Cluster"
5. Choose:
   - **Provider**: AWS
   - **Region**: Choose closest to your users (e.g., us-east-1)
   - **Tier**: M0 (free) or M2 for production
6. Wait for cluster to deploy (5-10 minutes)

### Step 2: Create Database User
1. In MongoDB Atlas, go to **Database Access**
2. Click **Add New Database User**
3. Choose **Password** authentication method
4. Set username: `ats_production_user` (or your choice)
5. Set password: Use a strong password with special characters (copy it!)
   - Example: `AtsSystem2024@Secure123`
6. **Built-in Role**: Select `Atlas Admin` (or `readWriteAnyDatabase` for production)
7. Click **Add User**

### Step 3: Configure Network Access (CRITICAL!)
1. Go to **Network Access**
2. Click **Add IP Address** 
3. **IMPORTANT**: For Render (dynamic IPs):
   - Enter: `0.0.0.0/0` (allows all IPs - necessary for Render's changing IPs)
   - Or manually add Render's static IP if available
4. Add a description: "Render Backend"
5. Click **Confirm**

### Step 4: Get Connection String
1. Go to **Databases**
2. Click **Connect** on your cluster
3. Choose **Drivers** → **Node.js**
4. Copy the connection string (it will look like):
   ```
   mongodb+srv://<username>:<password>@cluster-name.xxxxx.mongodb.net/database_name?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your credentials
6. Replace `database_name` with your database name (e.g., `ats_production`)

**Example:**
```
mongodb+srv://ats_production_user:AtsSystem2024@Secure123@ats-production-cluster.xxxxx.mongodb.net/ats_production?retryWrites=true&w=majority
```

## 2. Authentication Error Solutions

### Error: "MongoServerError: bad auth : authentication failed"

**Most Common Causes:**

#### A) Incorrect Credentials in MONGO_URI
```
WRONG:
mongodb+srv://admin:password@cluster.xxxxx.mongodb.net/db

RIGHT:
mongodb+srv://ats_production_user:AtsSystem2024@Secure123@cluster.xxxxx.mongodb.net/ats_production
```

**Fix:**
- Double-check username and password match exactly what you set in MongoDB Atlas
- Ensure database name is correct
- Special characters in password MUST NOT be URL-encoded in the connection string (MongoDB handles this)

#### B) Special Characters Not Handled
If your password contains special characters like `@`, `#`, `%`, `!`:
- Use them directly in the connection string
- MongoDB Atlas connection string tool handles encoding automatically
- **DO NOT** manually URL-encode them

**Example:**
- Password: `Password@2024!`
- URI: `mongodb+srv://user:Password@2024!@cluster.xxxxx.mongodb.net/db` ✅ CORRECT
- URI: `mongodb+srv://user:Password%402024%21@cluster.xxxxx.mongodb.net/db` ❌ WRONG

#### C) User Doesn't Have Database Access
1. Go to MongoDB Atlas → **Database Access**
2. Find your user
3. Click **Edit**
4. Ensure role is:
   - `Atlas Admin` (admin dashboard access)
   - `readWriteAnyDatabase` (application database access)
5. Click **Update User**

#### D) IP Not Whitelisted
1. Go to MongoDB Atlas → **Network Access**
2. Check if `0.0.0.0/0` is added
3. If not:
   - Click **Add IP Address**
   - Enter `0.0.0.0/0`
   - Description: `All IPs (Render)`
   - Click **Confirm**

#### E) Connection String Format Issues
- Connection string MUST start with `mongodb+srv://`
- Include query parameters: `?retryWrites=true&w=majority`
- Database name in URL must exist (or MongoDB will create it)

## 3. Render Configuration

### Step 1: Set Environment Variable
1. Go to your Render service dashboard
2. Click **Environment** (or **Settings**)
3. Add a new environment variable:
   - **Key**: `MONGO_URI`
   - **Value**: Paste the complete connection string from MongoDB Atlas
   
   Example:
   ```
   mongodb+srv://ats_production_user:AtsSystem2024@Secure123@ats-production-cluster.x1y2z3.mongodb.net/ats_production?retryWrites=true&w=majority
   ```

4. Click **Save Changes**
5. Render will automatically redeploy

### Step 2: Verify Connection
1. Go to **Logs** in Render
2. Trigger a redeploy or wait for automatic deployment
3. Look for success message:
   ```
   ✅ Connected to MongoDB Atlas successfully
      Database: ats_production
   ```

### Step 3: Test Connection Endpoint
After deployment:
```bash
curl https://<your-render-url>/api/status
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-04-12T10:30:00.123Z",
  "uptime": 45.234,
  "database": "connected"
}
```

If `database: "disconnected"`, check:
- MONGO_URI environment variable is set correctly
- MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Credentials are correct

## 4. Debugging Connection Issues

### Enable Mongoose Debug Logging (Optional)
Add to `server.js` before connecting:
```javascript
mongoose.set('debug', true);
```

This will log all MongoDB operations to console.

### Common Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `bad auth : authentication failed` | Wrong password/username | Verify credentials in MONGO_URI |
| `connection refused` | IP not whitelisted | Add 0.0.0.0/0 to Network Access |
| `unknown host` | Invalid cluster URL | Copy connection string from Atlas |
| `Timeout` | Network unreachable | Check MongoDB Atlas IP whitelist |
| `ECONNREFUSED` | Server unreachable | Verify cluster is running |

### Manual Testing Script
Create `test-mongo.js`:
```javascript
const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/db';

console.log('Testing connection to:', mongoUri);

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log('✅ Connection successful!');
    console.log('Database:', mongoose.connection.name);
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
```

Run: `node test-mongo.js`

## 5. Environment Variable Summary

| Variable | Value | Example |
|----------|-------|---------|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/db?retryWrites=true` |
| `NODE_ENV` | Environment type | `production` |
| `JWT_SECRET` | JWT signing key | `your-secret-key-min-32-chars` |
| `JWT_REFRESH_SECRET` | Refresh token key | `your-refresh-secret-key` |
| `PORT` | Server port | `5000` (Render assigns automatically) |

## 6. Security Best Practices

✅ **DO:**
- Use strong passwords (20+ characters, mixed case, numbers, special chars)
- Set `0.0.0.0/0` only if using external connections (Render requires this)
- Store MONGO_URI only in environment variables, never in code
- Use separate users for development and production
- Rotate credentials quarterly

❌ **DON'T:**
- Commit MONGO_URI to GitHub
- Use weak passwords
- Embed credentials in connection strings in source code
- Use the same credentials for multiple environments
- Use `admin` user for application connections

## 7. Render Redeploy After Configuration

1. In Render dashboard, go to your service
2. Click **Manual Deploy** → **Redeploy**
3. Wait for build to complete
4. Check logs for "✅ Connected to MongoDB Atlas successfully"
5. Test with health endpoint: `/api/status`

---

## Quick Checklist

- [ ] MongoDB Atlas cluster created and running
- [ ] Database user created with strong password
- [ ] Network Access allows `0.0.0.0/0`
- [ ] Connection string copied correctly with database name
- [ ] MONGO_URI environment variable set in Render
- [ ] Service redeployed after setting MONGO_URI
- [ ] Health endpoint shows `database: "connected"`
- [ ] Application endpoints working (login, create application, etc.)
