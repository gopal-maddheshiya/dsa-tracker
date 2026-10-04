# DSA / Interview Prep Tracker

An analytics-driven DSA practice tracker that records problems and attempts, identifies topic-level weaknesses, and builds an explainable revision queue from practice history.

---

## Overview

Preparing for technical software engineering interviews requires more than solving problems once. Developers often struggle with retention decay, lose track of topics where they consistently stumble, and rely on arbitrary spreadsheets or generic to-do lists that lack practice context.

This application is built as a focused, developer-centric practice cockpit designed around a core architectural principle: **Problems and Attempts are fundamentally distinct entities**.

- A **Problem** represents canonical challenge metadata (title, platform, link, topics, difficulty).
- An **Attempt** captures a discrete practice session in time (confidence status, duration, notes, timestamp).

By preserving full attempt histories rather than overwriting problem status, the backend continuously computes topic struggle ratios, visualizes practice velocity over time, and schedules spaced revisions using a deterministic Leitner-inspired priority algorithm.

---

## Key Features

- **JWT Authentication**: Secure user registration and session management with salted bcrypt password hashing and token persistence.
- **Problem Management**: Full CRUD capabilities supporting canonical problems across platforms (`leetcode`, `gfg`, `hackerrank`, `codechef`, `other`) and difficulty levels (`easy`, `medium`, `hard`).
- **Attempt History**: Log multiple practice sessions per problem with confidence ratings (`solved`, `revisit_needed`, `struggled`), duration in minutes, and markdown-friendly notes.
- **Search & Filtering**: Multi-criteria client- and server-side filtering by difficulty, topic, attempt status, and free-text search queries.
- **Practice Cockpit Analytics**:
  - **KPI Metrics**: Real-time counters for tracked problems, practice sessions, and solved attempts.
  - **Difficulty Breakdown**: Color-coded distribution donut visualising practice allocation across Easy, Medium, and Hard tiers.
  - **Weekly Solve Trend**: 12-week velocity chart tracking verified solved attempts.
  - **Topic Weakness Detection**: Algorithmic ranking of categories by struggle ratio to expose preparation blind spots.
  - **Calendar Activity Heatmap**: 12-week (84-day) intensity matrix mapping daily practice consistency.
- **Explainable Revision Queue**: Spaced-repetition review queue ranking problems by Leitner priority score with transparent, non-judgmental explanations.
- **Responsive Interface**: Dark-mode zinc/slate aesthetic with fluid desktop tables, responsive mobile cards, and keyboard-accessible modal dialogs.
- **Defensive Error Handling**: Route-level React Error Boundaries, centralized Express JSON error envelopes, and automated input validation.

---

## How It Works

```text
+-----------------------------------------------------------------------------------+
| APPLICATION ARCHITECTURE                                                          |
+-----------------------------------------------------------------------------------+
|  [React 18 + Vite SPA]                                                            |
|  - React Router 6 protected & public route guards                                 |
|  - Centralized Axios client with automatic URL normalization                      |
|  - Route-level code-splitting (isolated charts.js chunk)                          |
|                                                                                   |
|           | HTTPS REST Requests + Bearer JWT                                      |
|           v                                                                       |
|  [Node.js + Express API]                                                          |
|  - Stateless Bearer token verification & user ownership scoping                   |
|  - Security: nosniff, DENY, strict-origin headers, 100kb body limit, rate limiter  |
|  - Server-side MongoDB aggregation pipelines for metrics & struggle ratios         |
|  - Deterministic Leitner priority score calculation                               |
|                                                                                   |
|           | TLS Connection via Mongoose                                           |
|           v                                                                       |
|  [MongoDB Atlas Database]                                                         |
|  - Collections: users, problems, attempts                                         |
|  - Indexed queries: User.email, Problem.userId, Attempt.problemId,                |
|    Attempt compound { userId: 1, attemptedAt: 1 }                                 |
+-----------------------------------------------------------------------------------+
```

### Why Analytics are Backend-Owned
All analytics aggregations and revision scores are calculated entirely on the server. This design choice ensures:
1. **Deterministic Accuracy**: The Leitner revision priority formula and topic struggle ratios remain authoritative and consistent across all client devices.
2. **Client Efficiency**: The browser never downloads unbounded historical attempt records to compute totals, keeping memory footprint low.
3. **Data Protection**: Raw practice notes and cross-user timelines remain protected behind database queries scoped strictly by the authenticated JWT `userId`.

