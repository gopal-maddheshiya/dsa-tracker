import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  useEffect(() => {
    document.title = 'Page Not Found · DSA Tracker';
  }, []);

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center animate-fade-up px-4 bg-bg">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="font-bold text-8xl text-accent tabular-nums block">404</span>
        </div>

        <h1 className="text-xl font-semibold text-text tracking-tight mb-2">Page not found</h1>
        <p className="text-sm text-text-secondary leading-relaxed mb-8 max-w-xs mx-auto">
          The route you're looking for doesn't exist or has been moved to another location.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link to="/dashboard" className="btn-primary text-xs">
            ← Dashboard
          </Link>
          <Link to="/problems" className="btn-secondary text-xs">
            Browse Problems
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
