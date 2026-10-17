import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Calendar,
  History,
  AlertCircle,
  RotateCcw,
  Code2,
} from 'lucide-react';
import problemsApi from '../api/problems.api';
import {
  DifficultyBadge,
  StatusBadge,
  PlatformBadge,
  PLATFORM_NAMES,
  formatRelativeDate,
} from '../components/problems/ProblemBadges';
import JavaCodeEditor from '../components/common/JavaCodeEditor';
import ProblemFormModal from '../components/problems/ProblemFormModal';
import AttemptFormModal from '../components/problems/AttemptFormModal';
import DeleteConfirmModal from '../components/problems/DeleteConfirmModal';
import ViewLogModal from '../components/problems/ViewLogModal';

/**
 * AttemptCodeViewer
 * Collapsible syntax-highlighted Java code viewer with line numbers and copy controls
 */
function AttemptCodeViewer({ code, approach, index, onEdit }) {
  const [isOpen, setIsOpen] = useState(index === 0);
  const lineCount = useMemo(() => (code || '').split('\n').length, [code]);

  if (!code || !code.trim()) return null;

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-accent hover:text-accent-hover transition-colors font-medium active:scale-95"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>{isOpen ? 'Hide Java Solution' : 'View Java Solution'}</span>
          <span className="text-[10px] text-muted font-normal">
            ({lineCount} {lineCount === 1 ? 'line' : 'lines'})
          </span>
        </button>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-[11px] font-mono text-muted hover:text-accent transition-colors inline-flex items-center gap-1 active:scale-95"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit Code</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="animate-in fade-in duration-150">
          <JavaCodeEditor
            value={code}
            approach={approach || 'optimal'}
            readOnly={true}
            allowApproachSelection={false}
            minHeight="140px"
            maxHeight="340px"
          />
        </div>
      )}
    </div>
  );
}

/**
 * ProblemDetailPage
 * Single problem practice workspace with metadata hero, practice HUD,
 * Leitner cadence schedule, and activity timeline.
 */
