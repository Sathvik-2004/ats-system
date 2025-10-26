# Deploy React Frontend to Render (Static Site)

## Quick Deploy Steps

1. **Connect to Render**
   - Go to [Render.com](https://render.com)
   - Create account or sign in
   - Click "New +" → "Static Site"

2. **Connect GitHub Repository**
   - Connect your GitHub account
   - Select repository: `Sathvik-2004/ats-system`
   - Branch: `main`

3. **Build Settings**
   ```
   Build Command: cd client && npm install && npm run build
   Publish Directory: client/build
   ```

4. **Environment Variables**
   ```
   REACT_APP_API_URL = https://ats-system-u2nr.onrender.com
   CI = false
   GENERATE_SOURCEMAP = false
   NODE_ENV = production
   ```

5. **Deploy**
   - Click "Create Static Site"
   - Deployment will take 2-3 minutes
   - You'll get a live URL like: `https://ats-frontend-abc123.onrender.com`

## Alternative: Manual Upload
If GitHub connection fails, you can upload the `client/build` folder directly:
1. Zip the contents of `client/build/` 
2. Use Render's manual upload option
3. Set environment variables in dashboard

## Testing After Deploy
- Visit the deployed URL
- Test login and application submission
- Verify data flows to your backend at https://ats-system-u2nr.onrender.com

## Current Status
✅ Backend: https://ats-system-u2nr.onrender.com (Working)  
🔄 Frontend: Ready to deploy (Build completed successfully)