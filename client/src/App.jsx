import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import DashboardPage from './pages/DashboardPage';
import ProblemsPage from './pages/ProblemsPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import RevisionPage from './pages/RevisionPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen flex flex-col bg-[#121110] text-[#F5F5F4]">
          <Navbar />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-7 sm:py-9">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
              </Route>
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/problems" element={<ProblemsPage />} />
                <Route path="/problems/:id" element={<ProblemDetailPage />} />
                <Route path="/revision" element={<RevisionPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <footer className="border-t border-[#2E2A27] py-4 text-center">
            <p className="text-[11px] text-[#78716C] font-mono">
              DSA Tracker &bull; Spaced Repetition Engine &bull; v1.0
            </p>
          </footer>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
