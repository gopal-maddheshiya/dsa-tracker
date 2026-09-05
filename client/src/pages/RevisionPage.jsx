import React from 'react';

const RevisionPage = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white">Revision Queue</h1>
        <p className="text-sm text-slate-400 mt-1">
          Spaced-repetition queue prioritizing problems requiring practice.
        </p>
      </div>

      <div className="border border-dashed border-slate-800 rounded-lg p-8 text-center">
        <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Phase 1 Foundation</p>
        <h2 className="text-lg font-medium text-slate-200">Spaced Repetition Engine Placeholder</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Interval-based prioritization and revision recommendations will be introduced in future phases.
        </p>
      </div>
    </div>
  );
};

export default RevisionPage;
