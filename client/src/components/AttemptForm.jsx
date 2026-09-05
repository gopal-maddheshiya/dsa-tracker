import React, { useState } from 'react';
import { createAttempt } from '../api/attempts';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorHandler';

const STATUS_OPTIONS = [
  { value: 'solved', label: 'Solved', color: 'text-emerald-400 border-emerald-800 bg-emerald-950/40' },
  { value: 'struggled', label: 'Struggled', color: 'text-rose-400 border-rose-800 bg-rose-950/40' },
  { value: 'revisit_needed', label: 'Revisit Needed', color: 'text-amber-400 border-amber-800 bg-amber-950/40' },
];

const AttemptForm = ({ isOpen, onClose, onSuccess, problemId, problemTitle }) => {
  const toast = useToast();
  const [status, setStatus] = useState('solved');
  const [timeTakenMinutes, setTimeTakenMinutes] = useState('');
  const [notes, setNotes] = useState('');

  // Format current date-time for datetime-local input
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

      toast.success(`Practice attempt logged as "${status.replace('_', ' ')}".`);
      onSuccess();
      onClose();
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to log attempt. Please try again.');
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="attempt-form-title"
    >
      <div className="bg-[#0d121f] border border-slate-800/80 rounded-lg max-w-md w-full p-6 shadow-2xl relative animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div>
            <h2 id="attempt-form-title" className="text-sm font-semibold text-white tracking-tight font-mono">
              Log Practice Attempt
            </h2>
            {problemTitle && (
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{problemTitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors text-sm"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {apiError && (
          <div className="mb-4 p-3 rounded bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 font-mono">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-slate-300 mb-1.5">
              Outcome Status *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStatus(opt.value)}
                  className={`py-1.5 px-2 text-xs font-mono rounded border text-center transition-all ${
                    status === opt.value
                      ? `${opt.color} ring-1 ring-emerald-500`
                      : 'border-slate-800/80 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="time-taken" className="block text-[11px] font-mono text-slate-300 mb-1">
                Time Taken (minutes)
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
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800/80 rounded text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors font-mono"
              />
            </div>

            <div>
              <label htmlFor="attempt-date" className="block text-[11px] font-mono text-slate-300 mb-1">
                Attempt Date & Time *
              </label>
              <input
                id="attempt-date"
                type="datetime-local"
                value={attemptedAt}
                disabled={isSubmitting}
                onChange={(e) => setAttemptedAt(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800/80 rounded text-xs text-slate-100 focus:outline-none focus:border-slate-600 transition-colors font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor="attempt-notes" className="block text-[11px] font-mono text-slate-300 mb-1">
              Notes & Key Learnings
            </label>
            <textarea
              id="attempt-notes"
              rows="3"
              value={notes}
              disabled={isSubmitting}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What approach did you try? Where did you get stuck?"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800/80 rounded text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end space-x-2.5 pt-3.5 border-t border-slate-800/80 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 border border-slate-800 bg-slate-900/60 hover:bg-slate-800 disabled:opacity-50 text-slate-300 text-xs font-mono rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 text-xs font-semibold rounded transition-colors shadow-sm inline-flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Attempt</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttemptForm;
