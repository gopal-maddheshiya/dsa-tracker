import React from 'react';
import { Link } from 'react-router-dom';

const ProblemsPage = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white">Problem Repository</h1>
        <p className="text-sm text-slate-400 mt-1">
          Catalog of solved DSA problems with attempt logs and topic tags.
        </p>
      </div>

      <div className="border border-dashed border-slate-800 rounded-lg p-8 text-center">
        <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Phase 1 Foundation</p>
        <h2 className="text-lg font-medium text-slate-200">Problem List Placeholder</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Problem management, filtering, and attempt logs will be connected in future phases.
        </p>
        <div className="mt-4">
          <Link
            to="/problems/sample-id"
            className="text-xs text-emerald-400 hover:text-emerald-300 underline font-mono"
          >
            Preview dynamic route: /problems/:id
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProblemsPage;
