import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, CheckCircle2, RotateCw, AlertCircle, Clock, Calendar } from 'lucide-react';
import FormAlert from '../common/FormAlert';

/**
 * AttemptFormModal
 * Modal dialog for logging a practice attempt on a problem.
 * Preserves timezone-safe date generation and clear outcome selection hierarchy.
 */
export default function AttemptFormModal({
  isOpen,
  onClose,
  onSubmit,
  problemTitle = 'Problem',
}) {
  const getTodayDateString = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [formData, setFormData] = useState({
    status: 'solved',
    timeTakenMinutes: '',
    attemptDate: getTodayDateString(),
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const triggerRef = useRef(null);

  // Focus restoration to opening trigger
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    } else if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        status: 'solved',
        timeTakenMinutes: '',
        attemptDate: getTodayDateString(),
        notes: '',
      });
      setError(null);
    }
  }, [isOpen]);

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
    e.preventDefault();
    setError(null);

    const payload = {
      status: formData.status,
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

  const statusOptions = [
    {
      value: 'solved',
      label: 'Solved',
      desc: 'Solved cleanly without blockers',
      icon: CheckCircle2,
      activeColor: 'border-success/80 bg-success/15 text-success ring-1 ring-success/30',
    },
    {
      value: 'revisit_needed',
      label: 'Revisit Needed',
      desc: 'Completed with hints or hesitation',
      icon: RotateCw,
      activeColor: 'border-warning/80 bg-warning/15 text-warning ring-1 ring-warning/30',
    },
    {
      value: 'struggled',
      label: 'Struggled',
      desc: 'Stuck or needed complete solution',
      icon: AlertCircle,
      activeColor: 'border-danger/80 bg-danger/15 text-danger ring-1 ring-danger/30',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col bg-surface border border-line rounded-xl shadow-elevated overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="attempt-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-surface shrink-0">
          <div className="min-w-0 pr-2">
            <h2 id="attempt-modal-title" className="text-sm font-semibold text-text">
              Log Practice Attempt
            </h2>
            <p className="text-xs text-muted mt-0.5 truncate max-w-sm">
              {problemTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-muted hover:text-text rounded-md hover:bg-surface-hover transition-all duration-150 active:scale-95 disabled:opacity-50 focus-visible:ring-1 focus-visible:ring-accent shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body with Scroll */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          <FormAlert message={error} />

          {/* 1. Status Selection Cards */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">
              Practice Outcome <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {statusOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = formData.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: opt.value })}
                    className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all duration-150 active:scale-[0.98] ${
                      isSelected
                        ? opt.activeColor
                        : 'border-line bg-surface-2 hover:bg-surface-hover text-text-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-medium text-xs">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{opt.label}</span>
                    </div>
                    <span className="text-[10px] text-muted mt-1 leading-snug">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Attempt Date & Time Taken Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Attempt Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.attemptDate}
                  onChange={(e) =>
                    setFormData({ ...formData, attemptDate: e.target.value })
                  }
                  className="w-full h-9 pl-8 pr-3 bg-surface-2 text-text text-xs rounded-md border border-line focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors font-mono"
                />
                <Calendar className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
              <p className="text-[10px] text-muted mt-1">
                Customize to backfill earlier practice sessions.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Time Spent (minutes)
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
                        className={`px-1.5 py-0.5 text-[9px] font-mono rounded border transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-accent/15 text-accent border-accent/40 font-semibold shadow-xs'
                            : 'bg-surface-2 text-muted hover:text-text hover:bg-surface-hover border-line'
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
                  className="w-full h-9 pl-8 pr-3 bg-surface-2 text-text text-xs rounded-md border border-line focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors font-mono placeholder:text-muted/60"
                />
                <Clock className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
              <p className="text-[10px] text-muted mt-1">
                Optional: helps track solution speed over time.
              </p>
            </div>
          </div>

          {/* 3. Notes */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Practice Notes & Key Takeaways
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="What approach did you take? What tripped you up? Edge cases to remember next time..."
              className="w-full p-3 bg-surface-2 text-text text-xs rounded-md border border-line focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none placeholder:text-muted/60 leading-relaxed"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-line mt-6 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-9 px-3.5 text-xs font-medium text-text-secondary hover:text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-md transition-all duration-150 active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-9 inline-flex items-center justify-center gap-1.5 px-4 text-xs font-medium bg-accent hover:bg-accent-hover active:scale-[0.99] text-white rounded-md transition-all duration-150 shadow-xs disabled:opacity-60"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Attempt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
