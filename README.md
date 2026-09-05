# DSA / Interview Prep Tracker

A focused, personal Data Structures and Algorithms preparation tracker designed to help software engineers systematically manage problem-solving history, track multi-attempt velocity, highlight topic-wise weaknesses, and prioritize revision using an interval-based spaced repetition model.

---

## Current Development Status

> **Current Milestone**: Phase 7 — Demo Data, Final QA & Production Readiness  
> **Status**: Completed & Verified (Production Candidate)  
> **Architecture**: React 18 + Vite (SPA) consuming MongoDB Aggregation REST endpoints via Express 4

The application is feature-complete, hardened against regressions, and verified across all user flows: JWT authentication, Problem CRUD, multi-attempt practice logging, native MongoDB analytics aggregation, calendar heatmaps, solve velocity charts, and a deterministic spaced-repetition revision queue.

---

## Key Features

- **Dedicated Problem Repository**: Catalog problems with titles, direct coding platform links, difficulty categorization (`Easy`, `Medium`, `Hard`), and multi-topic tags.
- **Multi-Attempt Practice Timeline**: Record multiple practice attempts per problem over time, capturing duration in minutes, detailed learnings/notes, and historical dates.
- **Automatic Status Derivation**: Status (`solved`, `struggled`, `revisit_needed`) dynamically reflects the latest practice attempt without permanent mutational locks on the problem entity.
- **Native MongoDB Aggregation Analytics**:
  - Summary KPI cards with unique problem solve rates.
  - Difficulty distribution donut chart (`Recharts`).
  - Chronological solve velocity area trend (`Recharts`).
  - 20-week practice activity heatmap inspired by developer contribution calendars.
  - Topic weakness rankings sorted descending by struggle ratio, with highest-struggle context insights.
- **Deterministic Spaced Repetition**: Formula-based priority queue scheduling problems for active recall without AI/ML black boxes.
- **Lightweight Non-Intrusive UX**: Toast feedback system, API error normalization, and accessible modal confirmation workflows.
- **Strict User Isolation**: All problem, attempt, and analytics queries are hard-scoped to `req.user._id`.

---

## Architecture Overview

