import React from 'react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, problemTitle, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-desc"
    >
      <div className="bg-[#0d121f] border border-slate-800/80 rounded-lg max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in duration-150">
        <div className="w-9 h-9 rounded bg-rose-950/40 border border-rose-900/60 flex items-center justify-center text-rose-400 text-sm mb-3 font-mono font-bold">
          !
        </div>

        <h3 id="delete-modal-title" className="text-sm font-semibold text-white tracking-tight font-mono">
          Delete Problem?
        </h3>

        <p id="delete-modal-desc" className="text-xs text-slate-300 mt-2 leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-white">"{problemTitle}"</span>?
        </p>

        <div className="mt-3 p-2.5 rounded bg-rose-950/40 border border-rose-900/60 text-[11px] text-rose-300 leading-relaxed font-mono">
          <strong>Permanent Deletion:</strong> Removing this problem will permanently purge all recorded practice attempts and telemetry history.
        </div>

        <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-800/80 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3 py-1.5 border border-slate-800 bg-slate-900/60 hover:bg-slate-800 disabled:opacity-50 text-slate-300 text-xs font-mono rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors shadow-sm inline-flex items-center space-x-1.5"
          >
            {isDeleting ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Permanently</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
