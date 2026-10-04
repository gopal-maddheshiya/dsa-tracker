import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * DeleteConfirmModal
 * Confirmation dialog for permanently deleting a problem and cascading attempts.
 */
export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  problemTitle = 'this problem',
}) {
  const [loading, setLoading] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-surface border border-line rounded-lg shadow-elevated overflow-hidden"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-danger/10 text-danger border border-danger/25 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h2 id="delete-dialog-title" className="text-sm font-semibold text-text">
                Delete Problem
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-text font-mono">
                  "{problemTitle}"
                </span>
                ?
              </p>
              <div className="p-2.5 rounded bg-surface-2 border border-line text-[11px] text-muted leading-normal mt-2">
                <span className="text-danger font-medium">Permanent Action:</span> All
                logged practice attempts, timestamps, and notes associated with this
                problem will also be permanently deleted.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-line mt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-1.5 text-xs text-text-secondary hover:text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-danger hover:bg-danger/90 text-white rounded-md transition-colors shadow-subtle disabled:opacity-60"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Delete Problem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
