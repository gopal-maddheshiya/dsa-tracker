import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProblemById, deleteProblem } from '../api/problems';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorHandler';
import AttemptForm from '../components/AttemptForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const DIFFICULTY_STYLES = {
  easy: 'text-[#F97316]', medium: 'text-amber-400', hard: 'text-rose-400',
};
const STATUS_CONFIG = {
  solved: { label: 'Solved', dot: 'bg-[#F97316]', text: 'text-[#F97316]' },
  struggled: { label: 'Struggled', dot: 'bg-rose-400', text: 'text-rose-400' },
  revisit_needed: { label: 'Revisit', dot: 'bg-amber-400', text: 'text-amber-400' },
};
const PLATFORM_LABELS = {
  leetcode: 'LeetCode', gfg: 'GeeksforGeeks', codechef: 'CodeChef',
  hackerrank: 'HackerRank', other: 'External',
};

const ProblemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAttemptModalOpen, setIsAttemptModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProblem = useCallback(async () => {
    setIsLoading(true); setError('');
    try {
      const res = await fetchProblemById(id);
      setProblem(res.data);
    } catch (err) {
      const msg = getErrorMessage(err, 'Problem not found or unauthorized.');
      setError(msg); toast.error(msg);
    } finally { setIsLoading(false); }
  }, [id, toast]);

  useEffect(() => { loadProblem(); }, [loadProblem]);

  const handleDeleteProblem = async () => {
    if (!problem) return;
    setIsDeleting(true);
    try {
      await deleteProblem(problem.id);
      toast.success(`Problem "${problem.title}" deleted.`);
      navigate('/problems', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete problem.'));
      setIsDeleting(false); setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-3 w-40 shimmer rounded-md" />
        <div className="panel p-6">
          <div className="h-6 w-72 shimmer rounded-md mb-3" />
          <div className="h-3 w-48 shimmer rounded-md mb-5" />
          <div className="h-8 w-32 shimmer rounded-lg" />
        </div>
        <div className="panel p-6 space-y-3">
          <div className="h-4 w-32 shimmer rounded-md" />
          {[1,2,3].map(i => <div key={i} className="h-10 shimmer rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="panel p-10 text-center max-w-lg mx-auto">
        <p className="text-rose-400 text-sm font-medium">{error || 'Problem not found'}</p>
        <Link to="/problems" className="inline-flex btn-ghost mt-4 text-xs">← Return to Problems</Link>
      </div>
    );
  }

  const attempts = problem.attempts || [];
  const diffStyle = DIFFICULTY_STYLES[problem.difficulty] || 'text-[#A8A29E]';
  const platformName = PLATFORM_LABELS[problem.platform] || problem.platform;
  const topicsString = problem.topics?.length > 0 ? problem.topics.join(' · ') : null;
  const latestCfg = problem.latestAttempt ? STATUS_CONFIG[problem.latestAttempt.status] : null;

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-12 animate-fade-up">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-1.5 text-xs text-[#78716C]">
          <Link to="/problems" className="hover:text-[#F5F5F4] transition-colors">Problems</Link>
          <span className="text-[#3E3834]">/</span>
          <span className="text-[#A8A29E] truncate max-w-xs">{problem.title}</span>
        </nav>
        <button onClick={() => setIsDeleteModalOpen(true)} type="button" className="btn-danger">Delete</button>
      </div>

      {/* Problem Header */}
      <div className="panel p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-[#F5F5F4] leading-tight">{problem.title}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#78716C]">
              <span className={`capitalize font-bold ${diffStyle}`}>{problem.difficulty}</span>
              <span className="text-[#3E3834]">·</span>
              <span>{platformName}</span>
              {topicsString && (
                <>
                  <span className="text-[#3E3834]">·</span>
                  <span className="text-[#A8A29E]">{topicsString}</span>
                </>
              )}
            </div>
          </div>
          <a href={problem.link} target="_blank" rel="noreferrer" className="btn-ghost shrink-0 self-start">
            Open Problem ↗
          </a>
        </div>

        <div className="pt-4 border-t border-[#2E2A27] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs">
            {latestCfg ? (
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${latestCfg.dot}`} />
                <span className={latestCfg.text}>{latestCfg.label}</span>
              </div>
            ) : (
              <span className="text-[#78716C] text-xs">Unattempted</span>
            )}
            <span className="text-[#3E3834]">·</span>
            <span className="font-mono text-[#A8A29E] text-[11px]">{attempts.length} sessions</span>
          </div>
          <div className="font-mono text-[11px] text-[#78716C]">
            Added {new Date(problem.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Practice History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#F5F5F4]">Practice History</h2>
            <p className="text-xs text-[#78716C] mt-0.5">{attempts.length} {attempts.length === 1 ? 'session' : 'sessions'} recorded</p>
          </div>
          <button onClick={() => setIsAttemptModalOpen(true)} type="button" className="btn-primary text-xs">
            + Log Attempt
          </button>
        </div>

        {attempts.length === 0 ? (
          <div className="panel border-dashed p-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-[#211F1D] border border-[#2E2A27] flex items-center justify-center mx-auto mb-4">
              <span className="text-[#78716C] text-lg">📋</span>
            </div>
            <p className="text-sm font-semibold text-[#A8A29E]">No attempts logged yet</p>
            <p className="text-xs text-[#78716C] mt-1.5 max-w-sm mx-auto leading-relaxed">
              Logging sessions feeds the spaced repetition engine and powers your analytics.
            </p>
            <button onClick={() => setIsAttemptModalOpen(true)} type="button" className="btn-primary text-xs mt-5">
              Log First Attempt
            </button>
          </div>
        ) : (
          <div className="panel overflow-hidden divide-y divide-[#2E2A27]/60">
            {attempts.map((attempt, index) => {
              const cfg = STATUS_CONFIG[attempt.status] || { label: attempt.status, text: 'text-[#A8A29E]', dot: 'bg-[#A8A29E]' };
              const attemptDate = new Date(attempt.attemptedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
              const attemptTime = new Date(attempt.attemptedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
              const isLatest = index === 0;

              return (
                <div key={attempt.id || index} className="p-4 hover:bg-[#211F1D] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <span className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</span>
                      </div>
                      {isLatest && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#F97316]/10 border border-[#F97316]/20 text-[#F97316]">
                          Latest
                        </span>
                      )}
                      {attempt.timeTakenMinutes != null && (
                        <>
                          <span className="text-[#3E3834]">·</span>
                          <span className="font-mono text-xs text-[#A8A29E]">{attempt.timeTakenMinutes}m</span>
                        </>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-[#78716C]">{attemptDate} at {attemptTime}</div>
                  </div>

                  {attempt.notes && (
                    <div className="mt-3 p-3 rounded-lg bg-[#141312] border border-[#2E2A27] text-xs text-[#A8A29E] leading-relaxed">
                      {attempt.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AttemptForm isOpen={isAttemptModalOpen} onClose={() => setIsAttemptModalOpen(false)}
        onSuccess={loadProblem} problemId={problem.id} problemTitle={problem.title} />
      <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProblem} problemTitle={problem.title} isDeleting={isDeleting} />
    </div>
  );
};

export default ProblemDetailPage;
