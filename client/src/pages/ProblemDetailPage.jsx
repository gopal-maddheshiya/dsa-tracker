import React from 'react';
import { useParams, Link } from 'react-router-dom';

const ProblemDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link to="/problems" className="hover:text-white transition-colors">
          Problems
        </Link>
        <span>/</span>
        <span className="font-mono text-slate-300">{id}</span>
      </div>

      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white">Problem Detail</h1>
        <p className="text-sm text-slate-400 mt-1">
          Viewing problem identifier: <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{id}</code>
        </p>
      </div>

      <div className="border border-dashed border-slate-800 rounded-lg p-8 text-center">
        <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Phase 1 Foundation</p>
        <h2 className="text-lg font-medium text-slate-200">Problem Detail & Attempt History Placeholder</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Multi-attempt records, runtime analysis, and notes will be rendered here.
        </p>
      </div>
    </div>
  );
};

export default ProblemDetailPage;
