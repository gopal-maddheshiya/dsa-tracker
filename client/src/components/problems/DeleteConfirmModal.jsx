import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * DeleteConfirmModal
 * Destructive confirmation dialog for permanently deleting a problem and cascading attempts.
 */
export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  problemTitle = 'this problem',
}) {
  const [loading, setLoading] = useState(false);
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

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-surface border border-line rounded-xl shadow-elevated overflow-hidden"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-danger/10 text-danger border border-danger/25 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 min-w-0 flex-1">
              <h2 id="delete-dialog-title" className="text-sm font-semibold text-text">
                Delete Problem?
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="font-semibold text-text font-mono break-all">
                  "{problemTitle}"
                </span>
                ?
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-2/60 border border-line text-[11px] text-muted leading-relaxed">
            <span className="text-danger font-medium">Permanent Action:</span> Deleting this problem also removes its entire practice history, including logged attempt timestamps, solution times, and revision notes.
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-9 px-3.5 text-xs font-medium text-text-secondary hover:text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-md transition-all duration-150 active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="h-9 inline-flex items-center justify-center gap-1.5 px-4 text-xs font-medium bg-danger hover:bg-danger/90 active:scale-95 text-white rounded-md transition-all duration-150 shadow-xs disabled:opacity-60"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Delete Problem</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
