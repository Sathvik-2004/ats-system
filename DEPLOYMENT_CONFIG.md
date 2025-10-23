# Deployment Environment Configuration

## Development Environment (.env)
MONGO_URI=mongodb://localhost:27017/atsdb
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development

## Production Environment (.env.production)
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ats_production

# Security
JWT_SECRET=your_super_secure_jwt_secret_here
NODE_ENV=production

# Server
PORT=5000

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_admin_email@gmail.com
EMAIL_PASS=your_app_password

# Admin Configuration
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=secure_admin_password

# API Configuration
API_BASE_URL=https://your-backend-app.herokuapp.com

## Environment Variables to Configure:
1. MongoDB Atlas Database URI
2. JWT Secret Key (generate secure one)
3. Frontend Domain (Vercel URL)
4. Backend Domain (Heroku URL)
5. Email Credentials for notifications
6. Admin Account Credentials