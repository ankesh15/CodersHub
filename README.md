# CodersHub 🚀

[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

CodersHub is a production-ready, full-stack developer analytics platform designed to aggregate, track, and visualize coding activity across **GitHub**, **LeetCode**, and **Codeforces** in a single unified glassmorphic dashboard.

---

## ✨ Features

- **Unified Developer Dashboard**: Sync stats, repository counts, and competitive programming ratings into one unified view.
- **Interactive Profile Comparison**: Input any two developer handles to compare platform solves, ratings, and repositories side-by-side with interactive bar charts and color-coded win matrices.
- **Milestone & Badging System**: Unlocked milestone badges dynamically (e.g., *Century Solver*, *Consistent Git*, *Polyglot Coder*) computed from real-time API syncs.
- **Print & PDF Export**: A printable CSS layout that formats the developer profiles into clean report cards ready for recruiters.
- **Robust Authentication**: Secure registration and login featuring password hashing (`bcryptjs`), input validation, and session-based persistent cookies.
- **Sleek Glassmorphic UI**: Vibrant, responsive dark-mode styling built using Tailwind CSS and Lucide icons.

---

## 🛠️ Technology Stack

**Frontend:**
- React 18 & Vite
- Tailwind CSS
- Recharts (Rating trends, solve distributions)
- React Calendar Heatmap (Commit calendars)
- Lucide React (Icons)
- React Toastify (Action notifications)

**Backend:**
- Node.js & Express.js
- MongoDB Atlas & Mongoose
- Express Session (Cookie management)
- Bcrypt.js (Secure password hashing)
- Passport.js (GitHub OAuth configuration Ready)
- Helmet (Security headers)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas Connection String

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CODERS-PROFILES
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/coders_profiles
   SESSION_SECRET=your_secure_session_secret_string
   NODE_ENV=development
   ```

3. **Frontend Setup**
   ```bash
   # Navigate back to root
   cd ..
   npm install
   ```
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

---

## 💻 Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend development server:**
   ```bash
   # From root directory
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`.

---

## 🔒 Security & Performance Measures

- **Helmet Integration**: Implements HTTP headers protecting against XSS, clickjacking, and mime-type sniffing.
- **Strict CORS & Cookies**: Ensures stateful sessions via cookie-based authentication with `withCredentials` settings.
- **Password Protection**: Salting and hashing passwords on register/login via `bcryptjs`.
- **API Resilience**: Handles API timeout states during external platform fetching.

---

## 📝 License

This project is licensed under the MIT License.
