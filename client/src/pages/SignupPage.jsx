import React from 'react';
import { Link } from 'react-router-dom';

const SignupPage = () => {
  return (
    <div className="max-w-md mx-auto mt-12 space-y-6">
      <div className="border-b border-slate-800 pb-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">Create an account</h1>
        <p className="text-sm text-slate-400 mt-1">Start tracking your algorithmic preparation journey.</p>
      </div>

      <div className="border border-dashed border-slate-800 rounded-lg p-8 text-center">
        <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Phase 1 Foundation</p>
        <h2 className="text-base font-medium text-slate-200">Registration Placeholder</h2>
        <p className="text-sm text-slate-400 mt-2">
          User registration logic and profile initialization will be implemented in Phase 2.
        </p>
        <div className="mt-4 text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
