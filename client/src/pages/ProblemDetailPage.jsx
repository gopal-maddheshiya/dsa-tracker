import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProblemById, deleteProblem } from '../api/problems';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorHandler';
import AttemptForm from '../components/AttemptForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { AlertTriangle, Clock, ArrowUpRight, Plus, Trash2 } from 'lucide-react';

const DIFFICULTY_CONFIG = {
  easy:   { variant: 'easy',   label: 'Easy' },
  medium: { variant: 'medium', label: 'Medium' },
  hard:   { variant: 'hard',   label: 'Hard' },
};

const STATUS_CONFIG = {
  solved:         { label: 'Solved',         dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25' },
  struggled:      { label: 'Struggled',      dot: 'bg-rose-400',    text: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/25' },
  revisit_needed: { label: 'Revisit Needed', dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/25' },
};

const PLATFORM_LABELS = {
  leetcode: 'LeetCode',
  gfg: 'GeeksforGeeks',
  codechef: 'CodeChef',
  hackerrank: 'HackerRank',
  other: 'External',
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
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchProblemById(id);
      setProblem(res.data);
    } catch (err) {
      const msg = getErrorMessage(err, 'Problem not found or unauthorized.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadProblem();
  }, [loadProblem]);

  const handleDeleteProblem = async () => {
    if (!problem) return;
    setIsDeleting(true);
    try {
      await deleteProblem(problem.id);
      toast.success(`Problem "${problem.title}" deleted.`);
      navigate('/problems', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete problem.'));
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-5 animate-pulse pb-12">
        <div className="h-4 w-44 shimmer rounded-md" />
        <div className="panel p-6 space-y-4">
          <div className="h-7 w-72 shimmer rounded-lg" />
          <div className="h-4 w-48 shimmer rounded-md" />
          <div className="h-10 w-36 shimmer rounded-xl" />
        </div>
        <div className="panel p-6 space-y-3">
          <div className="h-5 w-32 shimmer rounded-md" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 shimmer rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="panel p-12 text-center max-w-lg mx-auto my-12 border border-rose-500/20">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 text-rose-400">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
        </div>
        <h3 className="text-base font-bold text-[#F3F4F6] mb-1">Problem Not Found</h3>
        <p className="text-xs text-[#9CA3AF] mb-6">{error || 'This problem might have been removed or does not exist.'}</p>
        <Link to="/problems" className="btn-primary text-xs">
          ← Return to Problems
        </Link>
      </div>
    );
  }

  const attempts = problem.attempts || [];
  const diffCfg = DIFFICULTY_CONFIG[problem.difficulty] || { variant: 'default', label: problem.difficulty };
  const platformName = PLATFORM_LABELS[problem.platform] || problem.platform;
  const latestCfg = problem.latestAttempt ? STATUS_CONFIG[problem.latestAttempt.status] : null;

  // Best time computation
  const times = attempts.map(a => a.timeTakenMinutes).filter(t => t != null && t > 0);
  const bestTime = times.length > 0 ? Math.min(...times) : null;
  const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-fade-up">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-xs text-[#9CA3AF]">
          <Link to="/problems" className="hover:text-[#F3F4F6] transition-colors flex items-center gap-1">
            <span>Problems</span>
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-[#F3F4F6] font-medium truncate max-w-[260px] sm:max-w-md">{problem.title}</span>
        </nav>
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          type="button"
          className="px-3 py-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-all duration-150 flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>

      {/* Main Problem Card */}
      <div className="panel p-6 sm:p-7 relative overflow-hidden bg-[#131519]">
        {/* Glow accent in top right */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-6 relative">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={diffCfg.variant}>{diffCfg.label}</Badge>
              <span className="text-[11px] font-mono text-[#9CA3AF] px-2 py-0.5 rounded-lg bg-[#0E1015] border border-white/[0.08]">
                {platformName}
              </span>
              {latestCfg && (
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${latestCfg.bg} ${latestCfg.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${latestCfg.dot}`} />
                  {latestCfg.label}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F4F6] leading-tight">
              {problem.title}
            </h1>

            {problem.topics?.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {problem.topics.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0E1015] border border-white/[0.08] text-[#9CA3AF] hover:border-white/[0.2] hover:text-[#F3F4F6] transition-colors"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <a
            href={problem.link}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost shrink-0 self-start sm:self-auto flex items-center gap-2 group text-xs"
          >
            <span>Open Problem</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-white/[0.08]">
          <div className="p-3 rounded-xl bg-[#0E1015] border border-white/[0.08]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9CA3AF] block font-medium">Total Sessions</span>
            <span className="text-lg font-bold font-mono text-[#F3F4F6] mt-0.5 block">{attempts.length}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0E1015] border border-white/[0.08]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9CA3AF] block font-medium">Best Time</span>
            <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">
              {bestTime != null ? `${bestTime}m` : '—'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0E1015] border border-white/[0.08]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9CA3AF] block font-medium">Average Time</span>
            <span className="text-lg font-bold font-mono text-[#F3F4F6] mt-0.5 block">
              {avgTime != null ? `${avgTime}m` : '—'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0E1015] border border-white/[0.08]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9CA3AF] block font-medium">Date Added</span>
            <span className="text-xs font-mono text-[#9CA3AF] mt-1.5 block">
              {new Date(problem.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Practice History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#F3F4F6] tracking-tight">Practice History</h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {attempts.length} {attempts.length === 1 ? 'attempt' : 'attempts'} recorded
            </p>
          </div>
          <button
            onClick={() => setIsAttemptModalOpen(true)}
            type="button"
            className="btn-primary text-xs flex items-center gap-1.5 shadow-lg shadow-[#F97316]/15"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Attempt</span>
          </button>
        </div>

        {attempts.length === 0 ? (
          <div className="panel border-dashed p-12 text-center bg-[#131519]">
            <div className="w-12 h-12 rounded-2xl bg-[#181B20] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
              <Clock className="w-5 h-5 text-[#9CA3AF]" />
            </div>
            <h3 className="text-sm font-semibold text-[#F3F4F6]">No attempts logged yet</h3>
            <p className="text-xs text-[#9CA3AF] mt-1.5 max-w-sm mx-auto leading-relaxed">
              Log your practice attempts to start tracking your time, struggle status, and spaced repetition revisions.
            </p>
            <button
              onClick={() => setIsAttemptModalOpen(true)}
              type="button"
              className="btn-primary text-xs mt-5"
            >
              Log First Attempt
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt, index) => {
              const cfg = STATUS_CONFIG[attempt.status] || { label: attempt.status, text: 'text-[#9CA3AF]', dot: 'bg-[#9CA3AF]', bg: 'bg-[#181B20] border-white/[0.08]' };
              const attemptDate = new Date(attempt.attemptedAt).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const attemptTime = new Date(attempt.attemptedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const isLatest = index === 0;

              return (
                <div
                  key={attempt.id || index}
                  className={`panel p-4.5 transition-all duration-200 hover:border-white/[0.18] ${
                    isLatest ? 'border-[#F97316]/30 bg-gradient-to-r from-[#171A21] to-[#131519]' : 'bg-[#131519]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</span>
                      </div>

                      {isLatest && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316]">
                          Latest Attempt
                        </span>
                      )}

                      {attempt.timeTakenMinutes != null && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#9CA3AF] px-2 py-0.5 rounded-md bg-[#0E1015] border border-white/[0.08]">
                          <Clock className="w-3 h-3 text-[#9CA3AF]" />
                          <span>{attempt.timeTakenMinutes}m</span>
                        </span>
                      )}
                    </div>

                    <div className="font-mono text-xs text-[#9CA3AF]">
                      {attemptDate} · {attemptTime}
                    </div>
                  </div>

                  {attempt.notes && (
                    <div className="mt-3 p-3.5 rounded-xl bg-[#0E1015] border border-white/[0.08] text-xs text-[#D1D5DB] leading-relaxed">
                      {attempt.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AttemptForm
        isOpen={isAttemptModalOpen}
        onClose={() => setIsAttemptModalOpen(false)}
        onSuccess={loadProblem}
        problemId={problem.id}
        problemTitle={problem.title}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProblem}
        problemTitle={problem.title}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ProblemDetailPage;
