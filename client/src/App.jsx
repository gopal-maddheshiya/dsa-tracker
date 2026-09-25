import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import SmoothScrollProvider from './components/common/SmoothScroll';
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
import LogoAssembleLoader from './components/ui/LogoAssembleLoader';

// Sleek workspace route loading skeleton
const RouteLoader = () => <LogoAssembleLoader fullScreen={false} />;

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <SmoothScrollProvider>
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
          </SmoothScrollProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