---

## Analytics & Revision Logic

The revision engine uses a deterministic, Leitner-inspired spaced repetition model. Each problem is surfaced according to the recency and outcome of its **latest practice attempt**.

### Revision Configuration
| Latest Attempt Status | Target Revision Interval | Struggle Weight |
| :--- | :---: | :---: |
| `solved` | 14 days | +0 |
| `revisit_needed` | 5 days | +1 |
| `struggled` | 2 days | +2 |

### Priority Score Formula
$$\text{priorityScore} = \left(\frac{\text{daysSinceLastAttempt}}{\text{intervalForStatus}}\right) + \text{struggleWeight}$$

- **Attempt Recency**: As elapsed days increase, `daysSinceLastAttempt / interval` grows proportionally, naturally floating older problems to the top.
- **Struggle Amplification**: Struggling with a problem adds an immediate weight of $+2$ and shrinks the interval to $2$ days, surfacing the problem promptly for reinforcement.
- **Revisit Flag**: Problems marked `revisit_needed` receive a $+1$ weight and a $5$-day interval for timely follow-up.

### Timing Boundary States
The interface evaluates timing status using mutually exclusive precedence:
1. **`overdue`**: $\text{daysSinceLastAttempt} > \text{intervalDays}$ (Past target revision threshold)
2. **`due`**: $\text{daysSinceLastAttempt} \ge \text{intervalDays}$ (Has reached target revision threshold)
3. **`upcoming`**: $\text{daysSinceLastAttempt} < \text{intervalDays}$ (Within retention window)

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, React Router 6, Axios, Lucide React |
| **Typography** | Inter Variable, JetBrains Mono Variable |
| **Backend** | Node.js, Express, Mongoose, JWT (`jsonwebtoken`), bcryptjs, CORS |
| **Database** | MongoDB Atlas (Cloud) / Local MongoDB |
| **Testing** | Node.js Test Runner, MongoDB Memory Server (`mongodb-memory-server`), Assert |
| **Deployment Targets** | Render (Web Service), Vercel (SPA Frontend), MongoDB Atlas (Database) |

---

## Project Structure

```text
dsa-tracker/
├── client/                      # Frontend Single Page Application
│   ├── src/
│   │   ├── api/                 # Axios client, base URL normalizer & endpoint modules
│   │   ├── components/          # Analytics charts, problem tables, revision cards, modals
│   │   ├── context/             # AuthContext session provider
│   │   ├── layouts/             # AppLayout authenticated shell & responsive navbar
│   │   ├── lib/                 # Spaced-repetition utilities & date formatters
│   │   ├── pages/               # DashboardPage, ProblemsPage, ProblemDetailPage, RevisionPage
│   │   └── routes/              # AppRoutes, ProtectedRoute, PublicRoute
│   ├── test/                    # Automated client tests (auth, APIs, revision math, UX audits)
│   ├── vercel.json              # Vercel SPA client-side rewrite rules
│   └── vite.config.js           # Vite configuration & code-splitting manual chunks
│
├── server/                      # Express REST API Backend
│   ├── src/
│   │   ├── config/              # MongoDB connection & lifecycle management
│   │   ├── controllers/         # Auth, Problem, Attempt, and Analytics controllers
│   │   ├── middleware/          # JWT auth guard, rate limiter, security headers, error handler
│   │   ├── models/              # Mongoose schemas (User, Problem, Attempt)
│   │   ├── routes/              # Express route declarations (health, auth, problems, analytics)
│   │   └── utils/               # Priority score calculator & JWT helpers
│   ├── scripts/
│   │   └── seedDemo.js          # On-demand portfolio dataset generator
│   └── test/                    # In-memory integration test suites (108 tests)
│
├── docs/                        # Pre-flight release verification checklist
│   └── release-checklist.md
├── package.json                 # Workspace orchestration scripts
└── README.md                    # Project documentation
```

---

## API Overview

All protected endpoints require an `Authorization: Bearer <token>` header. Responses follow a standardized JSON envelope (`{ success: true, data: ... }`).

