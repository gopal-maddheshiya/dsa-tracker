import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProblemById, deleteProblem } from '../api/problems';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorHandler';
import AttemptForm from '../components/AttemptForm';
import ProblemForm from '../components/ProblemForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import PracticeTimer from '../components/problems/PracticeTimer';
import SolutionCodeViewer from '../components/problems/SolutionCodeViewer';
import Badge from '../components/ui/Badge';
import {
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Zap,
  Flame,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const DIFFICULTY_CONFIG = {
  easy:   { variant: 'easy',   label: 'Easy' },
  medium: { variant: 'medium', label: 'Medium' },
  hard:   { variant: 'hard',   label: 'Hard' },
};

const STATUS_CONFIG = {
  solved: {
    label: 'Solved',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/25',
    glow: 'shadow-[0_0_8px_rgba(16,185,129,0.15)]',
  },
  struggled: {
    label: 'Struggled',
    dot: 'bg-rose-400',
    text: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/25',
    glow: 'shadow-[0_0_8px_rgba(244,63,94,0.15)]',
  },
  revisit_needed: {
    label: 'Revisit Needed',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/25',
    glow: 'shadow-[0_0_8px_rgba(245,158,11,0.15)]',
  },
};

const PLATFORM_CONFIG = {
  leetcode:   { label: 'LeetCode', short: 'LC', style: 'text-amber-400 bg-amber-500/10 border-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.08)]', dot: 'bg-amber-400' },
  gfg:        { label: 'GeeksforGeeks', short: 'GFG', style: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.08)]', dot: 'bg-emerald-400' },
  codechef:   { label: 'CodeChef', short: 'CC', style: 'text-amber-300 bg-amber-600/10 border-amber-600/25 shadow-[0_0_8px_rgba(217,119,6,0.08)]', dot: 'bg-amber-300' },
  hackerrank: { label: 'HackerRank', short: 'HR', style: 'text-green-400 bg-green-500/10 border-green-500/25 shadow-[0_0_8px_rgba(34,197,94,0.08)]', dot: 'bg-green-400' },
  other:      { label: 'External', short: 'Ext', style: 'text-[#9CA3AF] bg-white/[0.04] border-white/[0.08]', dot: 'bg-[#9CA3AF]' },
};

const ProblemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAttemptModalOpen, setIsAttemptModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [timerElapsedMinutes, setTimerElapsedMinutes] = useState('');

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
        <div className="panel p-6 sm:p-8 space-y-4 rounded-2xl">
          <div className="h-8 w-72 shimmer rounded-lg" />
          <div className="h-4 w-48 shimmer rounded-md" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 shimmer rounded-xl" />
            ))}
          </div>
        </div>
        <div className="panel p-6 space-y-3 rounded-2xl">
          <div className="h-5 w-32 shimmer rounded-md" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 shimmer rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="panel p-12 text-center max-w-lg mx-auto my-12 border border-rose-500/20 rounded-2xl bg-[#121418]">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 text-rose-400 shadow-sm">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
        </div>
        <h3 className="text-base font-bold text-[#F3F4F6] mb-1">Problem Not Found</h3>
        <p className="text-xs text-[#9CA3AF] mb-6 leading-relaxed">{error || 'This problem might have been removed or does not exist.'}</p>
        <Link to="/problems" className="btn-primary text-xs">
          ← Return to Problems Catalog
        </Link>
      </div>
    );
  }

  const attempts = problem.attempts || [];
  const diffCfg = DIFFICULTY_CONFIG[problem.difficulty] || { variant: 'default', label: problem.difficulty };
  const platformCfg = PLATFORM_CONFIG[problem.platform] || PLATFORM_CONFIG.other;
  const latestCfg = problem.latestAttempt ? STATUS_CONFIG[problem.latestAttempt.status] : null;

  // Best time computation
  const times = attempts.map(a => a.timeTakenMinutes).filter(t => t != null && t > 0);
  const bestTime = times.length > 0 ? Math.min(...times) : null;
  const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-fade-up">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-xs text-[#9CA3AF]">
          <Link to="/problems" className="hover:text-[#F3F4F6] transition-colors flex items-center gap-1">
            <span>Problems</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-[#4B5563]" />
          <span className="text-[#F3F4F6] font-medium truncate max-w-[240px] sm:max-w-md">{problem.title}</span>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            type="button"
            className="px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-amber-500/30 bg-[#14171C] hover:bg-amber-500/10 text-[#9CA3AF] hover:text-amber-400 text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
            title="Edit problem details & topics"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            type="button"
            className="px-3 py-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
            title="Delete this problem"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Main Problem Hero Card */}
      <div className="panel p-6 sm:p-7 relative overflow-hidden bg-[#121418] rounded-2xl border border-white/[0.08] shadow-xl">
        {/* Glow accent in top right */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-6 relative z-10">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={diffCfg.variant} dot size="sm">{diffCfg.label}</Badge>
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${platformCfg.style}`}
                title={platformCfg.label}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${platformCfg.dot}`} />
                <span>{platformCfg.label}</span>
              </span>
              {latestCfg && (
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-lg border ${latestCfg.bg} ${latestCfg.text} ${latestCfg.glow}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${latestCfg.dot} animate-pulse`} />
                  <span>{latestCfg.label}</span>
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
                    className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-[#0E1015] border border-white/[0.08] text-[#9CA3AF] hover:border-white/[0.2] hover:text-[#F3F4F6] transition-colors"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {problem.link && (
            <a
              href={problem.link}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost shrink-0 self-start sm:self-auto flex items-center gap-2 group text-xs border border-white/[0.08] hover:border-[#F97316]/40 px-3.5 py-2 rounded-xl"
            >
              <span>Solve on {platformCfg.short}</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[#F97316] transition-transform" />
            </a>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-white/[0.08] relative z-10">
          <div className="p-3.5 rounded-xl bg-[#0E1015] border border-white/[0.08] hover:border-white/[0.16] transition-colors group">
            <div className="flex items-center justify-between text-[#9CA3AF] mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Sessions</span>
              <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xl font-bold font-mono text-[#F3F4F6] block">{attempts.length}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0E1015] border border-white/[0.08] hover:border-emerald-500/30 transition-colors group">
            <div className="flex items-center justify-between text-[#9CA3AF] mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Best Time</span>
              <Clock className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xl font-bold font-mono text-emerald-400 block">
              {bestTime != null ? `${bestTime}m` : '—'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0E1015] border border-white/[0.08] hover:border-white/[0.16] transition-colors group">
            <div className="flex items-center justify-between text-[#9CA3AF] mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Average</span>
              <Flame className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xl font-bold font-mono text-[#F3F4F6] block">
              {avgTime != null ? `${avgTime}m` : '—'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0E1015] border border-white/[0.08] hover:border-white/[0.16] transition-colors group">
            <div className="flex items-center justify-between text-[#9CA3AF] mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Cataloged</span>
              <Calendar className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-mono text-[#9CA3AF] mt-1.5 block truncate">
              {new Date(problem.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Practice Timer & Stopwatch */}
      <PracticeTimer
        onLogWithTime={(mins) => {
          setTimerElapsedMinutes(mins);
          setIsAttemptModalOpen(true);
        }}
      />

      {/* Solution Code & Optimal Approach */}
      <SolutionCodeViewer
        problem={problem}
        onProblemUpdated={(updated) => setProblem((prev) => ({ ...prev, ...updated }))}
      />

      {/* Practice History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#F3F4F6] tracking-tight flex items-center gap-2">
              <span>Practice Audit History</span>
              <span className="text-xs font-mono font-normal text-[#9CA3AF]">
                ({attempts.length} {attempts.length === 1 ? 'attempt' : 'attempts'})
              </span>
            </h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Chronological log of recall sessions, speed metrics, and notes.
            </p>
          </div>
          <button
            onClick={() => {
              setTimerElapsedMinutes('');
              setIsAttemptModalOpen(true);
            }}
            type="button"
            className="btn-primary text-xs flex items-center gap-1.5 shadow-[0_0_16px_rgba(249,115,22,0.2)] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Log Attempt</span>
          </button>
        </div>

        {attempts.length === 0 ? (
          <div className="panel border-dashed p-12 text-center bg-[#121418] rounded-2xl border-white/[0.1]">
            <div className="w-12 h-12 rounded-2xl bg-[#181B20] border border-white/[0.08] flex items-center justify-center mx-auto mb-4 text-[#9CA3AF]">
              <Clock className="w-5 h-5 text-[#9CA3AF]" />
            </div>
            <h3 className="text-sm font-semibold text-[#F3F4F6]">No practice sessions recorded yet</h3>
            <p className="text-xs text-[#9CA3AF] mt-1.5 max-w-sm mx-auto leading-relaxed">
              Use the stopwatch timer above or click below to log your first solve attempt and schedule your recall intervals.
            </p>
            <button
              onClick={() => setIsAttemptModalOpen(true)}
              type="button"
              className="btn-primary text-xs mt-5 cursor-pointer"
            >
              + Log First Attempt
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
                  className={`panel p-4.5 rounded-2xl transition-all duration-200 hover:border-white/[0.18] relative overflow-hidden ${
                    isLatest ? 'border-[#F97316]/30 bg-gradient-to-r from-[#171A21] to-[#131519] shadow-md' : 'bg-[#121418] border-white/[0.08]'
                  }`}
                >
                  {isLatest && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-[#F97316]" />
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg border ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
                        <span>{cfg.label}</span>
                      </span>

                      {isLatest && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316]">
                          <Sparkles className="w-3 h-3" />
                          <span>Latest</span>
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
                    <div className="mt-3 p-3.5 rounded-xl bg-[#0E1015] border border-white/[0.08] text-xs text-[#D1D5DB] leading-relaxed font-mono">
                      {attempt.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Attempt Modal */}
      <AttemptForm
        isOpen={isAttemptModalOpen}
        onClose={() => {
          setIsAttemptModalOpen(false);
          setTimerElapsedMinutes('');
        }}
        onSuccess={loadProblem}
        problemId={problem.id}
        problemTitle={problem.title}
        defaultTimeTaken={timerElapsedMinutes}
      />

      {/* Edit Problem Modal */}
      {isEditModalOpen && (
        <ProblemForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            loadProblem();
            toast.success('Problem updated successfully!');
          }}
          initialData={problem}
        />
      )}

      {/* Delete Confirmation Modal */}
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

