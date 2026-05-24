# 🧠 Nexora AI — Study Smarter with AI

> An AI-powered all-in-one study platform built specifically for Indian college students.

![Nexora AI](https://img.shields.io/badge/Nexora_AI-Study_Smarter-7F77DD?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

---

## 🌐 Live Demo

🔗 **[nexora-ai-beta-six.vercel.app](https://nexora-ai-beta-six.vercel.app)**

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 💬 **AI Doubt Solver** | Ask any subject question — get instant AI-powered answers |
| 📝 **AI Notes Generator** | Enter any topic → get clean structured study notes |
| 💻 **Code Helper** | Write, debug, and understand code with AI assistance |
| 📄 **Mock Test Generator** | Auto-generate MCQ practice tests with answer keys |
| 📷 **Image Question Solver** | Upload a photo of any question — AI solves it instantly |
| 📑 **PDF Solver** | Upload PDF notes — AI summarizes and generates practice questions |
| 📅 **Study Planner** | AI generates topic-wise study plans, track daily progress |
| 📋 **AI Resume Builder** | Fill your details → AI builds a professional ATS-friendly resume |
| 🎯 **Career Guide Chatbot** | India-specific career advice for jobs, internships, salaries |
| 📊 **Analytics Dashboard** | Weekly charts, heatmaps, streak calendar, accuracy tracking |
| 🔐 **Auth System** | Secure JWT-based login and registration |
| 📱 **Mobile Responsive** | Works perfectly on all screen sizes |

---

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- Chart.js — analytics visualizations
- Tabler Icons
- Deployed on **Vercel**

### Backend
- Node.js + Express.js
- MongoDB Atlas
- JWT Authentication
- Groq API — `llama-3.3-70b-versatile` model
- Multer — PDF file uploads
- pdf-parse — PDF text extraction
- Deployed on **Render**

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free)
- Groq API key — free at [console.groq.com](https://console.groq.com)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/BhawnaBhadana/Nexora-AI.git
cd Nexora-AI
```

**2. Install backend dependencies**
```bash
cd backend
npm install
```

**3. Create `.env` file in `/backend`**
```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/nexora-ai
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://127.0.0.1:5500
```

**4. Start the backend**
```bash
npm run dev
```

**5. Open frontend**
Open `frontend/index.html` with VS Code Live Server at `http://127.0.0.1:5500`

---

## 📁 Project Structure

```
Nexora-AI/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authcontrollers.js        # Login, register, get user
│   │   ├── analyticcontrollers.js    # Analytics update & fetch
│   │   └── studyplancontrollers.js   # CRUD for study plans
│   ├── middleware/
│   │   └── authmiddleware.js         # JWT auth middleware
│   ├── models/
│   │   ├── user.js                   # User schema with analytics
│   │   └── studyplan.js              # Study plan schema
│   ├── routes/
│   │   ├── authroutes.js             # /api/auth
│   │   ├── airoutes.js               # /api/ai
│   │   ├── analyticroutes.js         # /api/analytics
│   │   └── studyplanroutes.js        # /api/plan
│   └── server.js                     # Express app entry point
├── frontend/
│   ├── index.html                    # Main HTML
│   ├── style.css                     # All styles + mobile responsive
│   └── app.js                        # All frontend logic
└── README.md
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (protected) |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/ask` | General AI query |
| POST | `/api/ai/image` | Solve image question (vision AI) |
| POST | `/api/ai/resume` | Generate HTML resume |
| POST | `/api/ai/pdf` | Analyze PDF and generate questions |

### Study Plan
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/plan/create` | Create new plan (protected) |
| GET | `/api/plan/get` | Get all user plans (protected) |
| POST | `/api/plan/toggle` | Toggle topic completion (protected) |
| DELETE | `/api/plan/:id` | Delete plan (protected) |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analytics/update` | Update user activity (protected) |
| GET | `/api/analytics/get` | Get analytics data (protected) |

---

## 🌐 Deployment

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → Import GitHub repo
2. Set **Root Directory** to `frontend`
3. Leave Build Command and Output Directory empty
4. Click Deploy

### Backend → Render
1. Go to [render.com](https://render.com) → New Web Service
2. Connect GitHub repo
3. Set **Root Directory** to `backend`
4. **Build Command:** `npm install`
5. **Start Command:** `node server.js`
6. Add all environment variables
7. Deploy

---

## 📊 Analytics Features

- **Weekly Activity Bar Chart** — track daily study sessions
- **Activity Breakdown Pie Chart** — doubts vs notes vs tests
- **30-day Study Heatmap** — GitHub-style contribution graph
- **Performance Stats** — accuracy %, streak, topics covered
- **Study Streak** — daily streak tracking like Duolingo

---

## 🎯 Target Users

Indian college students (BCA, BSCA, B.Tech, BSc) who need:
- Affordable AI study tools
- Exam preparation assistance
- Career guidance for Indian job market
- Professional resume building
- Study planning and tracking

---

## 🔮 Roadmap

- [ ] Hindi language support
- [ ] Streaming AI responses
- [ ] Google OAuth login
- [ ] Razorpay subscription (Free vs Premium)
- [ ] Notes save to database
- [ ] Chat history persistence
- [ ] PWA — install as mobile app
- [ ] Collaborative study rooms
- [ ] Admin dashboard
- [ ] Email notifications and reminders

---

## 👩‍💻 Developer

**Bhawna Bhadana**
BSCA Student | Full Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-BhawnaBhadana-181717?style=flat&logo=github)](https://github.com/BhawnaBhadana)

---

## 📄 License

MIT License — feel free to use, modify and distribute.

---

⭐ **If you found this helpful, please star the repository!**

> Built with ❤️ for Indian students by Bhawna Bhadana