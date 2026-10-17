import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Code2,
  Calendar,
  Clock,
  ExternalLink,
  Edit2,
  Plus,
  ArrowRight,
  History,
  FileCode2,
  CheckCircle2,
  RotateCw,
  AlertCircle,
} from 'lucide-react';
import JavaCodeEditor from '../common/JavaCodeEditor';
import {
  DifficultyBadge,
  StatusBadge,
  PlatformBadge,
  PLATFORM_NAMES,
  formatRelativeDate,
} from './ProblemBadges';
import problemsApi from '../../api/problems.api';

/**
 * ViewLogModal
 * Dedicated, rich modal to view all solution codes and practice logs for a problem.
 * Allows quick tab navigation across previous attempts, code copying, and opening editor.
 */
export default function ViewLogModal({
  isOpen,
  onClose,
  problem,
  onEditAttempt,
  onLogNewAttempt,
}) {
  const [attempts, setAttempts] = useState([]);
  const [selectedAttemptIndex, setSelectedAttemptIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const triggerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const handleModalWheel = (e) => {
    if (scrollContainerRef.current) {
      if (!scrollContainerRef.current.contains(e.target)) {
        scrollContainerRef.current.scrollTop += e.deltaY;
      }
    }
  };

  // Restore focus
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    } else if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Load all attempts for this problem when modal opens
  useEffect(() => {
    if (isOpen && problem?.id) {
      setLoading(true);
      setError(null);
      setSelectedAttemptIndex(0);

      problemsApi
        .getAttempts(problem.id)
        .then((res) => {
          if (res?.data?.attempts) {
            setAttempts(res.data.attempts);
          } else {
            setAttempts([]);
          }
        })
        .catch((err) => {
          console.error('Failed to load attempts:', err);
          setError('Unable to load attempt history.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, problem?.id]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !problem) return null;

  const currentAttempt = attempts[selectedAttemptIndex] || null;

  const attemptDate = currentAttempt?.attemptedAt
    ? new Date(currentAttempt.attemptedAt)
    : null;

  const formattedDate = attemptDate
    ? attemptDate.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const formattedTime = attemptDate
    ? attemptDate.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      data-lenis-prevent
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-surface border border-line rounded-2xl shadow-elevated overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-log-modal-title"
        onWheel={handleModalWheel}
        data-lenis-prevent
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-line bg-surface shrink-0 gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono text-accent uppercase tracking-wider font-semibold">
                Practice Log & Solution Code
              </span>
              <DifficultyBadge difficulty={problem.difficulty} />
              <PlatformBadge platform={problem.platform} />
            </div>
            <div className="flex items-center gap-2">
              <h2
                id="view-log-modal-title"
                className="text-base sm:text-lg font-bold text-text truncate"
                title={problem.title}
              >
                {problem.title}
              </h2>
              {problem.link && (
                <a
                  href={problem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted/60 hover:text-accent p-0.5 rounded transition-colors inline-flex items-center shrink-0"
                  title="Open external problem link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted hover:text-text rounded-lg hover:bg-surface-hover transition-all duration-150 active:scale-95 shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div
          ref={scrollContainerRef}
          data-lenis-prevent
          className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 overscroll-contain"
        >
          {/* Attempts History Tab Selector */}
          {attempts.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-line pb-2.5">
              <span className="text-xs font-mono text-muted mr-1 shrink-0 flex items-center gap-1">
                <History className="w-3.5 h-3.5 text-accent" />
                <span>Logs ({attempts.length}):</span>
              </span>
              {attempts.map((att, idx) => {
                const isSelected = idx === selectedAttemptIndex;
                const isSolved = att.status === 'solved';
                const isStruggled = att.status === 'struggled';

                return (
                  <button
                    key={att.id || idx}
                    type="button"
                    onClick={() => setSelectedAttemptIndex(idx)}
                    className={`h-8 px-3 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all duration-150 active:scale-95 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-accent text-white shadow-xs font-semibold'
                        : 'bg-surface-2 text-text-secondary hover:text-text hover:bg-surface-hover border border-line'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSolved
                          ? 'bg-emerald-400'
                          : isStruggled
                          ? 'bg-rose-400'
                          : 'bg-amber-400'
                      }`}
                    />
                    <span>
                      Attempt {attempts.length - idx}
                      {idx === 0 ? ' (Latest)' : ''}
                    </span>
                    {att.code && (
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-surface text-amber-400 border border-line'
                        }`}
                      >
                        Java
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="py-12 text-center text-muted text-xs font-mono animate-pulse">
              Loading practice log and Java solution...
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/25 text-danger text-xs font-mono">
              {error}
            </div>
          )}

          {/* Zero Attempts state */}
          {!loading && !error && attempts.length === 0 && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-surface-2 border border-line flex items-center justify-center text-muted mx-auto">
                <Code2 className="w-6 h-6 text-accent" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-text">No practice logs recorded yet</h3>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Log your first practice attempt to store your Java code, track your approach, and review your solutions anytime.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogNewAttempt && onLogNewAttempt(problem);
                }}
                className="h-9 px-4 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-all active:scale-95 shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log First Attempt</span>
              </button>
            </div>
          )}

          {/* Current Attempt Content */}
          {!loading && currentAttempt && (
            <div className="space-y-4">
              {/* Attempt Metadata Banner */}
              <div className="p-3.5 rounded-xl bg-surface-2/60 border border-line flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={currentAttempt.status} />

                  {/* Approach badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-0.5 rounded-md border font-medium ${
                      currentAttempt.approach === 'brute_force'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : currentAttempt.approach === 'better'
                        ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                        : currentAttempt.approach === 'other'
                        ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        currentAttempt.approach === 'brute_force'
                          ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                          : currentAttempt.approach === 'better'
                          ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.5)]'
                          : currentAttempt.approach === 'other'
                          ? 'bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.5)]'
                          : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]'
                      }`}
                    />
                    <span className="capitalize">
                      {(currentAttempt.approach || 'optimal').replace('_', ' ')}
                    </span>
                  </span>

                  {currentAttempt.timeTakenMinutes !== null &&
                    currentAttempt.timeTakenMinutes !== undefined && (
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-muted ml-1">
                        <Clock className="w-3.5 h-3.5 text-muted" />
                        <span>{currentAttempt.timeTakenMinutes} mins</span>
                      </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-muted">
                    <Calendar className="w-3.5 h-3.5 text-muted" />
                    <span>{formattedDate}</span>
                    {formattedTime && <span className="text-muted/60">at {formattedTime}</span>}
                  </div>

                  {onEditAttempt && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEditAttempt(problem, currentAttempt);
                      }}
                      className="ml-2 h-7 px-2.5 text-xs font-mono font-medium text-accent hover:text-white bg-accent/10 hover:bg-accent border border-accent/25 rounded-md transition-all active:scale-95 inline-flex items-center gap-1"
                      title="Edit this log's code, approach, or notes"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Log</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Java Code Section */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Java Solution Code</span>
                  </label>
                  {!currentAttempt.code && (
                    <span className="text-[11px] font-mono text-muted italic">
                      No code stored for this attempt
                    </span>
                  )}
                </div>

                {currentAttempt.code ? (
                  <JavaCodeEditor
                    value={currentAttempt.code}
                    approach={currentAttempt.approach || 'optimal'}
                    readOnly={true}
                    allowApproachSelection={false}
                    minHeight="220px"
                    maxHeight="420px"
                  />
                ) : (
                  <div className="p-6 rounded-xl bg-surface-2/30 border border-dashed border-line text-center space-y-2.5">
                    <p className="text-xs text-muted font-mono">
                      This attempt was logged without Java code.
                    </p>
                    {onEditAttempt && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onEditAttempt(problem, currentAttempt);
                        }}
                        className="h-8 px-3 text-xs font-medium bg-accent/15 text-accent border border-accent/30 hover:bg-accent hover:text-white rounded-lg transition-all active:scale-95 inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Java Code to This Log</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Practice Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text block">
                  Practice Notes & Key Takeaways
                </label>
                {currentAttempt.notes ? (
                  <div className="p-3.5 rounded-xl bg-surface-2/60 border border-line text-xs text-text-secondary whitespace-pre-wrap leading-relaxed font-sans">
                    {currentAttempt.notes}
                  </div>
                ) : (
                  <div className="text-xs text-muted italic font-mono p-3 rounded-lg bg-surface-2/30 border border-line">
                    No notes recorded for this attempt.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-line bg-surface shrink-0">
          <div className="flex items-center gap-2">
            {onLogNewAttempt && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogNewAttempt(problem);
                }}
                className="h-8.5 px-3.5 text-xs font-medium text-accent bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg transition-all active:scale-95 inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Attempt</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8.5 px-4 text-xs font-medium text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-lg transition-all active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
