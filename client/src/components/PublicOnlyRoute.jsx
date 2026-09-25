import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoAssembleLoader from './ui/LogoAssembleLoader';

const PublicOnlyRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LogoAssembleLoader fullScreen={true} />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicOnlyRoute;
