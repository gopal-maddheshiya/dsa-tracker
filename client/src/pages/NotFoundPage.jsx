import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="max-w-md mx-auto mt-16 text-center space-y-4">
      <p className="text-4xl font-mono font-bold text-emerald-500">404</p>
      <h1 className="text-xl font-semibold text-white">Page not found</h1>
      <p className="text-sm text-slate-400">
        The requested URL does not correspond to any known route.
      </p>
      <div className="pt-2">
        <Link
          to="/dashboard"
          className="inline-block text-xs font-semibold px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
