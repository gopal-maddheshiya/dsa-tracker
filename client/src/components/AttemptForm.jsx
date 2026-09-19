import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createAttempt, updateAttempt } from '../api/attempts';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorHandler';
import { X } from 'lucide-react';

const STATUS_OPTIONS = [
  {
    value: 'solved',
    label: 'Solved',
    dot: 'bg-easy',
    active: 'border-easy/50 text-easy bg-easy/12',
  },
  {
    value: 'struggled',
    label: 'Struggled',
    dot: 'bg-hard',
    active: 'border-hard/50 text-hard bg-hard/12',
  },
  {
    value: 'revisit_needed',
    label: 'Revisit',
    dot: 'bg-medium',
    active: 'border-medium/50 text-medium bg-medium/12',
  },
];

const AttemptForm = ({
  isOpen,
  onClose,
  onSuccess,
  problemId,
  problemTitle,
  defaultTimeTaken = '',
  initialData = null,
}) => {
  const toast = useToast();
  const isEditing = Boolean(initialData?.id || initialData?._id);
  const [status, setStatus] = useState('solved');
  const [timeTakenMinutes, setTimeTakenMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const [attemptedAt, setAttemptedAt] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setStatus(initialData.status || 'solved');
        setTimeTakenMinutes(initialData.timeTakenMinutes != null ? String(initialData.timeTakenMinutes) : '');
        setNotes(initialData.notes || '');
        if (initialData.attemptedAt) {
          const d = new Date(initialData.attemptedAt);
          setAttemptedAt(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
        }
      } else {
        setStatus('solved');
        setNotes('');
        const now = new Date();
        setAttemptedAt(new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
        if (defaultTimeTaken != null && defaultTimeTaken !== '') {
          setTimeTakenMinutes(String(defaultTimeTaken));
        } else {
          setTimeTakenMinutes('');
        }
      }
      setApiError('');
    }
  }, [isOpen, initialData, defaultTimeTaken]);

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
      const payload = {
        status,
        timeTakenMinutes: timeTakenMinutes !== '' ? Math.round(Number(timeTakenMinutes)) : null,
        notes: notes.trim(),
        attemptedAt: attemptedAt ? new Date(attemptedAt).toISOString() : new Date().toISOString(),
      };

      if (isEditing) {
        const attemptId = initialData.id || initialData._id;
        await updateAttempt(problemId, attemptId, payload);
        toast.success('Attempt updated successfully!');
      } else {
        await createAttempt(problemId, payload);
        toast.success(`Attempt logged as "${STATUS_OPTIONS.find((o) => o.value === status)?.label}".`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      const msg = getErrorMessage(err, isEditing ? 'Failed to update attempt.' : 'Failed to log attempt.');
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="attempt-form-title"
    >
      <div
        className="max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-xl bg-surface border border-line shadow-modal animate-scale-in"
      >
        <div className="flex items-start justify-between pb-4 border-b border-line mb-5">
          <div>
            <h2 id="attempt-form-title" className="text-base font-semibold text-text tracking-tight">
              {isEditing ? 'Edit Practice Attempt' : 'Log Practice Attempt'}
            </h2>
            {problemTitle && (
              <p className="text-xs text-text-secondary mt-0.5 line-clamp-2 leading-snug max-w-sm">{problemTitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
            className="text-muted hover:text-text transition-colors p-1.5 -m-1 rounded-lg hover:bg-surface-2"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {apiError && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-danger/10 border border-danger/25">
            <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1 shrink-0" />
            <p className="text-xs text-danger">{apiError}</p>
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
                  className={`py-2 px-2.5 min-h-[36px] text-xs rounded-lg border flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer ${
                    status === opt.value
                      ? opt.active
                      : 'border-line bg-surface-2 text-text-secondary hover:text-text hover:border-line'
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
                className="input-base text-xs tabular-nums"
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
                className="input-base text-xs"
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

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary text-xs"
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
                  <span className="w-3.5 h-3.5 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                  <span>{isEditing ? 'Updating…' : 'Saving…'}</span>
                </>
              ) : (
                isEditing ? 'Update Attempt' : 'Save Attempt'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

export default AttemptForm;
