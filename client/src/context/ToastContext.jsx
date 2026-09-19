import React, { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4500);
  }, [removeToast]);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    showToast: (msg, type = 'info') => addToast(msg, type),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map(({ id, message, type }) => {
          const config =
            type === 'success'
              ? { dot: 'bg-success', border: 'border-success/30', bg: 'bg-surface' }
              : type === 'error'
              ? { dot: 'bg-danger', border: 'border-danger/30', bg: 'bg-surface' }
              : { dot: 'bg-accent', border: 'border-line', bg: 'bg-surface' };

          return (
            <div
              key={id}
              role={type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto bg-surface border ${config.border} rounded-xl p-3.5 shadow-modal flex items-start gap-2.5`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mt-1.5 shrink-0`} />
              <div className="flex-1 text-xs text-text leading-relaxed">
                {message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(id)}
                className="text-muted hover:text-text transition-colors text-xs p-0.5 ml-1 cursor-pointer"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
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
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