export default function ProblemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAttemptOpen, setIsAttemptOpen] = useState(false);
  const [editingAttempt, setEditingAttempt] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewLogModalOpen, setIsViewLogModalOpen] = useState(false);

  // Load problem details & attempts
  const loadProblemData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await problemsApi.getProblem(id);
      if (res.data) {
        setProblem(res.data.problem);
        setAttempts(res.data.attempts || []);
      }
    } catch (err) {
      setError(
        err.status === 404
          ? 'Problem not found or you do not have permission to view it.'
          : err.message || 'Failed to load problem details.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProblemData();
  }, [loadProblemData]);

  // Derived metrics
  const totalPracticeMinutes = useMemo(() => {
    return attempts.reduce((acc, curr) => acc + (curr.timeTakenMinutes || 0), 0);
  }, [attempts]);

  const latestAttempt = attempts.length > 0 ? attempts[0] : null;

  // Spaced Repetition Cadence calculation
  const revisionInfo = useMemo(() => {
    if (!latestAttempt) return null;
    const intervalMap = {
      struggled: 2,
      revisit_needed: 5,
      solved: 14,
    };
    const intervalDays = intervalMap[latestAttempt.status] || 7;
    const attemptedTime = new Date(latestAttempt.attemptedAt).getTime();
    const dueTime = attemptedTime + intervalDays * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const diffDays = Math.round((dueTime - now) / (1000 * 60 * 60 * 24));

    let urgencyLabel = 'Upcoming';
    let urgencyColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
    let dueText = `Due in ${diffDays}d`;

    if (diffDays <= 0) {
      if (diffDays === 0) {
        urgencyLabel = 'Due today';
        urgencyColor = 'text-amber-400 bg-amber-500/10 border-amber-500/25';
        dueText = 'Ready for review today';
      } else {
        urgencyLabel = 'Overdue';
        urgencyColor = 'text-rose-400 bg-rose-500/10 border-rose-500/25';
        dueText = `Overdue by ${Math.abs(diffDays)}d`;
      }
    }

    return {
      intervalDays,
      dueText,
      urgencyLabel,
      urgencyColor,
    };
  }, [latestAttempt]);

  // Handlers
  const handleEditSubmit = async (formData) => {
    await problemsApi.updateProblem(id, formData);
    await loadProblemData();
  };

  const handleAttemptSubmit = async (attemptData) => {
    if (editingAttempt) {
      const attemptId = editingAttempt.id || editingAttempt._id;
      await problemsApi.updateAttempt(id, attemptId, attemptData);
    } else {
      await problemsApi.createAttempt(id, attemptData);
    }
    await loadProblemData();
    setEditingAttempt(null);
  };

  const handleEditAttempt = (attempt) => {
    setEditingAttempt(attempt);
    setIsAttemptOpen(true);
  };

  const handleDeleteAttempt = async (attemptId) => {
    if (window.confirm('Are you sure you want to delete this practice log?')) {
      try {
        await problemsApi.deleteAttempt(id, attemptId);
        await loadProblemData();
      } catch (err) {
        alert(err.message || 'Failed to delete attempt');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    await problemsApi.deleteProblem(id);
    navigate('/problems', { replace: true });
  };

  // Structured Loading Skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 bg-surface-2 rounded w-44" />

        {/* Hero Card Skeleton */}
        <div className="p-6 rounded-xl bg-surface border border-line shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex gap-2">
                <div className="h-4 bg-surface-2 rounded w-16" />
                <div className="h-4 bg-surface-2 rounded w-20" />
              </div>
              <div className="h-8 bg-surface-2 rounded w-72 sm:w-96" />
              <div className="flex gap-1.5">
                <div className="h-5 bg-surface-2 rounded w-16" />
                <div className="h-5 bg-surface-2 rounded w-20" />
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <div className="h-9 bg-surface-2 rounded w-28" />
              <div className="h-9 bg-surface-2 rounded w-9" />
              <div className="h-9 bg-surface-2 rounded w-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-line/60">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-surface-2/40 border border-line space-y-2">
                <div className="h-3 bg-surface-2 rounded w-20" />
                <div className="h-6 bg-surface-2 rounded w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Skeleton */}
        <div className="space-y-3 pt-2">
          <div className="h-5 bg-surface-2 rounded w-36 mb-4" />
          <div className="p-4 rounded-xl bg-surface border border-line space-y-3">
            <div className="h-4 bg-surface-2 rounded w-48" />
            <div className="h-12 bg-surface-2/50 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error / Not Found State
  if (error || !problem) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center flex flex-col items-center justify-center space-y-4 bg-surface border border-line rounded-xl shadow-xs">
        <div className="p-3 rounded-full bg-danger/10 text-danger border border-danger/25">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-text">Problem Unavailable</h2>
          <p className="text-xs text-muted max-w-sm">{error || 'Unable to display problem.'}</p>
        </div>
        <Link
          to="/problems"
          className="h-9 px-4 inline-flex items-center gap-1.5 text-xs font-mono font-medium text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-lg transition-all duration-150 active:scale-95 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to problems</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 sm:pb-12 animate-in fade-in duration-200">
      {/* Restrained Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted">
        <Link
          to="/problems"
          className="hover:text-text transition-colors inline-flex items-center gap-1 font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Problems</span>
        </Link>
        <span className="text-muted/60">/</span>
        <span className="text-text-secondary truncate max-w-xs font-medium">
          {problem.title}
        </span>
      </nav>

      {/* Problem Hero Workspace Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-surface border border-line shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div className="space-y-3 flex-1 min-w-0">
            {/* Context Eyebrow */}
            <span className="text-[10px] font-mono text-accent uppercase tracking-wider block">
              Problem Workspace
            </span>

            {/* Problem Title Hero */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text leading-tight break-words">
              {problem.title}
            </h1>

            {/* Badges & External Link Row */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <DifficultyBadge difficulty={problem.difficulty} />
              <PlatformBadge platform={problem.platform} />

              {problem.link && (
                <a
                  href={problem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-accent hover:underline ml-1 font-mono"
                >
                  <span>Open on {PLATFORM_NAMES[problem.platform] || 'platform'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Topics Pills */}
            {problem.topics && problem.topics.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {problem.topics.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded text-[10px] font-mono text-muted bg-surface-2 border border-line"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Group */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start pt-1">
            {attempts.length > 0 && (
              <button
                type="button"
                onClick={() => setIsViewLogModalOpen(true)}
                className="h-9 px-3.5 inline-flex items-center gap-1.5 text-xs font-mono font-medium text-accent bg-accent/10 hover:bg-accent/20 border border-accent/25 rounded-lg transition-all duration-150 active:scale-95 shadow-xs"
                title="View all solution codes and logs in a dedicated viewer"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>View Solutions ({attempts.length})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setEditingAttempt(null);
                setIsAttemptOpen(true);
              }}
              className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-all duration-150 active:scale-95 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log attempt</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="h-9 px-3 inline-flex items-center gap-1.5 text-xs font-medium text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-lg transition-all duration-150 active:scale-95 shadow-xs"
              title="Edit problem details"
              aria-label="Edit problem details"
            >
              <Edit2 className="w-3.5 h-3.5 text-muted" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              className="h-9 px-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-danger hover:bg-danger/10 border border-line hover:border-danger/30 rounded-lg transition-all duration-150 active:scale-95 shadow-xs"
              title="Delete problem"
              aria-label="Delete problem"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {/* Practice Metrics HUD */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-line">
          <div className="p-3.5 rounded-xl bg-surface-2/40 border border-line flex flex-col justify-between min-h-[74px]">
            <span className="text-[10px] font-mono uppercase text-muted tracking-wider block mb-1">
              Current Status
            </span>
            <div>
              <StatusBadge status={latestAttempt?.status || null} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2/40 border border-line flex flex-col justify-between min-h-[74px]">
            <span className="text-[10px] font-mono uppercase text-muted tracking-wider block mb-1">
              Total Attempts
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-text">
                {attempts.length}
              </span>
              <span className="text-[11px] font-mono text-muted">
                {attempts.length === 1 ? 'attempt' : 'attempts'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2/40 border border-line flex flex-col justify-between min-h-[74px]">
            <span className="text-[10px] font-mono uppercase text-muted tracking-wider block mb-1">
              Total Practice Time
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-text">
                {totalPracticeMinutes > 0 ? totalPracticeMinutes : '—'}
              </span>
              {totalPracticeMinutes > 0 && (
                <span className="text-[11px] font-mono text-muted">mins</span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2/40 border border-line flex flex-col justify-between min-h-[74px]">
            <span className="text-[10px] font-mono uppercase text-muted tracking-wider block mb-1">
              Last Attempted
            </span>
            <span className="text-sm sm:text-base font-semibold font-mono text-text truncate block">
              {latestAttempt ? formatRelativeDate(latestAttempt.attemptedAt) : 'Never'}
            </span>
          </div>
        </div>

        {/* Spaced Repetition Cadence HUD */}
        {revisionInfo && (
          <div className="p-3 sm:p-3.5 rounded-xl bg-surface-2/50 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/25 text-accent shrink-0">
                <RotateCcw className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-muted tracking-wider block">
                  Spaced Repetition Schedule
                </span>
                <span className="text-xs font-medium text-text">
                  Target {revisionInfo.intervalDays}-day interval · {revisionInfo.dueText}
                </span>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded-md border self-start sm:self-auto ${revisionInfo.urgencyColor}`}
            >
              {revisionInfo.urgencyLabel}
            </span>
          </div>
        )}
      </div>

      {/* Attempt History Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-line pb-3 gap-2">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-muted" />
            <h2 className="text-sm font-semibold text-text">Practice History</h2>
            <span className="text-xs font-mono text-muted">
              ({attempts.length} {attempts.length === 1 ? 'attempt' : 'attempts'})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsAttemptOpen(true)}
            className="text-xs font-mono font-medium text-accent hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <Plus className="w-3 h-3" />
            <span>Record new attempt</span>
          </button>
        </div>

        {attempts.length > 0 ? (
          <div className="relative border-l border-line ml-3.5 sm:ml-4 pl-6 sm:pl-7 space-y-4">
            {attempts.map((attempt, index) => {
              const attemptDate = new Date(attempt.attemptedAt);
              const formattedDate = attemptDate.toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });
              const formattedTime = attemptDate.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              });
              const isSolved = attempt.status === 'solved';
              const isStruggled = attempt.status === 'struggled';

              // Node color based on outcome
              const nodeClass = isSolved
                ? 'bg-emerald-400 ring-4 ring-emerald-500/15'
                : isStruggled
                  ? 'bg-rose-400 ring-4 ring-rose-500/15'
                  : 'bg-amber-400 ring-4 ring-amber-500/15';

              return (
                <div key={attempt.id || index} className="relative group">
                  {/* Timeline indicator node */}
                  <span
                    className={`absolute -left-[31px] sm:-left-[35px] top-4 w-2.5 h-2.5 rounded-full ${nodeClass}`}
                  />

                  <div className="p-4 sm:p-5 rounded-xl bg-surface border border-line shadow-xs space-y-3 hover:border-line-hover transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={attempt.status} />

                        {attempt.approach && (
                          <span
                            className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-md border font-medium ${
                              attempt.approach === 'brute_force'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : attempt.approach === 'better'
                                ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                                : attempt.approach === 'other'
                                ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                attempt.approach === 'brute_force'
                                  ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                                  : attempt.approach === 'better'
                                  ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.5)]'
                                  : attempt.approach === 'other'
                                  ? 'bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.5)]'
                                  : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]'
                              }`}
                            />
                            <span className="capitalize">
                              {attempt.approach.replace('_', ' ')}
                            </span>
                          </span>
                        )}

                        {index === 0 && (
                          <span className="text-[9px] font-mono uppercase font-semibold text-accent bg-accent/10 border border-accent/25 px-1.5 py-0.5 rounded">
                            Latest
                          </span>
                        )}

                        {attempt.timeTakenMinutes !== undefined &&
                          attempt.timeTakenMinutes !== null && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted ml-1">
                              <Clock className="w-3 h-3 text-muted" />
                              <span>{attempt.timeTakenMinutes} mins</span>
                            </span>
                          )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted">
                          <Calendar className="w-3 h-3 text-muted shrink-0" />
                          <span>{formattedDate} at {formattedTime}</span>
                          <span className="text-muted/60 hidden sm:inline">
                            ({formatRelativeDate(attempt.attemptedAt)})
                          </span>
                        </div>

                        <div className="flex items-center gap-1 ml-1">
                          <button
                            type="button"
                            onClick={() => handleEditAttempt(attempt)}
                            className="h-7 px-2.5 inline-flex items-center gap-1 text-[11px] font-mono text-text bg-surface-2 hover:bg-surface-hover border border-line rounded transition-all active:scale-95 shadow-xs"
                            title="Edit this practice log & code"
                          >
                            <Edit2 className="w-3 h-3 text-muted" />
                            <span>Edit Log</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAttempt(attempt.id || attempt._id)}
                            className="h-7 w-7 inline-flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 border border-line hover:border-danger/30 rounded transition-all active:scale-95"
                            title="Delete this practice log"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Notes block */}
                    {attempt.notes ? (
                      <div className="p-3.5 rounded-lg bg-surface-2/60 border border-line text-xs text-text-secondary whitespace-pre-wrap leading-relaxed font-sans">
                        {attempt.notes}
                      </div>
                    ) : (
                      <div className="text-[11px] text-muted italic font-mono">
                        No notes recorded for this attempt.
                      </div>
                    )}

                    {/* Java Solution Code Viewer */}
                    {attempt.code ? (
                      <AttemptCodeViewer
                        code={attempt.code}
                        approach={attempt.approach}
                        index={index}
                        onEdit={() => handleEditAttempt(attempt)}
                      />
                    ) : (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => handleEditAttempt(attempt)}
                          className="inline-flex items-center gap-1.5 text-xs font-mono text-accent hover:text-accent-hover transition-colors font-medium active:scale-95"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>+ Add Java solution code to this log</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-3 bg-surface border border-dashed border-line rounded-xl">
            <div className="p-3 rounded-full bg-surface-2 text-muted border border-line">
              <History className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-text">No practice attempts yet</h3>
              <p className="text-xs text-muted max-w-sm leading-relaxed">
                Log your first attempt to start building your practice timeline, tracking solution times, and recording key takeaways.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingAttempt(null);
                setIsAttemptOpen(true);
              }}
              className="mt-2 h-9 inline-flex items-center gap-1.5 px-4 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-all duration-150 active:scale-95 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log first attempt</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProblemFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={problem}
        title="Edit Problem"
      />

      <AttemptFormModal
        isOpen={isAttemptOpen}
        onClose={() => {
          setIsAttemptOpen(false);
          setEditingAttempt(null);
        }}
        onSubmit={handleAttemptSubmit}
        problemTitle={problem.title}
        initialData={editingAttempt}
      />

      <ViewLogModal
        isOpen={isViewLogModalOpen}
        onClose={() => setIsViewLogModalOpen(false)}
        problem={problem}
        onEditAttempt={(att) => {
          setIsViewLogModalOpen(false);
          handleEditAttempt(att);
        }}
        onLogNewAttempt={() => {
          setIsViewLogModalOpen(false);
          setEditingAttempt(null);
          setIsAttemptOpen(true);
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        problemTitle={problem.title}
      />
    </div>
  );
}
