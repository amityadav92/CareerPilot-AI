# 🚀 CareerPilot AI
### AI-Powered Career Copilot – Intelligent Job Search, Resume Analyzer & Interview Preparation Agent

CareerPilot AI is an AI-powered career assistance platform designed to help students and job seekers manage their career journey. It provides intelligent resume analysis, job matching, resume building, job application tracking, and career management features.

## ✨ Features

### 👤 User Authentication
- User Registration and Login
- JWT Authentication
- Protected Routes
- Secure Password Hashing

### 📊 Dashboard
- Personalized Dashboard
- Career Overview
- User Profile Management

### 📝 Resume Builder
- Create and Update Resume
- Personal Information Management
- Education Details
- Skills and Experience
- Projects and Certifications
- Download Resume as PDF

### 🤖 AI Resume Analyzer
- Upload Resume in PDF Format
- AI-Powered Resume Analysis
- ATS Score Evaluation
- Resume Improvement Suggestions

### 🎯 AI Job Matcher
- Upload Resume
- Enter Job Description
- AI-Based Job Matching
- Job Match Score
- Missing Skills Identification
- Improvement Suggestions
- Download Job Match Report

### 💼 Job Application Tracker
- Add Job Applications
- Update Application Status
- Delete Applications
- Track Application Progress
- Manage Company and Job Details

### 🛡️ Admin Panel
- Admin Dashboard
- Total Users Statistics
- User Search
- User Role Management
- User Management and Deletion

### 📱 Responsive Design
- Mobile-Friendly Interface
- Tablet Responsive Layout
- Desktop Responsive Layout

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- REST API
- JWT Authentication
- Multer

### Database
- MongoDB Atlas
- Mongoose

### AI Integration
- Google Gemini API

### Development Tools
- Visual Studio Code
- Git
- GitHub
- Postman

## 📂 Project Structure

```text
CareerPilot-AI/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── index.html
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── .env.example
└── README.md
```

*Note: Update folder names according to your actual project structure.*

## ⚙️ Installation & Setup

### 1. Clone Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to Project

```bash
cd CareerPilot-AI
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder and configure:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Start Backend:

```bash
npm run dev
```

Backend runs at:

`http://localhost:5000`

### 4. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

`http://localhost:5173`

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| PORT | Backend Server Port |
| MONGO_URI | MongoDB Atlas Connection |
| JWT_SECRET | JWT Authentication Secret |
| GEMINI_API_KEY | Google Gemini API Key |

**Important:** Never upload your actual `.env` file or API keys to GitHub.

## 🎯 Project Objectives

- Simplify the job application process.
- Help candidates improve their resumes.
- Analyze resumes using Artificial Intelligence.
- Match candidates with suitable job descriptions.
- Track job applications efficiently.
- Provide an integrated career management platform.

## 🔮 Future Enhancements

- AI Interview Preparation
- Mock Interview System
- Job Recommendation Engine
- Career Roadmap Generator
- Advanced Analytics

## 👨‍💻 Developer

**Amit Kumar Yadav**

B.Tech – Information Technology  
Rajkiya Engineering College Azamgarh

**GitHub:** [amityadav92](https://github.com/amityadav92)

## 📄 License

This project is developed for educational and portfolio purposes.