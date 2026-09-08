import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center animate-fade-up px-4">
      <div className="text-center max-w-md">
        {/* Decorative glow */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #F97316, transparent)', filter: 'blur(40px)', transform: 'scale(2)' }} />
          <span className="relative font-mono text-8xl font-bold text-gradient block">404</span>
        </div>

        <h1 className="text-xl font-bold text-[#F3F4F6] tracking-tight mb-2">Page not found</h1>
        <p className="text-sm text-[#9CA3AF] leading-relaxed mb-8 max-w-xs mx-auto">
          The route you're looking for doesn't exist or has been moved to another location.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link to="/dashboard" className="btn-primary text-sm">
            ← Dashboard
          </Link>
          <Link to="/problems" className="btn-ghost text-sm">
            Browse Problems
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
