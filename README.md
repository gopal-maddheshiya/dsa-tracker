# DSA / Interview Prep Tracker

A focused, personal Data Structures and Algorithms preparation tracker designed to help software engineers systematically manage problem-solving history, track multi-attempt velocity, highlight topic-wise weaknesses, and prioritize revision using an interval-based spaced repetition model.

---

## Current Development Status

> **Current Milestone**: Phase 1 — Project Foundation & Engineering Scaffolding  
> **Status**: Completed  
> **Next Milestone**: Phase 2 — Data Models & Authentication Foundation

In Phase 1, the core architecture, tooling, environment configurations, and baseline communication channels are established. Real models, authentication workflows (JWT/bcrypt), CRUD endpoints, data analytics, and interactive charts are deliberately deferred to their designated phases.

---

## Planned Architecture

```
dsa-tracker/
├── .gitignore              # Monorepo/multi-package Git ignore configuration
├── README.md               # Engineering documentation
├── client/                 # Frontend Single Page Application (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/            # Centralized Axios client & API helpers
│   │   ├── components/     # Reusable UI layout & navigational elements
│   │   ├── context/        # React Context stores (planned)
│   │   ├── hooks/          # Custom utility & lifecycle hooks (planned)
│   │   ├── pages/          # Routed page views (placeholders in Phase 1)
│   │   ├── App.jsx         # Application routing tree
│   │   ├── index.css       # Tailwind CSS directives & typography rules
│   │   └── main.jsx        # Client DOM mounting
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── server/                 # Backend REST API (Node.js + Express + Mongoose)
    ├── src/
    │   ├── config/         # Database and infrastructure connections
    │   ├── controllers/    # Route controllers (planned)
    │   ├── middleware/     # Error handling and upcoming auth middleware
    │   ├── models/         # Mongoose schemas (planned)
    │   ├── routes/         # Express API route modules
    │   ├── utils/          # Helper functions & spaced-repetition logic (planned)
    │   ├── app.js          # Express application initialization & middleware
    │   └── server.js       # Server bootstrap and HTTP listener
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
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Web Framework**: Express 4
- **Database ODM**: Mongoose 8
- **Environment Management**: Dotenv
- **Cross-Origin Handling**: CORS

### Planned Dependencies (Future Phases)
- **Authentication**: JWT (`jsonwebtoken`), `bcryptjs`
- **Analytics & Visualizations**: Recharts
- **Database Engine**: MongoDB (Local or MongoDB Atlas)

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
| `MONGO_URI` | MongoDB connection URI | `mongodb://localhost:27017/dsa_tracker` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | Placeholder (deferred to Phase 2) |

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

---

## API Health Check Endpoint

To verify that the Express server is up and responsive:

```http
GET /api/health
Host: http://localhost:5000
```

**Expected Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "DSA Tracker API is running"
}
```

---

## Planned Roadmap

- [x] **Phase 1**: Architecture scaffolding, environment configs, routing shell, health checks, error middleware
- [ ] **Phase 2**: User model, JWT authentication, protected routes, auth context
- [ ] **Phase 3**: Problem & Attempt data models, validation, core CRUD APIs
- [ ] **Phase 4**: Problem management UI, attempt logging interface, tags & difficulty filters
- [ ] **Phase 5**: Spaced-repetition prioritization engine & revision queue
- [ ] **Phase 6**: Analytics, weakness matrices, and practice heatmaps
