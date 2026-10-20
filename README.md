# CodersHub 🚀

[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
<img width="1868" height="1073" alt="image" src="https://github.com/user-attachments/assets/53abaf11-a04a-4008-b7e4-b3002a7c4dde" />

CodersHub is a full-stack developer analytics platform designed to aggregate, track, and visualize coding activity across **GitHub**, **LeetCode**, and **Codeforces** in a single unified glassmorphic dashboard.

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
- Passport.js (optional GitHub OAuth; requires provider credentials)
- Helmet (Security headers)

---

## 🚀 Getting Started

### Project Structure

```text
CodersHub/
├── backend/        # Express.js backend (deployed on Render)
├── frontend/       # React + Vite frontend (deployed on Vercel)
├── README.md
└── .gitignore
```

### Prerequisites
- Node.js 22.12 or higher (required by the updated Vite toolchain)
- MongoDB Atlas Connection String

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ankesh15/CodersHub.git
   cd CodersHub
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
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:5000
   NODE_ENV=development
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory:
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
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`.

### Production Build

To build the frontend for production, navigate to the `frontend` directory and run:
```bash
cd frontend
npm run build
```
This will compile the application into the `frontend/dist` directory, which is configured for Vercel deployment.

---

## 🔒 Security & Performance Measures

- **Helmet Integration**: Implements HTTP headers protecting against XSS, clickjacking, and mime-type sniffing.
- **Strict CORS & Cookies**: Ensures stateful sessions via cookie-based authentication with `withCredentials` settings.
- **Password Protection**: Salting and hashing passwords on register/login via `bcryptjs`.
- **API Resilience**: Handles API timeout states during external platform fetching.

---

## 📝 License

This project is licensed under the MIT License.


## Deployment configuration

See [DEPLOYMENT.md](DEPLOYMENT.md) for exact Vercel/Render roots, commands,
environment variables, session-secret rotation, and unavailable hosting evidence.
Production builds now require an explicit `VITE_API_BASE_URL`.

## Verification and current limitations

See [AUDIT_REPORT.md](AUDIT_REPORT.md) for the source audit, implemented repairs,
verification results, changed files, and remaining limitations. Existing database
users and local `.env` files are preserved.

- `GET /api/health` reports database readiness; database-backed routes return 503
  when MongoDB is unavailable. Platform APIs remain available in development.
- Sessions use the existing MongoDB connection when available. Production requires
  MongoDB and a `SESSION_SECRET` of at least 32 characters. Set a stable secret in
  development too, so sessions survive restarts.
- GitHub OAuth additionally needs `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`,
  `FRONTEND_URL`, and `BACKEND_URL`. Register the callback
  `<BACKEND_URL>/api/auth/github/callback` with GitHub. OAuth never silently links
  an existing account by a publicly editable GitHub username or email.
- `GITHUB_TOKEN` is optional and is used only on the backend for public API limits.
- Without `VITE_API_BASE_URL`, development requests use `/api` through Vite's
  proxy to `http://localhost:5000`; `API_PROXY_TARGET` can override that target.
  Production must set `VITE_API_BASE_URL` to the backend URL including `/api`,
  or provide a same-origin `/api` reverse proxy. Vite environment changes require
  restarting the development server or rebuilding production assets.
- Production cookies require HTTPS. If the frontend and API use different sites,
  browser third-party-cookie restrictions may require a same-site deployment or
  reverse proxy.
- The existing leaderboard lists profiles by join date; it does not compute an
  aggregate activity ranking. GitHub heatmaps show limited recent public events,
  not complete yearly contribution counts. Private LeetCode calendars are reported
  as unavailable without hiding public solve statistics.

### Repeatable checks

Run these commands from the project root:

```bash
npm --prefix backend ci
npm --prefix frontend ci
npm --prefix backend run lint
npm --prefix backend test
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend run build
npm --prefix frontend run test:e2e
npm --prefix frontend run test:e2e:production
```

Backend and browser tests use a temporary MongoDB instance, never `backend/.env`
or the configured user database. The first run may download a MongoDB test binary;
set `MONGOMS_DOWNLOAD_DIR=/tmp/codershub-mongodb` to keep that cache in `/tmp`.
Browser tests use installed Google Chrome; if Chrome is unavailable, configure
Playwright's browser channel with `PLAYWRIGHT_CHANNEL=chromium` and install
the browser with `cd frontend && npx playwright install chromium`. Test servers use ports 5051 and
5173, which must be free.

For real, read-only external API smoke checks:

```bash
cd backend
node test/platform-smoke.cjs
```

This command reports actual upstream results, including failures and partial data;
it does not replace upstream services with fixtures. It exits nonzero when any
provider fails, including the legacy CodeChef provider currently returning HTTP
402. See the audit report for the actual results.

For an opt-in browser check of actual GitHub, LeetCode, and Codeforces statistics,
charts, heatmaps, badges, and print output:

```bash
npm --prefix frontend run test:e2e:live
```

This check requires those external APIs to be available. It creates only a temporary
test profile and records live browser artifacts under `frontend/test-results-live/`.

### Deployed checks are separate from local/CI checks

`VERIFY_FRONTEND_URL=https://your-frontend.example VERIFY_BACKEND_URL=https://your-backend.example npm --prefix backend run test:deployment`
performs GET/OPTIONS-only checks against an existing hosted environment. Run it
separately for Preview and Production. It exits nonzero on routing, readiness,
CORS, asset/API configuration, or public-field privacy failures. It never signs
in or changes user data. See [DEPLOYMENT.md](DEPLOYMENT.md) for confirmed hosting
state and the manual release/configuration sequence.