```
dsa-tracker/
├── .gitignore              # Multi-tier Git ignore configuration (secrets strictly excluded)
├── README.md               # Engineering documentation & portfolio case study
├── client/                 # Frontend Single Page Application (React + Vite + Tailwind CSS)
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── analytics.js           # Analytics & revision queue client
│   │   │   ├── attempts.js            # Practice attempt client
│   │   │   ├── axios.js               # Central Axios client with Bearer auth interceptor
│   │   │   └── problems.js            # Problem CRUD client
│   │   ├── components/
│   │   │   ├── analytics/
│   │   │   │   ├── DifficultyChart.jsx    # Recharts difficulty donut chart
│   │   │   │   ├── PracticeHeatmap.jsx    # 20-week calendar activity grid
│   │   │   │   ├── RevisionPreview.jsx    # Dashboard urgent revision widget
│   │   │   │   ├── SolveTrendChart.jsx    # Recharts daily solve velocity trend
│   │   │   │   ├── StatCard.jsx           # Information-dense KPI stat card
│   │   │   │   └── TopicWeaknessChart.jsx # Horizontal topic struggle ratio bars
│   │   │   ├── AttemptForm.jsx        # Practice attempt modal with validation
│   │   │   ├── DeleteConfirmModal.jsx # Accessible destructive confirmation modal
│   │   │   ├── Navbar.jsx             # Desktop & mobile navigation bar
│   │   │   ├── PrivateRoute.jsx       # Route authentication guard
│   │   │   ├── ProblemForm.jsx        # Problem create/edit modal with topic chips
│   │   │   ├── ProblemTable.jsx       # Responsive problems table
│   │   │   └── PublicOnlyRoute.jsx    # Guest-only route guard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # User session & token management
│   │   │   └── ToastContext.jsx       # Non-intrusive notification feedback
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx      # Analytics command center
│   │   │   ├── LoginPage.jsx          # User sign-in
│   │   │   ├── NotFoundPage.jsx       # 404 handler
│   │   │   ├── ProblemDetailPage.jsx  # Problem metadata & chronological attempt history
│   │   │   ├── ProblemsPage.jsx       # Repository with filters and search
│   │   │   ├── RevisionPage.jsx       # Spaced repetition queue
│   │   │   └── SignupPage.jsx         # User registration
│   │   ├── utils/
│   │   │   └── errorHandler.js        # API error message normalization
│   │   ├── App.jsx         # Root routing tree
│   │   ├── index.css       # Tailwind CSS typography & styles
│   │   └── main.jsx        # Application bootstrap
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── server/                 # Backend REST API (Node.js + Express 4 + Mongoose 8)
    ├── scripts/
    │   └── seedDemoData.js            # Safe, isolated realistic demo dataset generator
    ├── src/
    │   ├── config/
    │   │   └── db.js                  # MongoDB Atlas connection lifecycle
    │   ├── controllers/
    │   │   ├── analytics.controller.js# Native MongoDB aggregation analytics
    │   │   ├── attempt.controller.js  # Practice attempt management
    │   │   ├── auth.controller.js     # User authentication & bcrypt hashing
    │   │   └── problem.controller.js  # Problem CRUD with status derivation
    │   ├── middleware/
    │   │   ├── authMiddleware.js      # JWT verification & req.user attachment
    │   │   └── errorMiddleware.js     # JSON error handler & 404 middleware
    │   ├── models/
    │   │   ├── Attempt.js             # Attempt schema with compound index
    │   │   ├── Problem.js             # Problem schema with userId index
    │   │   └── User.js                # User schema with bcrypt comparison
    │   ├── routes/
    │   │   ├── analytics.routes.js    # Protected analytics endpoints
    │   │   ├── attempt.routes.js      # Attempt nested sub-routes
    │   │   ├── auth.routes.js         # Authentication routes
    │   │   ├── healthRoutes.js        # Health check endpoint
    │   │   └── problem.routes.js      # Problem routes
    │   ├── utils/
    │   │   └── generateToken.js       # JWT generation utility
    │   ├── app.js          # Express configuration & CORS middleware
    │   └── server.js       # Server bootstrap & listener
    ├── test/
    │   ├── verify_phase2.js # Automated authentication test suite (11 tests)
    │   ├── verify_phase3.js # Automated Problem/Attempt security test suite (17 tests)
    │   └── verify_phase4.js # Automated Analytics & Revision engine test suite (24 tests)
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
- **Visualization**: Recharts 2
- **HTTP Client**: Axios (with Bearer token interceptor)
- **State Management**: Native React Context (`AuthContext`, `ToastContext`)

### Backend
- **Runtime**: Node.js
- **Web Framework**: Express 4
- **Database ODM**: Mongoose 8
- **Database Engine**: MongoDB Atlas (Native Aggregation Pipelines)
- **Authentication**: JSON Web Token (`jsonwebtoken`), `bcryptjs`
- **In-Memory Testing**: `mongodb-memory-server` (Strictly devDependency)

---

## Key Technical Decisions

### 1. Why Problem and Attempt Are Separate Collections
Storing attempt histories inside a nested array on the Problem document would quickly encounter unbounded document growth and index degradation. Separating `Problem` and `Attempt`:
- Decouples static problem metadata (title, platform, link, topics) from time-series practice telemetry.
- Allows compound indexing on `{ userId: 1, attemptedAt: -1 }` for O(log N) temporal retrieval.
- Prevents write lock contention when logging frequent attempts.
- Enables clean cascade deletion when a problem is removed.

### 2. Why Analytics Are Calculated on the Backend
Calculating summary metrics, heatmaps, and rankings on the client requires downloading every raw attempt document over the network. By performing transformations using native MongoDB `$facet`, `$lookup`, and `$unwind` pipelines:
- The network payload transfers only chart-ready, minified JSON summaries.
- Mobile and lower-powered devices do not suffer from memory bloat or main-thread freezes.
- Data integrity and calculation rules remain centralized and authoritative.

### 3. Why MongoDB Aggregation Over Application-Level Loops
Native aggregation pipelines run directly on the database server in C++ memory:
- Eliminates the overhead of instantiating thousands of Mongoose document instances in Node.js.
- Computes sets, sums, date formatting (`$dateToString`), and group-bys in a single database roundtrip.

### 4. Why Spaced Repetition Uses a Deterministic Model Rather Than AI/ML
Machine learning and generative AI models are non-deterministic, opaque, and introduce unnecessary API costs and latency for simple scheduling tasks. The deterministic interval formula:
$$\text{priorityScore} = \frac{\text{daysSinceLastAttempt}}{\text{intervalForStatus}} + \text{struggleWeight}$$
- Provides transparent, 100% explainable priority rankings to the user.
- Executes in sub-millisecond database queries without external API dependencies.
- Accurately captures urgency by assigning higher weight to struggles (+2.0) and shorter review intervals (2 days).

### 5. Why Redux Was Intentionally Not Used
The application's state requirements are cleanly scoped: authentication session is global, while repository and analytics state are transient to their views. Managing this through React Context (`AuthContext`, `ToastContext`) and standard React hooks:
- Avoids boilerplate actions, reducers, and thunks.
- Keeps client bundle size lean (saving ~150 kB of bundle overhead).
- Prevents stale cache sync issues across tabs.

---

## Environment Configuration

### Backend (`server/.env`)
Copy template:
```bash
cp server/.env.example server/.env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port number for Express server | `5000` |
| `MONGO_URI` | MongoDB connection URI | `mongodb+srv://...` or `mongodb://localhost:27017/dsa_tracker` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `your_secret_key_here` |
| `CLIENT_URL` | *(Optional)* Allowed production client URL for CORS | `http://localhost:5173` |

