#!/bin/bash
# Automated Render Deployment Script

echo "🚀 RENDER DEPLOYMENT AUTOMATION"
echo "================================"
echo ""

echo "✅ Repository prepared with Render configuration"
echo "✅ Emergency fix code ready for deployment"
echo ""

echo "📋 NEXT STEPS:"
echo ""
echo "1. Go to: https://render.com/"
echo "2. Sign up/Login with GitHub"
echo "3. Click 'New +' → 'Web Service'"
echo "4. Select repository: Sathvik-2004/ats-system"
echo "5. Configure:"
echo "   - Name: ats-system-backend"
echo "   - Environment: Node"
echo "   - Root Directory: server"
echo "   - Build Command: npm install"
echo "   - Start Command: node server.js"
echo ""

echo "🔐 ENVIRONMENT VARIABLES TO ADD:"
echo ""
echo "MONGO_URI=your_mongodb_connection_string"
echo "JWT_SECRET=your_jwt_secret"  
echo "NODE_ENV=production"
echo ""

echo "⚡ EXPECTED TIMELINE:"
echo "- Setup: 2 minutes"
echo "- Deployment: 3-5 minutes"
echo "- Testing: 1 minute"
echo "- Total: ~10 minutes"
echo ""

echo "🎯 RESULT: Working application submission + user portal!"
echo ""

# Check if user wants to open Render in browser
read -p "🌐 Open Render.com in browser now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # For Windows
    if command -v powershell &> /dev/null; then
        powershell -c "Start-Process 'https://render.com'"
    # For macOS
    elif command -v open &> /dev/null; then
        open "https://render.com"
    # For Linux
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://render.com"
    else
        echo "Please manually open: https://render.com"
    fi
fi

echo ""
echo "✅ All files ready for Render deployment!"
echo "📖 Full guide: See RENDER_DEPLOY_GUIDE.md"