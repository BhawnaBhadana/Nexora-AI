# 🚀 Nexora AI

> **Your Personal AI Study & Career Assistant**
>
> An AI-powered all-in-one learning platform designed for college students to study smarter, prepare for placements, build resumes, generate notes, solve doubts, and track progress—all in one place.

<p align="center">
  <img src="https://img.shields.io/badge/Version-Beta-blueviolet?style=for-the-badge">
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white">
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white">
  <img src="https://img.shields.io/badge/Express.js-Backend-black?style=for-the-badge&logo=express">
  <img src="https://img.shields.io/badge/Vercel-Frontend-black?style=for-the-badge&logo=vercel">
  <img src="https://img.shields.io/badge/Render-Backend-46E3B7?style=for-the-badge&logo=render">
</p>

---

# 🌐 Live Demo

### 🔗 https://nexora-ai-beta-six.vercel.app

---

# 📸 Preview

> Dashboard

![Dashboard](./assets/dashboard.png)

---

# ✨ Features

## 🤖 AI Chat Assistant

- Ask doubts from any subject
- Instant AI-generated responses
- Coding assistance
- Career guidance
- Learning support

---

## 📝 AI Notes Generator

Generate structured study notes from any topic.

✔ Bullet points

✔ Definitions

✔ Important concepts

✔ Revision-friendly format

---

## 🎨 AI Image Generator

Generate educational or creative images using AI.

---

## 📄 Resume Builder

Build ATS-friendly professional resumes instantly.

Features:

- Modern templates
- Professional formatting
- Download ready
- Placement focused

---

## 🎯 ATS Resume Score Checker

Analyze resumes and receive:

- ATS Compatibility Score
- Missing Keywords
- Formatting Suggestions
- Improvement Tips

---

## 📚 Mock Test Generator

Generate practice MCQs automatically.

Includes:

- Multiple difficulty levels
- Instant answers
- Practice sessions

---

## 📅 AI Study Planner

Create personalized study schedules.

Features:

- Daily goals
- Progress tracking
- Completion status
- Productivity planning

---

## 📊 Analytics Dashboard

Track your learning journey.

Includes:

- Weekly Activity Chart
- Feature Usage Analytics
- Study Streak
- Progress Overview
- Learning Statistics

---

## 🌙 Dark Mode

Modern responsive dark UI for comfortable studying.

---

## 🔐 Authentication

- JWT Authentication
- Secure Login
- Registration
- Protected Routes

---

## 📱 Responsive Design

Works across

- Desktop
- Laptop
- Tablet
- Mobile

---

# 🛠 Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript (ES6)
- Chart.js
- Tabler Icons
- Responsive UI

---

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- JWT Authentication
- Multer
- pdf-parse

---

## AI

- Groq API
- Llama-3.3-70B-Versatile

---

## Deployment

Frontend

- Vercel

Backend

- Render

Database

- MongoDB Atlas

---

# 📂 Project Structure

```
Nexora-AI
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── uploads
│   ├── utils
│   ├── server.js
│   └── package.json
│
├── frontend
│   ├── assets
│   ├── css
│   ├── js
│   ├── pages
│   ├── index.html
│   └── favicon
│
├── README.md
└── .gitignore
```

---

# 🔌 API Endpoints

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |
| GET | `/api/auth/me` |

---

## AI

| Method | Endpoint |
|---------|----------|
| POST | `/api/ai/chat` |
| POST | `/api/ai/notes` |
| POST | `/api/ai/image` |
| POST | `/api/ai/pdf` |
| POST | `/api/ai/resume` |

---

## Study Planner

| Method | Endpoint |
|---------|----------|
| POST | `/api/planner/create` |
| GET | `/api/planner/get` |
| PATCH | `/api/planner/update` |
| DELETE | `/api/planner/delete/:id` |

---

## Analytics

| Method | Endpoint |
|---------|----------|
| GET | `/api/analytics` |
| POST | `/api/analytics/update` |

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/BhawnaBhadana/Nexora-AI.git

cd Nexora-AI
```

---

## Backend

```bash
cd backend

npm install
```

Create

```
.env
```

```env
PORT=5000

MONGO_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET

GROQ_API_KEY=YOUR_GROQ_API_KEY

CLIENT_URL=http://localhost:5500
```

Run

```bash
npm run dev
```

---

## Frontend

```bash
cd frontend
```

Run with

- VS Code Live Server

or

```bash
npx serve
```

---

# 📈 Current Features

- ✅ AI Chat
- ✅ AI Notes
- ✅ Resume Builder
- ✅ ATS Checker
- ✅ Image Generator
- ✅ Mock Tests
- ✅ Study Planner
- ✅ Analytics Dashboard
- ✅ JWT Authentication
- ✅ Responsive Design
- ✅ Dark Theme
- ✅ MongoDB Integration

---

# 🚀 Upcoming Features

- Google Login
- Razorpay Premium
- Chat History
- Saved Notes
- PDF Question Generator
- Voice Assistant
- Hindi Support
- Mobile App
- PWA Support
- Email Reminders
- Leaderboard
- Collaborative Study Rooms

---

# 🎯 Target Users

- BCA Students
- B.Tech Students
- B.Sc Students
- MCA Students
- Placement Aspirants
- Competitive Exam Students
- College Learners

---

# 👩‍💻 Developer

## **Bhawna Bhadana**

Full Stack Developer

BCA Student

Passionate about AI, Education Technology and Web Development.

### GitHub

https://github.com/BhawnaBhadana

---

# 🤝 Contributing

Contributions are always welcome.

1. Fork the repository

2. Create a feature branch

3. Commit your changes

4. Push the branch

5. Open a Pull Request

---

# 📄 License

Licensed under the MIT License.

---

<p align="center">

### ⭐ If you like this project, please consider giving it a Star!

Built with ❤️ by **Bhawna Bhadana**

</p>