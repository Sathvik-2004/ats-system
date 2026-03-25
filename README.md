# ATS System

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/API-Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)
![JWT Auth](https://img.shields.io/badge/Auth-JWT-0F172A)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-010101?logo=socket.io&logoColor=white)

A production-grade Applicant Tracking System (ATS) designed to streamline the entire recruitment lifecycle - from job creation to AI-assisted candidate evaluation.

Built with a scalable full-stack architecture, this system replicates real-world hiring workflows used by modern SaaS platforms like Greenhouse and Lever.

## Live Demo

- Frontend: https://ats-system-flame.vercel.app
- Backend API: https://lessats-systemgreater-production.up.railway.app

## Project Overview

ATS System is a full-stack recruitment platform built to streamline the hiring lifecycle from job creation to candidate evaluation.

It supports role-based workflows:
- Recruiters and admins can create jobs, review applications, run AI screening, and monitor hiring analytics.
- Candidates can search roles, apply with resume uploads, and track status updates.

## Key Highlights

- Built a full-stack ATS handling end-to-end recruitment workflows
- Implemented role-based access for Admin, Recruiter, and Candidate
- Designed a real-time application pipeline with status tracking
- Integrated AI-based resume screening with match scoring
- Implemented secure authentication with JWT and refresh tokens
- Optimized APIs with pagination, validation, and error handling

## System Architecture

- Frontend communicates with backend via REST APIs
- Backend handles authentication, business logic, and data validation
- MongoDB stores users, jobs, applications, and analytics data
- Socket.IO enables real-time updates for notifications and status changes
- Cloud storage (optional) used for resume handling

## Core Features

### Role-Based Access
- Separate user and admin login flows
- Protected routes and token-based authentication
- Session handling with token refresh support

### Job Management
- Create, update, and delete job postings
- Filter and search job listings
- Save jobs for later review

### Application Tracking Pipeline
- End-to-end status flow (Applied, Reviewing, Shortlisted, Interview, Selected, Rejected)
- Bulk actions for faster recruiter operations
- Detailed candidate view for decision support

### Resume Upload
- Candidate resume upload during application
- Resume links in application management views
- Validation for file type and size policies

### AI Resume Screening
- Match score (0-100) per applicant
- Visual score progress bars
- Matched skills and missing skills insights

### Notifications
- Real-time and in-app notification flows
- Candidate status update visibility
- Admin notification views for operational awareness

### Analytics Dashboard
- Hiring metrics and application trends
- Role-level insights for recruiter productivity
- Visual reports for decision-making

## Tech Stack

- Frontend: React, React Router, Axios
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)
- Realtime: Socket.IO
- Auth: JWT-based authentication

## API Quick Reference

Base URL

- Production: https://lessats-systemgreater-production.up.railway.app
- Local: http://localhost:5001

Authentication

- POST /api/auth/user-login
- POST /api/auth/admin-login
- POST /api/auth/register
- POST /api/auth/refresh
- POST /api/auth/logout

Jobs

- GET /api/jobs
- POST /api/jobs
- PUT /api/jobs/:id
- DELETE /api/jobs/:id
- GET /api/jobs/saved
- POST /api/jobs/:id/save
- DELETE /api/jobs/saved/:id

Applications

- POST /api/applications
- GET /api/applications/mine
- GET /api/applications/mine/stats
- POST /api/applications/:id/withdraw
- GET /api/applications
- PUT /api/applications/:id/status
- DELETE /api/applications/:id
- GET /api/applications/export/csv

AI Screening

- POST /api/ai/screen
- PUT /api/ai/screen/:applicationId
- POST /api/ai/screen-job/:jobId

Interviews

- GET /api/interviews/upcoming
- PUT /api/interviews/:id/schedule
- PUT /api/interviews/:id/feedback

Notifications

- GET /api/notifications
- PUT /api/notifications/:id/read
- PUT /api/notifications/read-all

Reports and Analytics

- GET /api/reports/summary
- GET /api/reports/applications-per-job
- GET /api/reports/applications-per-job/csv
- GET /api/analytics/dashboard/full-data

## Screenshots

### 👤 Candidate Experience

#### Overview Dashboard
![User Overview](docs/screenshots/User-%20Overview.png)

#### My Applications
![User Applications](docs/screenshots/User-My%20applications.png)

#### Analytics Dashboard
![User Analytics](docs/screenshots/User-%20Analytics%20Dashboard.png)


### 🧑‍💼 Admin Experience

#### Admin Overview
![Admin Overview](docs/screenshots/admin%20overview.png)

#### Applications Management
![Admin Applications](docs/screenshots/Admin-%20Applications.png)

#### AI Resume Screening
![AI Screening](docs/screenshots/Admin-%20Ai%20resume%20screening.png)

#### Analytics Dashboard
![Admin Analytics](docs/screenshots/Admin-%20Analytics%20Dashboard.png)

> All screenshots are taken from the live running application with real API data.

## Installation

### Prerequisites
- Node.js 18+ (Node 22 recommended in project config)
- npm
- MongoDB connection string

### 1) Clone Repository
```bash
git clone <your-repository-url>
cd ats-system
```

### 2) Install Dependencies
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 3) Configure Environment Variables
Create a .env file in server with values similar to:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

In client, create .env (optional for local default):

```env
REACT_APP_API_URL=http://localhost:5001
```

### 4) Run the Application
From separate terminals:

Backend
```bash
cd server
npm run dev
```

Frontend
```bash
cd client
npm start
```

### 5) Build for Production
```bash
cd client
npm run build
```

## Folder Structure

```text
ats-system/
├─ client/                 # React frontend (candidate + admin UI)
│  ├─ public/
│  └─ src/
├─ server/                 # Express backend API
│  ├─ controllers/
│  ├─ models/
│  ├─ routes/
│  ├─ middleware/
│  └─ server.js
├─ docs/                   # Documentation and static docs
├─ ats-frontend/           # Alternative/frontend workspace copy
├─ render.yaml             # Render deployment config
├─ railway.json            # Railway deployment config
├─ vercel.json             # Vercel config
└─ package.json            # Root scripts/config
```

## Why This Project Stands Out

- Practical full-stack architecture used in real hiring workflows
- AI-assisted screening UX for faster recruiter decisions
- Role-based experiences with strong operational tooling
- Deployment-ready with multiple platform configs (Vercel, Railway, Render)

## Contributing

Contributions, improvements, and feedback are welcome. Open an issue or submit a pull request with a clear description of your change.

## License

This project is currently unlicensed. Add a LICENSE file if you plan to open source it publicly.
