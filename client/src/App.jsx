import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppShell from './components/layout/AppShell';
import PrivateRoute from './components/PrivateRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';

// Route-level code splitting with lazy loading
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProblemsPage = lazy(() => import('./pages/ProblemsPage'));
const ProblemDetailPage = lazy(() => import('./pages/ProblemDetailPage'));
const RevisionPage = lazy(() => import('./pages/RevisionPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

import ErrorBoundary from './components/ErrorBoundary';

// Sleek workspace route loading skeleton
const RouteLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center animate-fade-up">
    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(249,115,22,0.15)]">
      <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] dot-pulse" />
    </div>
    <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
      Loading workspace…
    </span>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppShell>
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Public only (redirect to dashboard if logged in) */}
                <Route element={<PublicOnlyRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                </Route>

                {/* Protected routes */}
                <Route element={<PrivateRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/problems" element={<ProblemsPage />} />
                  <Route path="/problems/:id" element={<ProblemDetailPage />} />
                  <Route path="/revision" element={<RevisionPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </AppShell>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
