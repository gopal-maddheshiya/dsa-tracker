import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SmoothScrollProvider } from './components/common/SmoothScrollProvider';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';

/**
 * Root App Component
 * Wraps error boundary, theme provider, browser router, smooth scroll provider,
 * authentication provider, and intelligent notifications provider.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <SmoothScrollProvider>
            <AuthProvider>
              <NotificationProvider>
                <AppRoutes />
              </NotificationProvider>
            </AuthProvider>
          </SmoothScrollProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
