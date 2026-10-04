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
  Loader2,
} from 'lucide-react';
import problemsApi from '../api/problems.api';
import {
  DifficultyBadge,
  StatusBadge,
  PlatformBadge,
  PLATFORM_NAMES,
  formatRelativeDate,
} from '../components/problems/ProblemBadges';
import ProblemFormModal from '../components/problems/ProblemFormModal';
import AttemptFormModal from '../components/problems/AttemptFormModal';
import DeleteConfirmModal from '../components/problems/DeleteConfirmModal';

/**
 * ProblemDetailPage
 * Displays single problem metadata alongside its complete practice attempt history.
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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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

  // Handlers
  const handleEditSubmit = async (formData) => {
    await problemsApi.updateProblem(id, formData);
    await loadProblemData();
  };

  const handleAttemptSubmit = async (attemptData) => {
    await problemsApi.createAttempt(id, attemptData);
    await loadProblemData();
  };

  const handleDeleteConfirm = async () => {
    await problemsApi.deleteProblem(id);
    navigate('/problems', { replace: true });
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-surface border border-line rounded-lg shadow-subtle animate-in fade-in duration-150">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
        <p className="text-xs text-muted font-mono">Loading problem details...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center space-y-4 bg-surface border border-line rounded-lg shadow-subtle animate-in fade-in duration-150">
        <div className="p-3 rounded-full bg-danger/10 text-danger border border-danger/25">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-text">Problem Unavailable</h2>
          <p className="text-xs text-muted max-w-sm">{error}</p>
        </div>
        <Link
          to="/problems"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-md transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to problems</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-muted">
        <Link
          to="/problems"
          className="hover:text-text transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Problems</span>
        </Link>
        <span>/</span>
        <span className="text-text-secondary truncate max-w-xs">{problem.title}</span>
      </div>

      {/* Problem Header Card */}
      <div className="p-6 rounded-lg bg-surface border border-line shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <DifficultyBadge difficulty={problem.difficulty} />
              <PlatformBadge platform={problem.platform} />
              {problem.link && (
                <a
                  href={problem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-accent hover:underline ml-1"
                >
                  <span>Open on {PLATFORM_NAMES[problem.platform] || 'platform'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-text">
              {problem.title}
            </h1>

            {/* Topics */}
            {problem.topics && problem.topics.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {problem.topics.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface-2 text-text-secondary border border-line"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsAttemptOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-md transition-colors shadow-subtle"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log attempt</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="p-1.5 text-text-secondary hover:text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-md transition-colors"
              title="Edit problem details"
              aria-label="Edit problem details"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              className="p-1.5 text-muted hover:text-danger bg-surface-2 hover:bg-danger/10 border border-line rounded-md transition-colors"
              title="Delete problem"
              aria-label="Delete problem"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* High-Level Practice Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-line/60">
          <div className="p-3 rounded-md bg-surface-2/60 border border-line/60">
            <span className="text-[10px] font-mono uppercase text-muted tracking-wider block mb-1">
              Current Status
            </span>
            <StatusBadge status={latestAttempt?.status || null} />
          </div>

          <div className="p-3 rounded-md bg-surface-2/60 border border-line/60">
            <span className="text-[10px] font-mono uppercase text-muted tracking-wider block mb-1">
              Total Attempts
            </span>
            <span className="text-sm font-semibold font-mono text-text">
              {attempts.length}
            </span>
          </div>

          <div className="p-3 rounded-md bg-surface-2/60 border border-line/60">
            <span className="text-[10px] font-mono uppercase text-muted tracking-wider block mb-1">
              Total Practice Time
            </span>
            <span className="text-sm font-semibold font-mono text-text">
              {totalPracticeMinutes > 0 ? `${totalPracticeMinutes} mins` : '—'}
            </span>
          </div>

          <div className="p-3 rounded-md bg-surface-2/60 border border-line/60">
            <span className="text-[10px] font-mono uppercase text-muted tracking-wider block mb-1">
              Last Attempted
            </span>
            <span className="text-sm font-semibold font-mono text-text">
              {latestAttempt ? formatRelativeDate(latestAttempt.attemptedAt) : 'Never'}
            </span>
          </div>
        </div>
      </div>

      {/* Attempt History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
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
            className="text-xs font-medium text-accent hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Record new attempt</span>
          </button>
        </div>

        {attempts.length > 0 ? (
          <div className="space-y-3">
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

              return (
                <div
                  key={attempt.id}
                  className="p-4 rounded-lg bg-surface border border-line shadow-subtle space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={attempt.status} />
                      {attempt.timeTakenMinutes !== undefined &&
                        attempt.timeTakenMinutes !== null && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted">
                            <Clock className="w-3 h-3" />
                            {attempt.timeTakenMinutes} mins
                          </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted">
                      <Calendar className="w-3 h-3" />
                      <span>{formattedDate} at {formattedTime}</span>
                      <span className="text-muted/60">
                        ({formatRelativeDate(attempt.attemptedAt)})
                      </span>
                    </div>
                  </div>

                  {attempt.notes ? (
                    <div className="p-3 rounded bg-surface-2 border border-line/80 text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
                      {attempt.notes}
                    </div>
                  ) : (
                    <div className="text-[11px] text-muted italic">
                      No notes recorded for this attempt.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-surface border border-line rounded-lg shadow-subtle">
            <div className="p-3 rounded-full bg-surface-2 text-muted border border-line">
              <History className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-text">No practice attempts yet</h3>
              <p className="text-xs text-muted max-w-sm">
                Log your first practice session for this problem to track your solving speed,
                solution notes, and mastery progress.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAttemptOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-md transition-colors shadow-subtle"
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
        onClose={() => setIsAttemptOpen(false)}
        onSubmit={handleAttemptSubmit}
        problemTitle={problem.title}
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
