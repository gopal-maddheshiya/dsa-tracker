import React from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="max-w-md mx-auto mt-12 space-y-6">
      <div className="border-b border-slate-800 pb-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">Log in</h1>
        <p className="text-sm text-slate-400 mt-1">Access your interview preparation workspace.</p>
      </div>

      <div className="border border-dashed border-slate-800 rounded-lg p-8 text-center">
        <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Phase 1 Foundation</p>
        <h2 className="text-base font-medium text-slate-200">Authentication Placeholder</h2>
        <p className="text-sm text-slate-400 mt-2">
          JWT authentication and secure credentials management will be added in Phase 2.
        </p>
        <div className="mt-4 text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
