import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import AuthLoader from '../components/common/AuthLoader';
import { Code2 } from 'lucide-react';

// Route-level code-splitting for performance and isolated chart bundles
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ProblemsPage = lazy(() => import('../pages/ProblemsPage'));
const ProblemDetailPage = lazy(() => import('../pages/ProblemDetailPage'));
const RevisionPage = lazy(() => import('../pages/RevisionPage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const AccountPage = lazy(() => import('../pages/AccountPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const SignupPage = lazy(() => import('../pages/SignupPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

function ViewLoader() {
  return (
    <div className="py-28 flex flex-col items-center justify-center space-y-4 select-none">
      <div className="relative flex items-center justify-center">
        {/* Ambient bloom */}
        <div className="absolute w-12 h-12 rounded-full bg-accent/20 blur-md animate-pulse-glow" />
        {/* Floating 3D Cube Emblem */}
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#ed8641] to-[#d96720] flex items-center justify-center shadow-[0_0_18px_rgba(237,134,65,0.35)] border border-white/20 animate-float-emblem">
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
              fill="#ed8641"
              fillOpacity="0.45"
            />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="#ffffff" />
            <line x1="12" y1="22.08" x2="12" y2="12" stroke="#ffffff" />
          </svg>
        </div>
      </div>
      {/* Sleek travelling beam */}
      <div className="w-32 h-1 rounded-full bg-surface-2 overflow-hidden border border-line/50 relative">
        <div className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full animate-loading-beam" />
      </div>
      <p className="text-xs text-text-secondary font-medium tracking-tight">
        Loading...
      </p>
    </div>
  );
}

/**
 * AppRoutes: Central routing architecture.
 * Integrates PublicRoute (for /login and /signup), ProtectedRoute (for application shell),
 * and route-level code-splitting with graceful Suspense fallbacks.
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication Shell */}
      <Route element={<PublicRoute />}>
        <Route
          path="/login"
          element={
            <Suspense fallback={<AuthLoader />}>
              <LoginPage />
            </Suspense>
          }
        />
        <Route
          path="/signup"
          element={
            <Suspense fallback={<AuthLoader />}>
              <SignupPage />
            </Suspense>
          }
        />
      </Route>

      {/* Main Application Shell (Guarded) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<ViewLoader />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="/problems"
            element={
              <Suspense fallback={<ViewLoader />}>
                <ProblemsPage />
              </Suspense>
            }
          />
          <Route
            path="/problems/:id"
            element={
              <Suspense fallback={<ViewLoader />}>
                <ProblemDetailPage />
              </Suspense>
            }
          />
          <Route
            path="/revision"
            element={
              <Suspense fallback={<ViewLoader />}>
                <RevisionPage />
              </Suspense>
            }
          />
          <Route
            path="/analytics"
            element={
              <Suspense fallback={<ViewLoader />}>
                <AnalyticsPage />
              </Suspense>
            }
          />
          <Route
            path="/profile"
            element={
              <Suspense fallback={<ViewLoader />}>
                <ProfilePage />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<ViewLoader />}>
                <SettingsPage />
              </Suspense>
            }
          />
          {/* Legacy /account route redirects to /profile */}
          <Route path="/account" element={<Navigate to="/profile" replace />} />
        </Route>
      </Route>

      {/* 404 Catch-All Fallback */}
      <Route
        path="*"
        element={
          <Suspense fallback={<AuthLoader />}>
            <NotFoundPage />
          </Suspense>
        }
      />
    </Routes>
  );
}
