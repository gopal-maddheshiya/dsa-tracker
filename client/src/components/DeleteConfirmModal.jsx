import React from 'react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, problemTitle, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-desc"
    >
      <div className="panel max-w-sm w-full p-6 shadow-2xl">
        {/* Icon + Title */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <span className="text-rose-400 text-sm">⚠</span>
          </div>
          <div>
            <h3 id="delete-modal-title" className="text-sm font-semibold text-[#F5F5F4]">
              Delete Problem?
            </h3>
            <p id="delete-modal-desc" className="text-xs text-[#A8A29E] mt-0.5 leading-relaxed">
              You're about to permanently delete{' '}
              <span className="font-medium text-[#F5F5F4]">"{problemTitle}"</span>.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 leading-relaxed mb-5">
          This will also delete all practice sessions and analytics data associated with this problem. This action cannot be undone.
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              'Delete permanently'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
