import React, { createContext, useContext, useState, useCallback } from 'react';

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
              ? { dot: 'bg-[#F97316]', border: 'border-[#F97316]/30', bg: 'bg-[#F97316]/10' }
              : type === 'error'
              ? { dot: 'bg-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' }
              : { dot: 'bg-[#A8A29E]', border: 'border-[#2E2A27]', bg: 'bg-[#141312]' };

          return (
            <div
              key={id}
              role={type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto bg-[#1C1A18] border ${config.border} ${config.bg} rounded-xl p-3.5 shadow-2xl shadow-black/80 flex items-start gap-2.5 backdrop-blur-md`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mt-1.5 shrink-0`} />
              <div className="flex-1 text-xs text-[#F5F5F4] leading-relaxed">
                {message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(id)}
                className="text-[#78716C] hover:text-[#F5F5F4] transition-colors text-xs p-0.5 ml-1"
                aria-label="Dismiss"
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
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
