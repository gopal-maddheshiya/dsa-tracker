import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="max-w-md mx-auto mt-16 bg-[#0d121f] border border-slate-800/80 rounded-lg p-8 text-center space-y-4 shadow-sm">
      <p className="text-3xl font-mono font-bold text-emerald-400">404</p>
      <h1 className="text-base font-mono font-semibold text-white tracking-tight">Endpoint Not Found</h1>
      <p className="text-xs text-slate-400">
        The requested route does not resolve to any active workspace view.
      </p>
      <div className="pt-2">
        <Link
          to="/dashboard"
          className="inline-block text-xs font-mono px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold rounded transition-colors shadow-sm"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
