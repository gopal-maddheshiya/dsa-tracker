# Production Release & Pre-Flight Verification Checklist

This document details the practical step-by-step verification checklist for deploying the DSA / Interview Prep Tracker to **Render** (Express API) and **Vercel** (React + Vite Client) connected to **MongoDB Atlas**.

---

## 1. Local Pre-Deployment Verification

- [ ] **Full Automated Test Suite**:
  ```bash
  npm test
  ```
  - [ ] 108 / 108 backend tests passing (health, models, auth, problems, analytics, seed).
  - [ ] 6 / 6 frontend test suites passing (auth, problems, analytics, revision, UX audits, URL normalizer).
- [ ] **Client Production Build**:
  ```bash
  npm run build --prefix client
  ```
  - [ ] Vite compiles cleanly with zero bundling errors.
  - [ ] Code-split bundles verified: `index.js`, `vendor.js`, `charts.js`.
- [ ] **Repository Hygiene & Secret Audit**:
  ```bash
  git status
  git ls-files | grep .env
  ```
  - [ ] Zero untracked `.env` files staged or tracked in git.
  - [ ] Only `.env.example` templates committed.
  - [ ] Zero database connection strings, passwords, or JWT secrets in source code.

---

## 2. MongoDB Atlas Production Database

- [ ] **Cluster Active**: A cluster (M0 free tier or higher) is operational on MongoDB Atlas.
- [ ] **Dedicated Database User**:
  - [ ] Created a dedicated user (e.g. `dsa_tracker_prod_user`) with `readWrite` privileges scoped strictly to the `dsa_tracker` database.
  - [ ] Root/admin credentials are NOT used.
  - [ ] Password generated using a cryptographically random 32+ character string.
- [ ] **Network Access Rules**:
  - [ ] *Render Free/Starter Tier*: Added `0.0.0.0/0` (Allow access from anywhere).  
    *(Security Notice: Required for Render dynamic egress IP pools; compensated by strong user credentials and database-scoped authorization).*
  - [ ] *Dedicated Hosting / Static Egress*: Restricted to static outbound IP range if configured.
- [ ] **Database Connection URI**: Formatted properly:
  ```text
  mongodb+srv://<db_user>:<db_password>@<cluster>.mongodb.net/dsa_tracker?retryWrites=true&w=majority
  ```

---

## 3. Backend Deployment (Render Web Service)

- [ ] **Service Configuration**:
  - **Root Directory**: `server`
  - **Environment**: `Node`
  - **Build Command**: `npm install`
  - **Start Command**: `npm start` (executes `node src/server.js`)
- [ ] **Environment Variables**:
  | Variable | Value / Format | Purpose |
  | :--- | :--- | :--- |
  | `NODE_ENV` | `production` | Suppresses debug stack traces in error envelopes |
  | `PORT` | *(Provided by Render)* | Express dynamically binds to `process.env.PORT` |
  | `HOST` | `0.0.0.0` | Container external interface binding |
  | `MONGO_URI` | `mongodb+srv://...` | Dedicated production MongoDB Atlas URI |
  | `JWT_SECRET` | *(64-char random hex)* | Cryptographic signing secret |
  | `CLIENT_URL` | `https://<your-app>.vercel.app` | Allowed CORS origin (Vercel deployment domain) |
- [ ] **Health Endpoint Verification**:
  - Visited `https://<render-backend-url>/api/health`.
  - Returned HTTP 200 with `{ "success": true, "message": "DSA Tracker API is running" }`.

---

## 4. Frontend Deployment (Vercel SPA)

- [ ] **Project Configuration**:
  - **Root Directory**: `client`
  - **Framework Preset**: `Vite`
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
- [ ] **Environment Variables**:
  | Variable | Value / Format | Purpose |
  | :--- | :--- | :--- |
  | `VITE_API_BASE_URL` | `https://<render-backend-url>/api` | Deployed backend API base URL |
- [ ] **SPA Rewrite Rule**:
  - Confirmed `client/vercel.json` contains:
    ```json
    {
      "rewrites": [
        {
          "source": "/(.*)",
          "destination": "/index.html"
        }
      ]
    }
    ```
- [ ] **Direct Route Reload Test**:
  - Navigated directly to `/dashboard`, `/problems`, `/revision`.
  - Reloaded page (F5 / Cmd+R) — confirmed view loads without 404.

---

## 5. End-to-End Post-Deployment Smoke Tests

- [ ] **User Authentication Flow**:
  - [ ] Registered temporary production account via `/signup`.
  - [ ] Logged in via `/login`.
  - [ ] Hard-refreshed browser tab — confirmed session survives without flicker.
  - [ ] Verified logout redirects to `/login`.
- [ ] **Problem Management Flow**:
  - [ ] Created a new problem with topics and platform link.
  - [ ] Edited problem metadata.
  - [ ] Recorded a practice attempt with duration and notes.
  - [ ] Verified attempt history displays on Problem Details view.
  - [ ] Deleted test problem; confirmed cascade deletion of its attempts.
- [ ] **Analytics Cockpit Verification**:
  - [ ] KPI cards render with accurate counts.
  - [ ] Weekly solve trend line renders.
  - [ ] Difficulty breakdown donut renders without visual clipping.
  - [ ] Topic weakness ranking displays struggle ratios.
  - [ ] Heatmap displays active calendar cells.
- [ ] **Revision Queue Verification**:
  - [ ] Navigated to `/revision`.
  - [ ] Confirmed candidate problems display priority score, timing badge, and Leitner rationale.
- [ ] **Network & Security Inspection**:
  - [ ] Browser DevTools Network tab shows zero requests to `localhost` or `127.0.0.1`.
  - [ ] Protected endpoints send `Authorization: Bearer <token>`.
  - [ ] Passwords sent exclusively via POST `/api/auth/login` and `/api/auth/signup`.
  - [ ] Response headers include `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY`.
- [ ] **Responsive Viewport Verification**:
  - [ ] Tested on desktop (>1024px) — full tables and multi-column grid layouts.
  - [ ] Tested on mobile (<640px) — responsive cards and mobile drawer navigation.

---

## 6. Rollback & Emergency Protocols

- **Backend Startup Failure**:
  - *Symptom*: Render deploy fails with exit code 1 or container timeout.
  - *Action*: Inspect Render logs for database connection error. Confirm `MONGO_URI` is set correctly and MongoDB Atlas Network Access allows `0.0.0.0/0`.
- **CORS Block on Frontend**:
  - *Symptom*: Frontend console shows `Cross-Origin Request Blocked`.
  - *Action*: Update `CLIENT_URL` in Render environment variables to exactly match the Vercel domain (without trailing slash). Trigger a manual re-deploy on Render.
- **Frontend 404 on Direct Reload**:
  - *Symptom*: Refreshing `/problems` or `/dashboard` returns Vercel 404 page.
  - *Action*: Verify `client/vercel.json` exists with the `rewrites` rule targeting `/index.html`.
