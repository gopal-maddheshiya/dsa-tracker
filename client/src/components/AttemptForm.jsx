import React, { useState } from 'react';
import { createAttempt } from '../api/attempts';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorHandler';
import { X } from 'lucide-react';

const STATUS_OPTIONS = [
  {
    value: 'solved',
    label: 'Solved',
    dot: 'bg-emerald-400',
    active: 'border-emerald-500/60 text-emerald-400 bg-emerald-500/10 shadow-sm shadow-emerald-500/10',
  },
  {
    value: 'struggled',
    label: 'Struggled',
    dot: 'bg-rose-400',
    active: 'border-rose-500/60 text-rose-400 bg-rose-500/10 shadow-sm shadow-rose-500/10',
  },
  {
    value: 'revisit_needed',
    label: 'Revisit',
    dot: 'bg-amber-400',
    active: 'border-amber-500/60 text-amber-400 bg-amber-500/10 shadow-sm shadow-amber-500/10',
  },
];

const AttemptForm = ({ isOpen, onClose, onSuccess, problemId, problemTitle }) => {
  const toast = useToast();
  const [status, setStatus] = useState('solved');
  const [timeTakenMinutes, setTimeTakenMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const [attemptedAt, setAttemptedAt] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (timeTakenMinutes !== '' && Number(timeTakenMinutes) < 0) {
      setApiError('Time taken cannot be negative.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createAttempt(problemId, {
        status,
        timeTakenMinutes: timeTakenMinutes !== '' ? Math.round(Number(timeTakenMinutes)) : null,
        notes: notes.trim(),
        attemptedAt: attemptedAt ? new Date(attemptedAt).toISOString() : new Date().toISOString(),
      });
      toast.success(`Attempt logged as "${STATUS_OPTIONS.find((o) => o.value === status)?.label}".`);
      onSuccess();
      onClose();
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to log attempt.');
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="attempt-form-title"
    >
      <div
        className="panel max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl bg-[#131519] border border-white/[0.08] animate-scale-in"
      >
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div>
            <h2 id="attempt-form-title" className="text-base font-bold text-[#F3F4F6] tracking-tight">
              Log Practice Attempt
            </h2>
            {problemTitle && (
              <p className="text-xs text-[#9CA3AF] mt-0.5 truncate max-w-xs">{problemTitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
            className="text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors p-1.5 -m-1 rounded-lg hover:bg-white/[0.06]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {apiError && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
            <p className="text-xs text-rose-300">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block section-label mb-2">Outcome Status *</label>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStatus(opt.value)}
                  className={`py-2 px-2.5 text-xs rounded-xl border flex items-center justify-center gap-1.5 font-medium transition-all ${
                    status === opt.value
                      ? opt.active
                      : 'border-white/[0.08] bg-[#0E1015] text-[#9CA3AF] hover:text-[#F3F4F6] hover:border-white/[0.2]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${opt.dot} shrink-0`} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="time-taken" className="block section-label mb-1.5">
                Time Taken (min)
              </label>
              <input
                id="time-taken"
                type="number"
                min="0"
                step="1"
                value={timeTakenMinutes}
                disabled={isSubmitting}
                onChange={(e) => setTimeTakenMinutes(e.target.value)}
                placeholder="e.g. 25"
                className="input-base font-mono text-xs"
              />
            </div>
            <div>
              <label htmlFor="attempt-date" className="block section-label mb-1.5">
                Date & Time *
              </label>
              <input
                id="attempt-date"
                type="datetime-local"
                value={attemptedAt}
                disabled={isSubmitting}
                onChange={(e) => setAttemptedAt(e.target.value)}
                className="input-base font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="attempt-notes" className="block section-label mb-1.5">
              Notes & Key Learnings
            </label>
            <textarea
              id="attempt-notes"
              rows="3"
              value={notes}
              disabled={isSubmitting}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What approach did you try? Key edge cases or bottlenecks?"
              className="input-base resize-none text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-ghost text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                'Save Attempt'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttemptForm;
