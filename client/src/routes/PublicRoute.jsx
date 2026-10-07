import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLoader from '../components/common/AuthLoader';

/**
 * PublicRoute: Guards public auth views (/login, /signup).
 * Redirects already-authenticated users to their intended destination or /dashboard.
 */
export default function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoader />;
  }

  if (isAuthenticated) {
    const destination = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
