import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import { useDialog } from '../hooks/useDialog';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, problemTitle, isDeleting }) => {
  const dialogRef = useRef(null);
  const cancelBtnRef = useRef(null);

  useDialog({
    isOpen,
    onClose: isDeleting ? () => {} : onClose,
    dialogRef,
    initialFocusRef: cancelBtnRef,
    closeOnEscape: !isDeleting,
  });

  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onMouseDown={(e) => {
        if (!isDeleting && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-desc"
        tabIndex={-1}
        data-lenis-prevent
        className="max-w-sm w-full p-4 sm:p-6 rounded-xl bg-surface border border-line shadow-modal animate-scale-in my-auto max-h-[90dvh] overflow-y-auto outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon + Title */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-danger/10 border border-danger/25 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-danger" />
          </div>
          <div>
            <h3 id="delete-modal-title" className="text-sm font-semibold text-text">
              Delete Problem?
            </h3>
            <p id="delete-modal-desc" className="text-xs text-text-secondary mt-0.5 leading-relaxed line-clamp-3">
              You are about to permanently delete{' '}
              <span className="font-semibold text-text">"{problemTitle}"</span>.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-danger/10 border border-danger/25 text-xs text-danger leading-relaxed mb-5">
          This will also delete all practice history and spaced repetition data. This action cannot be undone.
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="btn-secondary text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-danger hover:opacity-90 text-white transition-opacity disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
          >
            {isDeleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting…</span>
              </>
            ) : (
              'Delete permanently'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

export default DeleteConfirmModal;
