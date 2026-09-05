import React, { useState } from 'react';
import { createAttempt } from '../api/attempts';

const STATUS_OPTIONS = [
  { value: 'solved', label: 'Solved', color: 'text-emerald-400 border-emerald-800 bg-emerald-950/40' },
  { value: 'struggled', label: 'Struggled', color: 'text-amber-400 border-amber-800 bg-amber-950/40' },
  { value: 'revisit_needed', label: 'Revisit Needed', color: 'text-red-400 border-red-800 bg-red-950/40' },
];

const AttemptForm = ({ isOpen, onClose, onSuccess, problemId, problemTitle }) => {
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
      setApiError('Time taken cannot be negative');
      return;
    }

    setIsSubmitting(true);
    try {
      await createAttempt(problemId, {
        status,
        timeTakenMinutes: timeTakenMinutes !== '' ? Number(timeTakenMinutes) : null,
        notes: notes.trim(),
        attemptedAt: attemptedAt ? new Date(attemptedAt).toISOString() : new Date().toISOString(),
      });

      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to log attempt. Please try again.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6 shadow-xl relative animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Log Practice Attempt</h2>
            {problemTitle && (
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{problemTitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {apiError && (
          <div className="mb-4 p-2.5 rounded bg-red-950/50 border border-red-800 text-xs text-red-300">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Outcome Status *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`py-2 px-2 text-xs font-semibold rounded-md border text-center transition-all ${
                    status === opt.value
                      ? `${opt.color} ring-1 ring-emerald-500`
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Time Taken (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={timeTakenMinutes}
                onChange={(e) => setTimeTakenMinutes(e.target.value)}
                placeholder="e.g. 25"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Attempt Date & Time *
              </label>
              <input
                type="datetime-local"
                value={attemptedAt}
                onChange={(e) => setAttemptedAt(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Notes & Key Learnings
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What approach did you try? Where did you get stuck?"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800 mt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-slate-950 text-xs font-semibold rounded-md transition-colors shadow-sm"
            >
              {isSubmitting ? 'Logging...' : 'Save Attempt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttemptForm;