| Group | Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :---: | :--- |
| **Health** | `GET` | `/api/health` | Public | API health ping and runtime environment check |
| **Auth** | `POST` | `/api/auth/signup` | Public* | Register a new user account (rate-limited) |
| **Auth** | `POST` | `/api/auth/login` | Public* | Authenticate user credentials & issue JWT (rate-limited) |
| **Auth** | `GET` | `/api/auth/me` | Private | Retrieve authenticated user profile identity |
| **Problems** | `GET` | `/api/problems` | Private | List problems with latest attempt status & filters |
| **Problems** | `POST` | `/api/problems` | Private | Create a new problem record |
| **Problems** | `GET` | `/api/problems/:id` | Private | Retrieve problem details and full attempt history |
| **Problems** | `PUT` | `/api/problems/:id` | Private | Update problem metadata |
| **Problems** | `DELETE` | `/api/problems/:id` | Private | Delete problem with cascading attempt deletion |
| **Attempts** | `POST` | `/api/problems/:id/attempts` | Private | Record a practice session attempt |
| **Attempts** | `GET` | `/api/problems/:id/attempts` | Private | Retrieve attempt history for a specific problem |
| **Analytics** | `GET` | `/api/analytics/summary` | Private | Aggregate counters & difficulty distribution |
| **Analytics** | `GET` | `/api/analytics/topics` | Private | Topic weakness rankings and struggle ratios |
| **Analytics** | `GET` | `/api/analytics/trend` | Private | Weekly volume trend of solved attempts |
| **Analytics** | `GET` | `/api/analytics/heatmap` | Private | 12-week daily practice activity distribution |
| **Analytics** | `GET` | `/api/analytics/revision-queue` | Private | Prioritized spaced-repetition revision queue |

*\* Sensitive auth routes enforce sliding-window rate limiting (30 requests / 15 mins).*

---

## Data Model

```text
  +------------------+         1 : N         +-------------------+
  |       User       | --------------------> |      Problem      |
  +------------------+                       +-------------------+
  | _id (ObjectId)   |                       | _id (ObjectId)    |
  | name (String)    |                       | userId (Ref:User) | [Index]
  | email (String)   | [Unique Index]        | title (String)    |
  | passwordHash     | [select: false]       | platform (Enum)   |
  | createdAt (Date) |                       | link (URL String) |
  +------------------+                       | topics ([String]) |
           |                                 | difficulty (Enum) |
           | 1 : N                           | createdAt (Date)  |
           |                                 +-------------------+
           v                                           |
  +-------------------------------------+              | 1 : N
  |               Attempt               | <------------+
  +-------------------------------------+
  | _id (ObjectId)                      |
  | problemId (Ref: Problem)            | [Index]
  | userId (Ref: User)                  |
  | status (solved|struggled|revisit)   |
  | timeTakenMinutes (Number, nullable) |
  | notes (String)                      |
  | attemptedAt (Date)                  |
  +-------------------------------------+
  Compound Index: { userId: 1, attemptedAt: 1 }
```

- **Separation of Problem and Attempt**: Allows users to attempt a single challenge multiple times over weeks or months, preserving speed improvements, note revisions, and status changes without data loss.
- **Cascading Deletion**: Deleting a `Problem` automatically deletes all associated `Attempt` documents owned by that user.
- **Indexes**: Efficient single-field indexes on foreign keys (`userId`, `problemId`) and a compound index `{ userId: 1, attemptedAt: 1 }` to power fast chronological heatmap and trend aggregations.

---

## Testing & Quality Baseline

The project maintains a zero-dependency automated test suite executing across isolated environments.

### Verified Test Results
- **Backend Tests**: **108 / 108 passing** (`npm test --prefix server`)
  - `health.test.js`: Health check endpoints and 404 JSON middleware.
  - `models.test.js`: Mongoose schema validations, enum guards, email normalization, and indexing.
  - `auth.test.js` (17 tests): Signup, bcrypt encryption, duplicate prevention, JWT signing, bearer validation, token expiration, and profile retrieval.
  - `problems.test.js` (38 tests): Authentication enforcement, problem CRUD, cross-user isolation, multi-filter queries, attempt logging, and cascading deletions.
  - `analytics.test.js` (35 tests): Summary math, difficulty breakdown, topic struggle ratios, weekly trends, heatmap counts, and Leitner priority ranking.
  - `seed.test.js` (11 tests): Demo seeder idempotency, isolation against third-party user data, referential integrity, and live analytics invariants.
