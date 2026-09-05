# DSA / Interview Prep Tracker

A focused, personal Data Structures and Algorithms preparation tracker designed to help software engineers systematically manage problem-solving history, track multi-attempt velocity, highlight topic-wise weaknesses, and prioritize revision using an interval-based spaced repetition model.

---

## Current Development Status

> **Current Milestone**: Phase 3 — Problem + Attempt CRUD  
> **Status**: Completed  
> **Next Milestone**: Phase 4 — Spaced Repetition Engine, Analytics & Heatmap Visualization

In Phase 3, the complete Problem and Attempt data models, indexes, user-scoped controllers, cascade deletion, latest-attempt derived status filtering, frontend API modules, interactive problem tables, search and filters, problem detail views, and attempt logging timelines are fully implemented.

---

## Planned Architecture

```
dsa-tracker/
├── .gitignore              # Monorepo/multi-package Git ignore configuration
├── README.md               # Engineering documentation
├── client/                 # Frontend Single Page Application (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js    # Axios client with Bearer auth interceptor
│   │   │   ├── problems.js # Problem CRUD API client
│   │   │   └── attempts.js # Attempt logging API client
│   │   ├── components/
│   │   │   ├── AttemptForm.jsx        # Log practice attempt modal
│   │   │   ├── DeleteConfirmModal.jsx # Destructive delete confirmation
│   │   │   ├── Navbar.jsx             # Navigation bar with auth state
│   │   │   ├── PrivateRoute.jsx       # Route authentication guard
│   │   │   ├── ProblemForm.jsx        # Add/edit problem modal with tag input
│   │   │   ├── ProblemTable.jsx       # High-density problems table
│   │   │   └── PublicOnlyRoute.jsx    # Guest-only route wrapper
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Authentication session provider
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx      # Overview (Phase 4 analytics target)
│   │   │   ├── LoginPage.jsx          # User sign-in
│   │   │   ├── NotFoundPage.jsx       # 404 handler
│   │   │   ├── ProblemDetailPage.jsx  # Problem metadata & attempt history
│   │   │   ├── ProblemsPage.jsx       # Problem repository with filters/search
│   │   │   ├── RevisionPage.jsx       # Spaced repetition queue (Phase 4)
│   │   │   └── SignupPage.jsx         # User registration
│   │   ├── App.jsx         # Application routing tree
│   │   ├── index.css       # Tailwind CSS typography & styles
│   │   └── main.jsx        # Application bootstrap
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── server/                 # Backend REST API (Node.js + Express + Mongoose)
    ├── src/
    │   ├── config/
    │   │   └── db.js                  # MongoDB Atlas / local connection
    │   ├── controllers/
    │   │   ├── attempt.controller.js  # Attempt creation & history
    │   │   ├── auth.controller.js     # User registration & login
    │   │   └── problem.controller.js  # Problem CRUD with status derivation
    │   ├── middleware/
    │   │   ├── authMiddleware.js      # JWT verification & req.user attachment
    │   │   └── errorMiddleware.js     # JSON error handler & 404 middleware
    │   ├── models/
    │   │   ├── Attempt.js             # Attempt schema with compound index
    │   │   ├── Problem.js             # Problem schema with userId index
    │   │   └── User.js                # User schema with bcrypt comparison
    │   ├── routes/
    │   │   ├── attempt.routes.js      # Attempt nested sub-routes
    │   │   ├── auth.routes.js         # Authentication routes
    │   │   ├── healthRoutes.js        # Health check endpoint
    │   │   └── problem.routes.js      # Problem routes
    │   ├── utils/
    │   │   └── generateToken.js       # JWT generation utility
    │   ├── app.js          # Express app configuration & route mounting
    │   └── server.js       # Server bootstrap & listener
    ├── test/
    │   ├── verify_phase2.js # Automated authentication test suite
    │   └── verify_phase3.js # Automated Problem/Attempt security test suite
    ├── .env.example
    └── package.json
```

---

## Tech Stack

### Frontend
- **Framework**: React 18
- **Tooling / Bundler**: Vite
- **Routing**: React Router DOM (v6)
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios (with Bearer token interceptor)
- **State Management**: React Context (`AuthContext`)

### Backend
- **Runtime**: Node.js
- **Web Framework**: Express 4
- **Database ODM**: Mongoose 8
- **Authentication**: JSON Web Token (`jsonwebtoken`), `bcryptjs`
- **Environment Management**: Dotenv
- **Cross-Origin Handling**: CORS

---

## Environment Configuration

### Backend (`server/.env`)
Copy the template file to `.env`:
```bash
cp server/.env.example server/.env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port number for Express server | `5000` |
| `MONGO_URI` | MongoDB connection URI | `mongodb+srv://...` or `mongodb://localhost:27017/dsa_tracker` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `your_secret_key_here` |

### Frontend (`client/.env`)
Copy the template file to `.env` (optional in local dev, defaults to `http://localhost:5000/api`):
```bash
cp client/.env.example client/.env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base endpoint for the backend API | `http://localhost:5000/api` |

---

## Local Setup & Execution

### 1. Install Dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd ../client
npm install
```

---

### 2. Running the Application

#### Start the Backend API
```bash
cd server
npm run dev    # Starts server with nodemon auto-reloading
# or
npm start      # Starts server using standard node runtime
```
The server will start at `http://localhost:5000`.

#### Start the Frontend Client
```bash
cd client
npm run dev
```
The client will be available at `http://localhost:5173`.

#### Run Backend Verification Tests
```bash
cd server
npm test
```

---

## API Endpoints

### Health Check
- `GET /api/health` — Public status check

### Authentication
- `POST /api/auth/signup` — Register a new account (`name`, `email`, `password`)
- `POST /api/auth/login` — Authenticate existing account (`email`, `password`)
- `GET /api/auth/me` — Retrieve authenticated user profile (Requires `Bearer <token>`)

### Problems (All Require Authentication)
- `GET /api/problems` — List problems for authenticated user (Supports `?topic=`, `?difficulty=`, `?status=`, `?search=`)
- `POST /api/problems` — Create new problem (`title`, `platform`, `link`, `topics`, `difficulty`)
- `GET /api/problems/:id` — Get problem details with attempt history
- `PUT /api/problems/:id` — Update problem fields
- `DELETE /api/problems/:id` — Delete problem and cascade delete all related attempts

### Attempts (All Require Authentication)
- `POST /api/problems/:id/attempts` — Log practice attempt (`status`, `timeTakenMinutes`, `notes`, `attemptedAt`)
- `GET /api/problems/:id/attempts` — Get chronological attempt history for problem

---

## Planned Roadmap

- [x] **Phase 1**: Architecture scaffolding, environment configs, routing shell, health checks, error middleware
- [x] **Phase 2**: User model, JWT authentication, protected routes, auth context
- [x] **Phase 3**: Problem & Attempt data models, validation, core CRUD APIs & UI
- [ ] **Phase 4**: Spaced-repetition prioritization engine & revision queue
- [ ] **Phase 5**: Analytics, weakness matrices, and practice heatmaps
