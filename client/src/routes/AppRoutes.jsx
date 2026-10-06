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
const AccountPage = lazy(() => import('../pages/AccountPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const SignupPage = lazy(() => import('../pages/SignupPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

function ViewLoader() {
  return (
    <div className="py-20 flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent animate-pulse shadow-xs">
        <Code2 className="w-4 h-4" />
      </div>
      <p className="text-xs text-muted font-mono">Loading view...</p>
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
            <Suspense fallback={<AuthLoader message="Loading..." />}>
              <LoginPage />
            </Suspense>
          }
        />
        <Route
          path="/signup"
          element={
            <Suspense fallback={<AuthLoader message="Loading..." />}>
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
            path="/account"
            element={
              <Suspense fallback={<ViewLoader />}>
                <AccountPage />
              </Suspense>
            }
          />
          <Route path="/profile" element={<Navigate to="/account" replace />} />
        </Route>
      </Route>

      {/* 404 Catch-All Fallback */}
      <Route
        path="*"
        element={
          <Suspense fallback={<AuthLoader message="Loading..." />}>
            <NotFoundPage />
          </Suspense>
        }
      />
    </Routes>
  );
}
