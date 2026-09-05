# DSA / Interview Prep Tracker

A focused, personal Data Structures and Algorithms preparation tracker designed to help software engineers systematically manage problem-solving history, track multi-attempt velocity, highlight topic-wise weaknesses, and prioritize revision using an interval-based spaced repetition model.

---

## Current Development Status

> **Current Milestone**: Phase 2 — Database Schema + Authentication  
> **Status**: Completed  
> **Next Milestone**: Phase 3 — Problem & Attempt Data Models + Core CRUD APIs

In Phase 2, the User schema, bcrypt password hashing, stateless JWT authentication, protected API middleware, React AuthContext, functional Login/Signup pages, and client-side private routing guards are fully implemented.

---

## Planned Architecture

```
dsa-tracker/
├── .gitignore              # Monorepo/multi-package Git ignore configuration
├── README.md               # Engineering documentation
├── client/                 # Frontend Single Page Application (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/            # Centralized Axios client with Bearer auth interceptor
│   │   ├── components/     # Navbar, PrivateRoute, PublicOnlyRoute
│   │   ├── context/        # AuthContext (React context session management)
│   │   ├── hooks/          # Custom hooks (useAuth)
│   │   ├── pages/          # LoginPage, SignupPage, DashboardPage, etc.
│   │   ├── App.jsx         # Application routing tree with route guards
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
    │   ├── controllers/    # auth.controller.js (signup, login, getMe)
    │   ├── middleware/     # errorMiddleware.js, authMiddleware.js
    │   ├── models/         # User.js (Mongoose schema, bcrypt comparison)
    │   ├── routes/         # healthRoutes.js, auth.routes.js
    │   ├── utils/          # generateToken.js
    │   ├── app.js          # Express application initialization & middleware
    │   └── server.js       # Server bootstrap and HTTP listener
    ├── test/               # verify_phase2.js (automated auth verification)
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

### Planned Dependencies (Future Phases)
- **Analytics & Visualizations**: Recharts

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

---

## Planned Roadmap

- [x] **Phase 1**: Architecture scaffolding, environment configs, routing shell, health checks, error middleware
- [x] **Phase 2**: User model, JWT authentication, protected routes, auth context
- [ ] **Phase 3**: Problem & Attempt data models, validation, core CRUD APIs
- [ ] **Phase 4**: Problem management UI, attempt logging interface, tags & difficulty filters
- [ ] **Phase 5**: Spaced-repetition prioritization engine & revision queue
- [ ] **Phase 6**: Analytics, weakness matrices, and practice heatmaps
