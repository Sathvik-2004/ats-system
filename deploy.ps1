# PowerShell Deployment Script for ATS System
# Run this script from the project root directory

Write-Host "🚀 Starting ATS System Deployment Process..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Step 1: Verify project structure
Write-Host "`n📦 Step 1: Verifying project structure..." -ForegroundColor Yellow

if (-not (Test-Path "server\package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project structure verified" -ForegroundColor Green

# Step 2: Display Railway deployment instructions
Write-Host "`n🌐 RAILWAY BACKEND DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "1. Open: https://railway.app/new" -ForegroundColor White
Write-Host "2. Select 'Deploy from GitHub repo'" -ForegroundColor White
Write-Host "3. Choose 'Sathvik-2004/ats-system'" -ForegroundColor White
Write-Host "4. Set ROOT DIRECTORY to: 'server'" -ForegroundColor Yellow
Write-Host "5. Deploy the project" -ForegroundColor White
Write-Host "`nEnvironment Variables to add in Railway:" -ForegroundColor Yellow
Write-Host "NODE_ENV=production" -ForegroundColor Gray
Write-Host "PORT=`${{RAILWAY_PUBLIC_PORT}}" -ForegroundColor Gray
Write-Host "MONGO_URI=mongodb+srv://sathwikreddy9228_db_user:AtsSystem2024%21@ats-production-cluster.gl3adlt.mongodb.net/ats_production?retryWrites=true&w=majority&appName=ats-production-cluster" -ForegroundColor Gray
Write-Host "JWT_SECRET=ats_super_secure_jwt_secret_for_production_2024_change_this_key" -ForegroundColor Gray
Write-Host "JWT_EXPIRES_IN=7d" -ForegroundColor Gray
Write-Host "CLIENT_URL=http://localhost:3000" -ForegroundColor Gray

# Open Railway in browser
Write-Host "`n🌐 Opening Railway deployment page..." -ForegroundColor Yellow
Start-Process "https://railway.app/new"

# Wait for user to complete Railway deployment
Read-Host "`nPress ENTER after you've completed Railway deployment and have the Railway URL"

# Get Railway URL from user
$RAILWAY_URL = Read-Host "Enter your Railway backend URL (e.g., https://ats-system-production-xxxx.up.railway.app)"

if ([string]::IsNullOrEmpty($RAILWAY_URL)) {
    Write-Host "❌ Error: Railway URL is required" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Railway URL set to: $RAILWAY_URL" -ForegroundColor Green

# Step 3: Update Frontend Configuration
Write-Host "`n📱 Step 2: Updating Frontend Configuration..." -ForegroundColor Yellow

# Update production environment file
$envContent = Get-Content "client\.env.production" -Raw
$envContent = $envContent -replace "REACT_APP_API_URL=.*", "REACT_APP_API_URL=$RAILWAY_URL"
$envContent | Set-Content "client\.env.production"

Write-Host "✅ Frontend configured for production" -ForegroundColor Green

# Step 4: Install Vercel CLI if needed
Write-Host "`n🌍 Step 3: Preparing Vercel deployment..." -ForegroundColor Yellow

try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI is already installed" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Navigate to client directory
Set-Location "client"

Write-Host "`n🚀 Starting Vercel deployment..." -ForegroundColor Green
Write-Host "Follow the Vercel prompts to deploy your frontend..." -ForegroundColor Yellow

# Start Vercel deployment
vercel --prod

# Get Vercel URL
$VERCEL_URL = Read-Host "`nEnter your Vercel frontend URL (e.g., https://ats-system.vercel.app)"

if ([string]::IsNullOrEmpty($VERCEL_URL)) {
    Write-Host "❌ Error: Vercel URL is required" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Vercel URL set to: $VERCEL_URL" -ForegroundColor Green

# Step 5: Final instructions
Write-Host "`n🔗 Step 4: Final Configuration..." -ForegroundColor Yellow
Write-Host "Go to your Railway project settings and update the CLIENT_URL variable:" -ForegroundColor White
Write-Host "CLIENT_URL=$VERCEL_URL" -ForegroundColor Yellow

# Step 6: Test deployment
Write-Host "`n🧪 Step 5: Testing Deployment..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$RAILWAY_URL/api/jobs" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend API is responding" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Backend API test failed - check Railway deployment" -ForegroundColor Yellow
}

try {
    $response = Invoke-WebRequest -Uri $VERCEL_URL -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is responding" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Frontend test failed - check Vercel deployment" -ForegroundColor Yellow
}

# Return to project root
Set-Location ".."

Write-Host "`n🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host "Backend URL: $RAILWAY_URL" -ForegroundColor Cyan
Write-Host "Frontend URL: $VERCEL_URL" -ForegroundColor Cyan
Write-Host "`nTest your application:" -ForegroundColor Yellow
Write-Host "1. Visit: $VERCEL_URL" -ForegroundColor White
Write-Host "2. Admin login: username=admin, password=ksreddy@2004" -ForegroundColor White
Write-Host "3. Test job applications and admin functionality" -ForegroundColor White

Write-Host "`n✨ Your ATS system is now live!" -ForegroundColor Magenta