- **Frontend Test Suites**: **6 / 6 passing** (`npm test --prefix client`)
  - `authClient.test.js`: Token persistence, retrieval, and namespaced storage removal.
  - `problemsApi.test.js`: Method signatures, platform contract consistency, and filter helpers.
  - `analyticsApi.test.js`: Metric semantics, date formatting, and 84-day heatmap matrix generator.
  - `revisionApi.test.js`: Leitner formula calculations, timing boundaries, and rank padding.
  - `uxAudit.test.js`: Strict timing state mutual exclusivity, platform enum validation, and React hook import integrity audit.
  - `apiClient.test.js`: Axios base URL normalizer permutations (trailing slashes, bare domains, proxy paths).
- **Production Build**: Clean compilation via `npm run build --prefix client` with isolated code-split vendor and chart bundles.

---

## Demo Data & Portfolio Evaluation

To explore the analytics cockpit and revision queue with realistic practice data, an on-demand seed script is included.

```bash
# Execute from workspace root
npm run seed:demo
```

### Verified Dataset Telemetry
- **35 DSA Problems**: Balanced across Easy (15), Medium (14), and Hard (6) spanning LeetCode, GeeksforGeeks, HackerRank, CodeChef, and other sources.
- **92 Practice Attempts**: Distributed over a 12-week timeline (~84 days) across 38 active calendar days.
- **Realistic Revision Candidates**: Populates overdue items (e.g. struggled 6d ago), due items (revisit-needed 5d ago), long-term retention items (solved 22d ago), and upcoming candidates.
- **Strict Data Isolation**: The script runs idempotently for the demo user without modifying or exposing other accounts.

> **Security Note**: In production deployments, demo data should be seeded only if intentionally providing a public showcase. Production users should register dedicated accounts through `/signup`.

---

## Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance or free MongoDB Atlas cluster

### 2. Installation
```bash
# Clone the repository
git clone <repository-url>
cd dsa-tracker

# Install all client and server dependencies
npm install --prefix client
npm install --prefix server
```

### 3. Environment Configuration
Create `server/.env`:
```env
PORT=5000
HOST=0.0.0.0
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=local_development_jwt_secret_key
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dsa_tracker?retryWrites=true&w=majority
```

Create `client/.env`:
```env
VITE_API_BASE_URL=/api
```

*(In local development, `/api` is automatically proxied to `http://localhost:5000` by the Vite dev server).*

### 4. Running the Application
```bash
# Start backend Express server (port 5000)
npm run server

# In a separate terminal, start frontend Vite client (port 5173)
npm run client
```

### 5. Running Automated Tests
```bash
# Run both backend and frontend test suites from root
npm test
```

---

## Production Deployment

The project is structured for deployment to **Render** (Express API) and **Vercel** (React SPA) connected to **MongoDB Atlas**.

