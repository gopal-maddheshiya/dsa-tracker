import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProblemById, deleteProblem } from '../api/problems';
import { deleteAttempt } from '../api/attempts';
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
    dot: 'bg-success',
    text: 'text-success',
    bg: 'bg-success/12 border-success/25',
  },
  struggled: {
    label: 'Struggled',
    dot: 'bg-danger',
    text: 'text-danger',
    bg: 'bg-danger/12 border-danger/25',
  },
  revisit_needed: {
    label: 'Revisit Needed',
    dot: 'bg-medium',
    text: 'text-medium',
    bg: 'bg-medium/12 border-medium/25',
  },
};

const PLATFORM_CONFIG = {
  leetcode:   { label: 'LeetCode', short: 'LC', style: 'text-accent bg-accent/10 border-accent/20', dot: 'bg-accent' },
  gfg:        { label: 'GeeksforGeeks', short: 'GFG', style: 'text-easy bg-easy/10 border-easy/20', dot: 'bg-easy' },
  codechef:   { label: 'CodeChef', short: 'CC', style: 'text-medium bg-medium/10 border-medium/20', dot: 'bg-medium' },
  hackerrank: { label: 'HackerRank', short: 'HR', style: 'text-success bg-success/10 border-success/20', dot: 'bg-success' },
  other:      { label: 'External', short: 'Ext', style: 'text-muted bg-surface-2 border-line', dot: 'bg-muted' },
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
  const [editingAttempt, setEditingAttempt] = useState(null);
  const [deletingAttemptId, setDeletingAttemptId] = useState(null);

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

  // Dynamic document title based on problem name
  useEffect(() => {
    if (problem?.title) {
      document.title = `${problem.title} · DSA Tracker`;
    }
  }, [problem?.title]);

  const handleDeleteProblem = async () => {
    if (!problem) return;
    setIsDeleting(true);
    try {
      const delId = problem.id || problem._id;
      await deleteProblem(delId);
      toast.success(`Problem "${problem.title}" deleted.`);
      navigate('/problems', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete problem.'));
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteAttempt = async (attemptId) => {
    if (!problem || !attemptId) return;
    if (!window.confirm('Are you sure you want to delete this attempt?')) return;
    setDeletingAttemptId(attemptId);
    try {
      await deleteAttempt(problem.id, attemptId);
      toast.success('Attempt deleted successfully.');
      loadProblem();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete attempt.'));
    } finally {
      setDeletingAttemptId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-5 animate-pulse pb-12">
        <div className="h-4 w-44 bg-surface-2 rounded-md" />
        <div className="p-6 sm:p-8 space-y-4 rounded-xl bg-surface border border-line">
          <div className="h-8 w-72 bg-surface-2 rounded-lg" />
          <div className="h-4 w-48 bg-surface-2 rounded-md" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-surface-2 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="p-6 space-y-3 rounded-xl bg-surface border border-line">
          <div className="h-5 w-32 bg-surface-2 rounded-md" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-surface-2 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto my-12 border border-danger/25 rounded-xl bg-surface">
        <div className="w-12 h-12 rounded-xl bg-danger/10 border border-danger/25 flex items-center justify-center mx-auto mb-4 text-danger">
          <AlertTriangle className="w-6 h-6 text-danger" />
        </div>
        <h3 className="text-base font-semibold text-text mb-1">Problem Not Found</h3>
        <p className="text-xs text-muted mb-6 leading-relaxed">{error || 'This problem might have been removed or does not exist.'}</p>
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
    <div className="space-y-6 max-w-4xl mx-auto pb-6 animate-fade-up">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-xs text-muted min-w-0">
          <Link to="/problems" className="hover:text-text transition-colors flex items-center gap-1 shrink-0">
            <span>Problems</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-muted shrink-0" />
          <span className="text-text font-medium truncate max-w-[180px] sm:max-w-md">{problem.title}</span>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsEditModalOpen(true)}
            type="button"
            className="btn-secondary text-xs items-center gap-1.5"
            title="Edit problem details & topics"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            type="button"
            className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger border border-danger/25 hover:bg-danger/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Delete this problem"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Main Problem Hero Card */}
      <div className="p-4 sm:p-7 relative overflow-hidden bg-surface rounded-xl border border-line">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-6 relative z-10">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={diffCfg.variant} dot size="sm">{diffCfg.label}</Badge>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md border ${platformCfg.style}`}
                title={platformCfg.label}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${platformCfg.dot}`} />
                <span>{platformCfg.label}</span>
              </span>
              {latestCfg && (
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${latestCfg.bg} ${latestCfg.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${latestCfg.dot}`} />
                  <span>{latestCfg.label}</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl font-semibold tracking-tight text-text leading-tight break-words">
              {problem.title}
            </h1>

            {problem.topics?.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {problem.topics.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-xs px-2.5 py-1 rounded-md bg-surface-2 border border-line text-text-secondary"
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
              className="btn-secondary shrink-0 self-stretch sm:self-auto flex items-center justify-center gap-2 group text-xs w-full sm:w-auto"
            >
              <span>Solve on {platformCfg.short}</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-accent transition-transform" />
            </a>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-line relative z-10">
          <div className="p-3.5 rounded-lg bg-surface-2/60 border border-line group">
            <div className="flex items-center justify-between text-text-secondary mb-1">
              <span className="text-xs uppercase tracking-wide font-semibold">Sessions</span>
              <Zap className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="text-xl font-semibold text-text block tabular-nums">{attempts.length}</span>
          </div>

          <div className="p-3.5 rounded-lg bg-surface-2/60 border border-line group">
            <div className="flex items-center justify-between text-text-secondary mb-1">
              <span className="text-xs uppercase tracking-wide font-semibold">Best Time</span>
              <Clock className="w-3.5 h-3.5 text-success" />
            </div>
            <span className="text-xl font-semibold text-success block tabular-nums">
              {bestTime != null ? `${bestTime}m` : '—'}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-surface-2/60 border border-line group">
            <div className="flex items-center justify-between text-text-secondary mb-1">
              <span className="text-xs uppercase tracking-wide font-semibold">Average</span>
              <Flame className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="text-xl font-semibold text-text block tabular-nums">
              {avgTime != null ? `${avgTime}m` : '—'}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-surface-2/60 border border-line group">
            <div className="flex items-center justify-between text-text-secondary mb-1">
              <span className="text-xs uppercase tracking-wide font-semibold">Cataloged</span>
              <Calendar className="w-3.5 h-3.5 text-muted" />
            </div>
            <span className="text-xs text-muted mt-1.5 block truncate tabular-nums">
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
            <h2 className="text-base font-semibold text-text tracking-tight flex items-center gap-2">
              <span>Practice Audit History</span>
              <span className="text-xs font-normal text-muted tabular-nums">
                ({attempts.length} {attempts.length === 1 ? 'attempt' : 'attempts'})
              </span>
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Chronological log of recall sessions, speed metrics, and notes.
            </p>
          </div>
          <button
            onClick={() => {
              setTimerElapsedMinutes('');
              setEditingAttempt(null);
              setIsAttemptModalOpen(true);
            }}
            type="button"
            className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Log Attempt</span>
          </button>
        </div>

        {attempts.length === 0 ? (
          <div className="border border-dashed p-12 text-center bg-surface rounded-xl border-line">
            <div className="w-12 h-12 rounded-xl bg-surface-2 border border-line flex items-center justify-center mx-auto mb-4 text-muted">
              <Clock className="w-5 h-5 text-muted" />
            </div>
            <h3 className="text-sm font-semibold text-text">No practice sessions recorded yet</h3>
            <p className="text-xs text-muted mt-1.5 max-w-sm mx-auto leading-relaxed">
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
              const cfg = STATUS_CONFIG[attempt.status] || { label: attempt.status, text: 'text-muted', dot: 'bg-muted', bg: 'bg-surface-2 border-line' };
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
                  className="p-4 sm:p-4.5 rounded-xl transition-all duration-200 border border-line bg-surface hover:bg-surface-2/40 relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <span>{cfg.label}</span>
                      </span>

                      {isLatest && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent">
                          <Sparkles className="w-3 h-3" />
                          <span>Latest</span>
                        </span>
                      )}

                      {attempt.timeTakenMinutes != null && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted px-2 py-0.5 rounded-md bg-surface-2 border border-line tabular-nums">
                          <Clock className="w-3 h-3 text-muted" />
                          <span>{attempt.timeTakenMinutes}m</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted tabular-nums">
                        {attemptDate} · {attemptTime}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingAttempt(attempt)}
                          className="p-1 rounded-lg text-muted hover:text-medium hover:bg-surface-2 transition-colors cursor-pointer"
                          title="Edit attempt"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={deletingAttemptId === (attempt.id || attempt._id)}
                          onClick={() => handleDeleteAttempt(attempt.id || attempt._id)}
                          className="p-1 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Delete attempt"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {attempt.notes && (
                    <div className="mt-3 p-3.5 rounded-lg bg-surface-2 border border-line text-xs text-text-secondary leading-relaxed">
                      {attempt.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Attempt Modal (Log new or Edit existing) */}
      <AttemptForm
        isOpen={isAttemptModalOpen || Boolean(editingAttempt)}
        onClose={() => {
          setIsAttemptModalOpen(false);
          setEditingAttempt(null);
          setTimerElapsedMinutes('');
        }}
        onSuccess={loadProblem}
        problemId={problem?.id || problem?._id}
        problemTitle={problem?.title}
        defaultTimeTaken={timerElapsedMinutes}
        initialData={editingAttempt}
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

