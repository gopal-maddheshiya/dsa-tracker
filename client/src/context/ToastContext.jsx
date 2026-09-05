import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map(({ id, message, type }) => {
          let badgeColor = 'bg-sky-500';
          let borderColor = 'border-slate-700';

          if (type === 'success') {
            badgeColor = 'bg-emerald-500';
            borderColor = 'border-emerald-600/60';
          } else if (type === 'error') {
            badgeColor = 'bg-rose-500';
            borderColor = 'border-rose-600/60';
          }

          return (
            <div
              key={id}
              role={type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto bg-slate-900/95 border ${borderColor} rounded-lg p-3.5 shadow-2xl flex items-start space-x-3 backdrop-blur-sm transition-all duration-200 animate-in fade-in slide-in-from-bottom-2`}
            >
              <span className={`w-2 h-2 rounded-full ${badgeColor} mt-1.5 shrink-0`} />
              <div className="flex-1 text-xs text-slate-200 leading-relaxed font-medium">
                {message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(id)}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors text-xs ml-2"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
