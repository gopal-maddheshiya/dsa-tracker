import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Loader2,
  CheckCircle2,
  RotateCw,
  AlertCircle,
  Clock,
  Calendar,
  Code2,
  FileText,
} from 'lucide-react';
import FormAlert from '../common/FormAlert';
import JavaCodeEditor from '../common/JavaCodeEditor';

/**
 * AttemptFormModal
 * Modal dialog for logging or editing a practice attempt on a problem.
 * Preserves timezone-safe date generation and clear outcome selection hierarchy.
 * Features a sticky header, smooth scrollable body, fixed action footer, and shortcut keys.
 */
export default function AttemptFormModal({
  isOpen,
  onClose,
  onSubmit,
  problemTitle = 'Problem',
  initialData = null,
}) {
  const getTodayDateString = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getInitialState = () => {
    if (initialData) {
      let dateStr = getTodayDateString();
      if (initialData.attemptedAt) {
        try {
          dateStr = new Date(initialData.attemptedAt).toISOString().split('T')[0];
        } catch {
          dateStr = getTodayDateString();
        }
      }
      return {
        status: initialData.status || 'solved',
        approach: initialData.approach || 'optimal',
        code: initialData.code || '',
        timeTakenMinutes:
          initialData.timeTakenMinutes !== null && initialData.timeTakenMinutes !== undefined
            ? String(initialData.timeTakenMinutes)
            : '',
        attemptDate: dateStr,
        notes: initialData.notes || '',
      };
    }
    return {
      status: 'solved',
      approach: 'optimal',
      code: '',
      timeTakenMinutes: '',
      attemptDate: getTodayDateString(),
      notes: '',
    };
  };

  const [formData, setFormData] = useState(getInitialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const triggerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Wheel forwarding to guarantee smooth mouse wheel scrolling even when hovering on header/footer
  const handleModalWheel = (e) => {
    if (scrollContainerRef.current) {
      if (!scrollContainerRef.current.contains(e.target)) {
        scrollContainerRef.current.scrollTop += e.deltaY;
      }
    }
  };

  const handleNotesWheel = (e) => {
    const el = e.currentTarget;
    const isScrollable = el.scrollHeight > el.clientHeight + 4;
    if (!isScrollable && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop += e.deltaY;
    }
  };

  // Focus restoration to opening trigger
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    } else if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  // Reset or prefill form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
      setError(null);
    }
  }, [isOpen, initialData]);

  // Lock body scroll when modal is open and restore on close/unmount
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);

    const payload = {
      status: formData.status,
      approach: formData.approach,
      code: formData.code.trim() ? formData.code : undefined,
      notes: formData.notes.trim() || undefined,
    };

    if (formData.timeTakenMinutes !== '') {
      const parsedTime = parseInt(formData.timeTakenMinutes, 10);
      if (isNaN(parsedTime) || parsedTime < 0) {
        setError('Time taken must be a non-negative number of minutes');
        return;
      }
      payload.timeTakenMinutes = parsedTime;
    }

    if (formData.attemptDate) {
      const todayStr = getTodayDateString();
      if (formData.attemptDate === todayStr) {
        payload.attemptedAt = new Date().toISOString();
      } else {
        const parts = formData.attemptDate.split('-').map(Number);
        if (parts.length === 3 && !parts.some(isNaN)) {
          const [year, month, day] = parts;
          const middayUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
          payload.attemptedAt = middayUtc.toISOString();
        } else {
          setError('Please provide a valid attempt date');
          return;
        }
      }
    }

    setLoading(true);
    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to log attempt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormKeyDown = (e) => {
    // Ctrl + Enter or Cmd + Enter to submit quickly
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const statusOptions = [
    {
      value: 'solved',
      label: 'Solved',
      desc: 'Solved cleanly without blockers',
      icon: CheckCircle2,
      activeCard:
        'border-emerald-500/70 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30 shadow-[0_0_18px_-4px_rgba(16,185,129,0.22)]',
      dotClass: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]',
      iconClass: 'text-emerald-400',
    },
    {
      value: 'revisit_needed',
      label: 'Revisit Needed',
      desc: 'Completed with hints or hesitation',
      icon: RotateCw,
      activeCard:
        'border-amber-500/70 bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30 shadow-[0_0_18px_-4px_rgba(245,158,11,0.22)]',
      dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]',
      iconClass: 'text-amber-400',
    },
    {
      value: 'struggled',
      label: 'Struggled',
      desc: 'Stuck or needed complete solution',
      icon: AlertCircle,
      activeCard:
        'border-rose-500/70 bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30 shadow-[0_0_18px_-4px_rgba(244,63,94,0.22)]',
      dotClass: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.7)]',
      iconClass: 'text-rose-400',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
      data-lenis-prevent
    >
      <div
        className="w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-surface border border-line/80 rounded-2xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)] overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="attempt-modal-title"
        onWheel={handleModalWheel}
        data-lenis-prevent
      >
        {/* 1. Header (Sticky Top) */}
        <div className="flex items-start justify-between px-5 sm:px-6 py-4 border-b border-line/80 bg-surface/95 backdrop-blur-xs shrink-0 gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase bg-accent/10 text-accent border border-accent/25">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                {initialData ? 'Edit Practice Log & Code' : 'Log Practice Attempt'}
              </span>
            </div>
            <h2
              id="attempt-modal-title"
              className="text-base sm:text-lg font-bold text-text tracking-tight truncate"
              title={problemTitle}
            >
              {problemTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-muted hover:text-text rounded-xl bg-surface-2/60 hover:bg-surface-hover border border-line/60 hover:border-line transition-all duration-150 active:scale-95 disabled:opacity-50 shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Form Body (Scrollable, Guaranteed via min-h-0 flex-1) */}
        <form
          onSubmit={handleSubmit}
          onKeyDown={handleFormKeyDown}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
          data-lenis-prevent
        >
          <div
            ref={scrollContainerRef}
            data-lenis-prevent
            className="p-5 sm:p-6 space-y-5 overflow-y-auto min-h-0 flex-1 overscroll-contain"
          >
            <FormAlert message={error} />

            {/* Section 1: Practice Outcome */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider font-mono">
                  Practice Outcome <span className="text-danger">*</span>
                </label>
                <span className="text-[11px] font-mono text-muted">
                  Sets spaced-repetition cadence
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {statusOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = formData.status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: opt.value })}
                      className={`relative flex flex-col items-start p-3 sm:p-3.5 rounded-xl border text-left transition-all duration-150 active:scale-[0.98] ${
                        isSelected
                          ? opt.activeCard
                          : 'border-line/70 bg-surface-2/40 hover:bg-surface-2 hover:border-line text-text-secondary hover:text-text shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 font-semibold text-xs text-text">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isSelected ? opt.iconClass : 'text-muted'
                            }`}
                          />
                          <span className={isSelected ? 'text-text font-bold' : ''}>
                            {opt.label}
                          </span>
                        </div>
                        {isSelected && (
                          <span className={`w-2 h-2 rounded-full ${opt.dotClass}`} />
                        )}
                      </div>
                      <span className="text-[10px] text-muted mt-1.5 leading-relaxed font-sans">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Attempt Date & Time Spent */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text uppercase tracking-wider font-mono mb-1.5">
                  Attempt Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.attemptDate}
                    onChange={(e) =>
                      setFormData({ ...formData, attemptDate: e.target.value })
                    }
                    className="w-full h-10 pl-9 pr-3.5 bg-surface-2/50 text-text text-xs rounded-xl border border-line/80 focus:outline-none focus:border-accent focus:bg-surface-2 focus:ring-1 focus:ring-accent transition-all font-mono"
                  />
                  <Calendar className="w-4 h-4 text-muted absolute left-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-muted mt-1 font-sans">
                  Backfill date if logging an earlier practice session.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-text uppercase tracking-wider font-mono">
                    Time Spent (mins)
                  </label>
                  <div className="flex items-center gap-1">
                    {[15, 30, 45, 60].map((mins) => {
                      const isSelected = formData.timeTakenMinutes === String(mins);
                      return (
                        <button
                          key={mins}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, timeTakenMinutes: mins.toString() })
                          }
                          className={`px-2 py-0.5 text-[10px] font-mono rounded-md border transition-all active:scale-95 ${
                            isSelected
                              ? 'bg-accent text-white border-accent font-semibold'
                              : 'bg-surface-2/60 text-muted hover:text-text hover:bg-surface-hover border-line/70'
                          }`}
                        >
                          {mins}m
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 25"
                    value={formData.timeTakenMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, timeTakenMinutes: e.target.value })
                    }
                    className="w-full h-10 pl-9 pr-3.5 bg-surface-2/50 text-text text-xs rounded-xl border border-line/80 focus:outline-none focus:border-accent focus:bg-surface-2 focus:ring-1 focus:ring-accent transition-all font-mono placeholder:text-muted/50"
                  />
                  <Clock className="w-4 h-4 text-muted absolute left-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-muted mt-1 font-sans">
                  Tracks speed improvements across subsequent revisions.
                </p>
              </div>
            </div>

            {/* Section 3: Java Solution Code & Approach */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-accent/10 border border-accent/25 text-accent">
                    <Code2 className="w-3.5 h-3.5" />
                  </div>
                  <label className="text-xs font-semibold text-text uppercase tracking-wider font-mono">
                    Java Solution Code & Approach
                  </label>
                </div>
                <span className="text-[10px] font-mono text-muted/80 hidden sm:inline">
                  Optional · Live syntax highlighted
                </span>
              </div>
              <JavaCodeEditor
                value={formData.code}
                onChange={(code) => setFormData({ ...formData, code })}
                approach={formData.approach}
                onApproachChange={(approach) => setFormData({ ...formData, approach })}
                allowApproachSelection={true}
                minHeight="170px"
                maxHeight="260px"
                problemTitle={problemTitle}
              />
            </div>

            {/* Section 4: Practice Notes & Key Takeaways */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-surface-2 border border-line text-muted">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <label className="text-xs font-semibold text-text uppercase tracking-wider font-mono">
                    Practice Notes & Key Takeaways
                  </label>
                </div>
                <span className="text-[10px] font-mono text-muted/70">
                  {(formData.notes || '').length} chars
                </span>
              </div>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                onWheel={handleNotesWheel}
                placeholder="What approach did you take? What tripped you up? Edge cases or complexity notes to remember next time..."
                className="w-full p-3.5 bg-surface-2/50 text-text text-xs rounded-xl border border-line/80 focus:outline-none focus:border-accent focus:bg-surface-2 focus:ring-1 focus:ring-accent transition-all resize-none placeholder:text-muted/50 leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* 3. Action Footer (Sticky Bottom, Guaranteed Always Visible) */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-line/80 bg-surface/95 backdrop-blur-md shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-muted">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-line text-[10px] text-text-secondary font-mono">
                Ctrl
              </kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-line text-[10px] text-text-secondary font-mono">
                Enter
              </kbd>
              <span className="text-muted/70">to submit</span>
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="h-9 px-4 text-xs font-medium text-text-secondary hover:text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-9 inline-flex items-center justify-center gap-2 px-5 text-xs font-semibold bg-gradient-to-r from-accent to-accent-hover hover:brightness-110 active:scale-[0.98] text-white rounded-xl transition-all duration-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{initialData ? 'Update Log' : 'Save Attempt'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
