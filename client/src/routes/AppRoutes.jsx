import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import AuthLoader from '../components/common/AuthLoader';
import { lazyWithRetry } from '../lib/lazyRetry';
import { Code2 } from 'lucide-react';

// Resilient route-level code-splitting with automatic chunk retry
const DashboardPage = lazyWithRetry(() => import('../pages/DashboardPage'));
const ProblemsPage = lazyWithRetry(() => import('../pages/ProblemsPage'));
const ProblemDetailPage = lazyWithRetry(() => import('../pages/ProblemDetailPage'));
const RevisionPage = lazyWithRetry(() => import('../pages/RevisionPage'));
const AnalyticsPage = lazyWithRetry(() => import('../pages/AnalyticsPage'));
const ProfilePage = lazyWithRetry(() => import('../pages/ProfilePage'));
const SettingsPage = lazyWithRetry(() => import('../pages/SettingsPage'));
const AccountPage = lazyWithRetry(() => import('../pages/AccountPage'));
const LoginPage = lazyWithRetry(() => import('../pages/LoginPage'));
const SignupPage = lazyWithRetry(() => import('../pages/SignupPage'));
const NotFoundPage = lazyWithRetry(() => import('../pages/NotFoundPage'));

import LogoMark from '../components/common/LogoMark';

function ViewLoader() {
  return (
    <div className="py-24 flex flex-col items-center justify-center space-y-3 select-none">
      <LogoMark size={40} animated={true} />
      <span className="text-xs text-text-secondary font-medium tracking-tight">
        Loading...
      </span>
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
