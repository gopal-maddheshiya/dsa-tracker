import React from 'react';
import { AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, problemTitle, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-desc"
    >
      <div
        className="panel max-w-sm w-full p-6 shadow-2xl border-[#262320] animate-scale-in"
        style={{ background: 'linear-gradient(165deg, #1C1A18, #181614)' }}
      >
        {/* Icon + Title */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 id="delete-modal-title" className="text-sm font-bold text-[#F5F5F4]">
              Delete Problem?
            </h3>
            <p id="delete-modal-desc" className="text-xs text-[#A8A29E] mt-0.5 leading-relaxed">
              You are about to permanently delete{' '}
              <span className="font-semibold text-[#F5F5F4]">"{problemTitle}"</span>.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 leading-relaxed mb-5">
          This will also delete all practice history and spaced repetition data. This action cannot be undone.
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="btn-ghost text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all duration-150 disabled:opacity-50"
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
};

export default DeleteConfirmModal;
