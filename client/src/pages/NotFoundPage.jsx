import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center animate-fade-up">
      <div className="text-center max-w-sm">
        <div className="font-mono text-7xl font-bold text-gradient mb-4">404</div>
        <h1 className="text-xl font-semibold text-white tracking-tight">Page not found</h1>
        <p className="text-sm text-zinc-400 mt-2 mb-7 leading-relaxed">
          The route you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn-primary text-sm">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
