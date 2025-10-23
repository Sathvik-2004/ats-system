# Railway Deployment Instructions

## Backend Deployment on Railway

1. **Go to Railway Website**
   - Visit https://railway.app/
   - Sign in with your GitHub account (sathwikreddy9228@gmail.com)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose "Sathvik-2004/ats-system"
   - Select the `server` folder as the root directory

3. **Environment Variables**
   Set these environment variables in Railway:
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://sathwikreddy9228_db_user:AtsSystem2024%21@ats-production-cluster.gl3adlt.mongodb.net/ats_production?retryWrites=true&w=majority&appName=ats-production-cluster
   JWT_SECRET=ats_super_secure_jwt_secret_for_production_2024_change_this_key
   JWT_EXPIRES_IN=7d
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

4. **Deploy Settings**
   - Build Command: `npm install`
   - Start Command: `npm run production`
   - Root Directory: `server`

5. **Domain**
   - Railway will provide a domain like: `https://ats-backend-production.up.railway.app`
   - Copy this URL for the frontend configuration

## Frontend Deployment on Vercel

1. **Go to Vercel Website**
   - Visit https://vercel.com/
   - Sign in with GitHub

2. **Import Project**
   - Click "New Project"
   - Import "Sathvik-2004/ats-system"
   - Select the `client` folder as root directory

3. **Environment Variables**
   Set in Vercel:
   ```
   REACT_APP_API_URL=https://your-railway-backend-url.up.railway.app
   ```

4. **Deploy Settings**
   - Framework: Create React App
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`

## Manual CLI Alternative (if web doesn't work)

If you prefer CLI deployment, here are the steps:

### Backend (Railway CLI Alternative)
```bash
# In server directory
railway login
railway link [project-id-from-web-interface]
railway up
```

### Frontend (Vercel CLI Alternative)
```bash
# In client directory
npm install -g vercel
vercel login
vercel --prod
```

## Post-Deployment Steps

1. **Update Environment URLs**
   - Update `CLIENT_URL` in Railway with actual Vercel URL
   - Update `REACT_APP_API_URL` in Vercel with actual Railway URL

2. **Test Deployment**
   - Visit your Vercel URL
   - Try admin login: admin / ksreddy@2004
   - Test job applications and functionality

3. **Monitor Logs**
   - Check Railway logs for backend issues
   - Check Vercel logs for frontend issues

Your project is now ready for deployment! The web interface method is recommended as it's more reliable than CLI for initial deployment.