### Configuration Status
- **Backend (Render)**: Ready for deployment. Configured with dynamic `PORT`, `0.0.0.0` `HOST` binding, clean startup sequencing, and graceful `SIGTERM`/`SIGINT` shutdowns.
- **Frontend (Vercel)**: Ready for deployment. Includes `client/vercel.json` SPA rewrite rule (`/(.*) -> /index.html`) to prevent 404 errors on direct navigation or page refresh.
- **Database (MongoDB Atlas)**: Dedicated user privileges and network security guidelines prepared in [`docs/release-checklist.md`](file:///c:/Users/hp/OneDrive/Desktop/dsa-tracker/docs/release-checklist.md).

### Environment Variable Requirements

**Render Web Service (`server`)**:
| Variable | Value / Format | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Suppresses internal error stack traces |
| `PORT` | *(Provided by Render)* | Dynamically assigned port |
| `HOST` | `0.0.0.0` | Network interface binding |
| `MONGO_URI` | `mongodb+srv://...` | Dedicated production MongoDB Atlas URI |
| `JWT_SECRET` | *(64-character random hex)* | Cryptographic signature secret |
| `CLIENT_URL` | `<VERCEL_FRONTEND_URL>` | Allowed CORS origin (supports comma-separated list) |

**Vercel Project (`client`)**:
| Variable | Value / Format | Purpose |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `<RENDER_BACKEND_URL>/api` | Deployed backend API base URL |

*(The client URL normalizer automatically formats the URL even if entered without `/api` or with a trailing slash).*

---

## Security Considerations

The application implements defense-in-depth measures appropriate for a modern web service:
- **Password Protection**: Passwords hashed with `bcryptjs` (salt rounds: 10). Passwords and hashes are excluded by default (`select: false`) on database models.
- **Stateless Authentication**: Verified via signed JWTs with expiration windows. Tokens are namespaced in client storage to prevent cross-app collisions.
- **Resource Ownership Scoping**: Every problem and attempt query strictly asserts `userId: req.user.userId`. Users cannot read, edit, or delete records belonging to others.
- **Authentication Rate Limiting**: Zero-dependency in-memory sliding-window limiter on `/api/auth/signup` and `/api/auth/login` (30 requests / 15 minutes per IP).
- **Request Size Boundaries**: `express.json({ limit: '100kb' })` prevents memory exhaustion from oversized request bodies.
- **Security Headers**: Custom middleware sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: strict-origin-when-cross-origin`.
- **Fingerprint Suppression**: Express `X-Powered-By` header is explicitly disabled.
- **CORS Allowlist**: Rejects unauthorized cross-origin requests in production while permitting local development and headless testing.
- **Error Sanitization**: Production error responses return clean user-facing messages, withholding database diagnostics and stack traces.

---

## Engineering Decisions

1. **Separation of Problem vs. Attempt**: Rather than storing a single mutable status field on a problem, attempts are modeled as separate historical records. This enables velocity tracking over time, accurate struggle ratios, and non-destructive revision scheduling.
2. **Backend-Owned Analytics**: Aggregations for trends, weekly solves, and topic friction are computed in MongoDB via aggregation pipelines rather than processing large datasets in the browser.
3. **MongoDB Aggregation Pipelines**: Leveraging compound indexes (`{ userId: 1, attemptedAt: 1 }`) enables the database engine to filter, group, and calculate metrics in a single network round-trip.
4. **React Context over Heavy State Libraries**: Application-wide state is limited to user authentication. Standard React Context paired with isolated component state eliminated the unnecessary overhead and boilerplate of Redux or Zustand.
5. **Route-Level Code Splitting**: Heavy charting dependencies (`recharts`) and icon packages (`lucide-react`) are isolated into dedicated chunks (`charts.js`, `icons.js`) via Vite's `manualChunks`, keeping the initial authentication and layout bundles small.
6. **Responsive Table & Mobile Card Experience**: The problem catalog and revision queue dynamically shift from high-density data tables on desktop to touch-friendly card layouts on mobile viewports.
7. **Deterministic Leitner Revision Algorithm**: Chosen over opaque machine learning models or black-box predictions. The formula is explainable, reproducible, and provides transparent reasons for every recommendation.
8. **Stateless JWT Authorization**: Avoids session storage lookup bottlenecks on the server, facilitating straightforward container scaling and zero-downtime rollouts.

---

## Known Limitations & Future Improvements

- **Spaced Repetition Granularity**: The current Leitner model operates on 3 discrete intervals (2d, 5d, 14d). A future enhancement could implement an adaptive SuperMemo SM-2 algorithm based on repeated consecutive successes.
- **Distributed Rate Limiting**: The current rate limiter uses an in-memory sliding window suitable for single-instance deployments. A multi-instance cluster would benefit from Redis-backed rate limiting.
- **CSV / Anki Export**: Providing data export functionality to allow users to backup their problem notes or export revision cards to external tools.
- **Offline Capabilities**: Adding Service Worker caching for offline problem browsing and note drafting.

---

## Screenshots / Visual Tour

*(Screenshots will be added upon final production deployment)*

| View | Description | Preview |
| :--- | :--- | :---: |
| **Dashboard** | KPI summary cards, weekly trend chart, difficulty donut, and 12-week heatmap | `[TODO: Add dashboard screenshot]` |
| **Problems Catalog** | Filterable problem table with platform badges, difficulty pills, and attempt counters | `[TODO: Add problems screenshot]` |
| **Problem Details** | Attempt history timeline with practice duration and solution notes | `[TODO: Add problem detail screenshot]` |
| **Revision Queue** | Ranked revision cards showing Leitner priority scores and timing badges | `[TODO: Add revision queue screenshot]` |

---

## Deployment & Demo Links

- **Live Application**: `<VERCEL_FRONTEND_URL>` *(Pending production deployment)*
- **API Health Check**: `<RENDER_BACKEND_URL>/api/health` *(Pending production deployment)*
- **GitHub Repository**: `<GITHUB_REPOSITORY_URL>`

---

## Author & Project Context

Developed as a personal B.Tech Computer Science & Engineering capstone project focusing on practical data modeling, backend API design, performance optimization, and algorithmic practice tracking.
