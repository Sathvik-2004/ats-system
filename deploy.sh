#!/bin/bash
# Automated Deployment Script for ATS System

echo "🚀 Starting ATS System Deployment Process..."
echo "=============================================="

# Step 1: Prepare Railway Backend Deployment
echo "📦 Step 1: Preparing Railway Backend..."

# Check if we're in the right directory
if [ ! -f "server/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"

# Display Railway deployment instructions
echo ""
echo "🌐 RAILWAY BACKEND DEPLOYMENT"
echo "============================="
echo "1. Open: https://railway.app/new"
echo "2. Select 'Deploy from GitHub repo'"
echo "3. Choose 'Sathvik-2004/ats-system'"
echo "4. Set ROOT DIRECTORY to: 'server'"
echo "5. Deploy the project"
echo ""
echo "Environment Variables to add in Railway:"
echo "NODE_ENV=production"
echo "PORT=\${{RAILWAY_PUBLIC_PORT}}"
echo "MONGO_URI=mongodb+srv://sathwikreddy9228_db_user:AtsSystem2024%21@ats-production-cluster.gl3adlt.mongodb.net/ats_production?retryWrites=true&w=majority&appName=ats-production-cluster"
echo "JWT_SECRET=ats_super_secure_jwt_secret_for_production_2024_change_this_key"
echo "JWT_EXPIRES_IN=7d"
echo "CLIENT_URL=http://localhost:3000"
echo ""

# Wait for user to complete Railway deployment
read -p "Press ENTER after you've completed Railway deployment and have the Railway URL..."

# Get Railway URL from user
echo ""
read -p "Enter your Railway backend URL (e.g., https://ats-system-production-xxxx.up.railway.app): " RAILWAY_URL

if [ -z "$RAILWAY_URL" ]; then
    echo "❌ Error: Railway URL is required"
    exit 1
fi

echo "✅ Railway URL set to: $RAILWAY_URL"

# Step 2: Update Frontend Configuration
echo ""
echo "📱 Step 2: Updating Frontend Configuration..."

# Update production environment file
sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=$RAILWAY_URL|" client/.env.production

echo "✅ Frontend configured for production"

# Step 3: Install Vercel CLI and deploy
echo ""
echo "🌍 Step 3: Deploying Frontend to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Navigate to client directory and deploy
cd client

echo "🚀 Starting Vercel deployment..."
vercel --prod

# Get Vercel URL
echo ""
read -p "Enter your Vercel frontend URL (e.g., https://ats-system.vercel.app): " VERCEL_URL

if [ -z "$VERCEL_URL" ]; then
    echo "❌ Error: Vercel URL is required"
    exit 1
fi

echo "✅ Vercel URL set to: $VERCEL_URL"

# Step 4: Update Railway CLIENT_URL
echo ""
echo "🔗 Step 4: Final Configuration..."
echo "Go to your Railway project settings and update:"
echo "CLIENT_URL=$VERCEL_URL"
echo ""

# Step 5: Test deployment
echo "🧪 Step 5: Testing Deployment..."
echo "Testing API endpoints..."

# Test backend health
if curl -f "$RAILWAY_URL/api/jobs" > /dev/null 2>&1; then
    echo "✅ Backend API is responding"
else
    echo "⚠️  Backend API test failed - check Railway deployment"
fi

# Test frontend
if curl -f "$VERCEL_URL" > /dev/null 2>&1; then
    echo "✅ Frontend is responding"
else
    echo "⚠️  Frontend test failed - check Vercel deployment"
fi

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo "Backend URL: $RAILWAY_URL"
echo "Frontend URL: $VERCEL_URL"
echo ""
echo "Test your application:"
echo "1. Visit: $VERCEL_URL"
echo "2. Admin login: username=admin, password=ksreddy@2004"
echo "3. Test job applications and admin functionality"
echo ""

cd ..