### Frontend (`client/.env`)
Copy template:
```bash
cp client/.env.example client/.env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base endpoint for backend API | `http://localhost:5000/api` |

---

## Local Setup & Execution

### 1. Install Dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 2. Run Local Development Servers

```bash
# Start backend API (Port 5000)
cd server && npm run dev

# Start frontend client (Port 5173)
cd client && npm run dev
```

The application will be live at `http://localhost:5173`, with API proxying to `http://localhost:5000`.

---

## Demo Dataset & Seed Instructions

To explore the application with a rich, realistic dataset containing 35 problems and 68 historical practice attempts spread over 90 days:

```bash
cd server
npm run seed:demo
```

### Dedicated Demo Account Credentials
- **Email**: `demo@dsa-tracker.local`
- **Password**: `DemoPassword123!`

> [!NOTE]
> The seed script is completely idempotent and safe. It **only** removes and recreates data belonging to `demo@dsa-tracker.local`, leaving all other user accounts in the database completely untouched.

---

## Automated Verification & Testing

### Run All Backend Test Suites
```bash
cd server && npm test
```
Executes 52 automated assertions across 3 comprehensive suites running in-memory MongoDB:
- `test/verify_phase2.js` (Auth, JWT, bcrypt, input validation — 11 tests)
- `test/verify_phase3.js` (Problem CRUD, cascade deletion, user isolation — 17 tests)
- `test/verify_phase4.js` (Analytics aggregations, deterministic scoring — 24 tests)

### Build Frontend Production Bundle
```bash
cd client && npm run build
```
Compiles and tree-shakes client assets into `client/dist/` with 0 build errors.

---

## Spaced Repetition Logic

$$\text{priorityScore} = \frac{\text{daysSinceLastAttempt}}{\text{intervalForStatus}} + \text{struggleWeight}$$

- **Status Intervals**:
  - `solved`: 14 days
  - `revisit_needed`: 5 days
  - `struggled`: 2 days
- **Struggle Weights**:
  - `struggled`: +2.0
  - `revisit_needed`: +1.0
  - `solved`: +0.0
- **Safety Safeguards**:
  - Unattempted problems are excluded.
  - Resolves latest attempt strictly by maximum `attemptedAt` timestamp (not insertion `_id`).
  - Clamps future `attemptedAt` dates to `0` days elapsed.

---

## Production Deployment Configuration

### Backend (Render Web Service)
- **Root Directory**: `server`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node src/server.js`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `PORT`: `10000` (assigned dynamically by Render)
  - `MONGO_URI`: `<Atlas Connection String>`
  - `JWT_SECRET`: `<Secure Random 64-char string>`
  - `JWT_EXPIRES_IN`: `7d`
  - `CLIENT_URL`: `https://your-frontend.vercel.app`

### Frontend (Vercel SPA)
- **Root Directory**: `client`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: `https://your-backend.onrender.com/api`

---

## Engineering Decisions & Future Roadmap

### What Would Be Improved Next
1. **Pagination for Very Large Repositories**: Currently, `GET /api/problems` returns all user problems for instant client-side searching. For users cataloging 1,000+ problems, cursor-based pagination with infinite scrolling would be added.
2. **CSV / JSON Export & Import**: Adding bulk import/export to allow engineers to migrate problem histories from LeetCode or spreadsheet trackers.
3. **Public Profile Sharing**: Optional read-only public sharing link for engineers showcasing their preparation consistency to technical interviewers.
4. **Browser Extension Integration**: A lightweight extension to log attempt outcomes directly from coding platform tabs without leaving the problem environment.

---

## Completed Roadmap

- [x] **Phase 1**: Architecture scaffolding, environment configs, routing shell, health checks, error middleware
- [x] **Phase 2**: User model, JWT authentication, protected routes, auth context
- [x] **Phase 3**: Problem & Attempt data models, validation, core CRUD APIs & UI
- [x] **Phase 4**: Spaced-repetition prioritization engine & backend aggregation analytics
- [x] **Phase 5**: Premium analytics dashboard, Recharts visualizations, practice heatmap, and revision queue UI
- [x] **Phase 6**: Product polish, UX hardening, lightweight toast feedback, responsive quality
- [x] **Phase 7**: Demo dataset, security secret audit, documentation case study, production readiness
