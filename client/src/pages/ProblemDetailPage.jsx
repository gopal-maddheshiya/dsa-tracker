import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProblemById } from '../api/problems';
import AttemptForm from '../components/AttemptForm';

const DIFFICULTY_STYLES = {
  easy: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80',
  medium: 'bg-amber-950/60 text-amber-400 border-amber-800/80',
  hard: 'bg-red-950/60 text-red-400 border-red-800/80',
};

const STATUS_CONFIG = {
  solved: {
    label: 'Solved',
    style: 'bg-emerald-950/40 text-emerald-400 border-emerald-800',
    indicator: 'bg-emerald-500',
  },
  struggled: {
    label: 'Struggled',
    style: 'bg-amber-950/40 text-amber-400 border-amber-800',
    indicator: 'bg-amber-500',
  },
  revisit_needed: {
    label: 'Revisit Needed',
    style: 'bg-red-950/40 text-red-400 border-red-800',
    indicator: 'bg-red-500',
  },
};

const PLATFORM_LABELS = {
  leetcode: 'LeetCode',
  gfg: 'GeeksforGeeks',
  codechef: 'CodeChef',
  hackerrank: 'HackerRank',
  other: 'Other',
};

const ProblemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAttemptModalOpen, setIsAttemptModalOpen] = useState(false);

  const loadProblem = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchProblemById(id);
      setProblem(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Problem not found or unauthorized';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProblem();
  }, [loadProblem]);

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
        <div className="inline-flex items-center space-x-2 text-slate-400 text-sm">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading problem details...</span>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center space-y-4">
        <p className="text-red-400 text-sm font-semibold">{error || 'Problem not found'}</p>
        <Link
          to="/problems"
          className="inline-block px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
        >
          ← Return to Problems
        </Link>
      </div>
    );
  }

  const attempts = problem.attempts || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link to="/problems" className="hover:text-white transition-colors">
          Problems
        </Link>
        <span>/</span>
        <span className="text-slate-300 font-medium truncate max-w-md">{problem.title}</span>
      </div>

      {/* Problem Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {PLATFORM_LABELS[problem.platform] || problem.platform}
              </span>
              <span
                className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded border capitalize ${
                  DIFFICULTY_STYLES[problem.difficulty]
                }`}
              >
                {problem.difficulty}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">{problem.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={problem.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md border border-slate-700 transition-colors"
            >
              <span>Solve Problem</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs text-slate-400">
          <div>
            <span className="font-medium text-slate-300 block mb-1">Topics:</span>
            <div className="flex flex-wrap gap-1.5">
              {problem.topics && problem.topics.length > 0 ? (
                problem.topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]"
                  >
                    {topic}
                  </span>
                ))
              ) : (
                <span className="text-slate-600">No topics tagged</span>
              )}
            </div>
          </div>

          <div className="sm:text-right">
            <span className="font-medium text-slate-300 block mb-1">Tracking Since:</span>
            <span className="font-mono text-slate-400 text-[11px]">
              {new Date(problem.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Attempt History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Attempt History</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {attempts.length} {attempts.length === 1 ? 'practice attempt' : 'practice attempts'} recorded
            </p>
          </div>

          <button
            onClick={() => setIsAttemptModalOpen(true)}
            type="button"
            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-md transition-colors shadow-sm"
          >
            <span>+ Log Attempt</span>
          </button>
        </div>

        {attempts.length === 0 ? (
          <div className="bg-slate-900 border border-dashed border-slate-800 rounded-lg p-8 text-center">
            <p className="text-xs text-slate-400">
              No practice attempts have been logged yet for this problem.
            </p>
            <div className="mt-3">
              <button
                onClick={() => setIsAttemptModalOpen(true)}
                type="button"
                className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium"
              >
                Log your first attempt
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt, index) => {
              const cfg = STATUS_CONFIG[attempt.status] || {
                label: attempt.status,
                style: 'bg-slate-800 text-slate-300',
                indicator: 'bg-slate-500',
              };

              const attemptDate = new Date(attempt.attemptedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              const attemptTime = new Date(attempt.attemptedAt).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={attempt.id || index}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-4 transition-colors hover:border-slate-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-2 h-2 rounded-full ${cfg.indicator}`}></span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded border capitalize ${cfg.style}`}
                      >
                        {cfg.label}
                      </span>

                      {attempt.timeTakenMinutes !== null && attempt.timeTakenMinutes !== undefined && (
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          ⏱ {attempt.timeTakenMinutes} min
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-mono text-slate-500">
                      {attemptDate} at {attemptTime}
                    </div>
                  </div>

                  {attempt.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded border border-slate-800/60 leading-relaxed font-sans">
                      {attempt.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Attempt Form Modal */}
      <AttemptForm
        isOpen={isAttemptModalOpen}
        onClose={() => setIsAttemptModalOpen(false)}
        onSuccess={loadProblem}
        problemId={problem.id}
        problemTitle={problem.title}
      />
    </div>
  );
};

export default ProblemDetailPage;
