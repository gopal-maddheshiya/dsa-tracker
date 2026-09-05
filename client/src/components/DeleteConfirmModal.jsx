import React from 'react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, problemTitle, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-sm w-full p-6 shadow-xl relative animate-in fade-in duration-150">
        <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-800/80 flex items-center justify-center text-red-400 text-lg mb-4">
          ⚠️
        </div>

        <h3 className="text-base font-bold text-white tracking-tight">
          Delete Problem?
        </h3>

        <p className="text-xs text-slate-300 mt-2">
          Are you sure you want to delete <span className="font-semibold text-white">"{problemTitle}"</span>?
        </p>

        <div className="mt-3 p-2.5 rounded bg-red-950/40 border border-red-800/60 text-[11px] text-red-300">
          <strong>Caution:</strong> Deleting this problem will also permanently delete all of its recorded attempt history.
        </div>

        <div className="flex items-center justify-end space-x-3 pt-5 border-t border-slate-800 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white text-xs font-semibold rounded-md transition-colors shadow-sm"
          >
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
