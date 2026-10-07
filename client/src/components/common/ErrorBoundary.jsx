import React from 'react';

/**
 * Reusable Error Boundary for catching and displaying unexpected UI errors
 * without crashing the entire React component tree.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleClearCacheAndReload = async () => {
    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((k) => window.caches.delete(k)));
      }
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((r) => r.unregister()));
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
    } catch (e) {
      console.warn('Failed clearing cache:', e);
    }
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg text-text flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-surface border border-line rounded-xl p-6 shadow-elevated text-center">
            <div className="w-12 h-12 rounded-xl bg-danger/10 border border-danger/25 text-danger flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold text-text mb-1.5">Something went wrong</h2>
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
              An unexpected display error occurred. You can retry, return to home, or clear the cached app files.
            </p>
            {this.state.error && (
              <pre className="text-xs bg-surface-2 border border-line rounded-lg p-3 text-left font-mono text-danger mb-5 overflow-auto max-h-32 select-all">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="w-full sm:w-auto h-9 px-4 text-xs font-semibold bg-accent hover:bg-accent-hover text-white rounded-lg transition-all active:scale-95 shadow-xs"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto h-9 px-3.5 text-xs font-mono font-medium bg-surface-2 hover:bg-surface-hover text-text border border-line rounded-lg transition-all active:scale-95"
              >
                Return to Home
              </button>
              <button
                type="button"
                onClick={this.handleClearCacheAndReload}
                className="w-full sm:w-auto h-9 px-3 text-xs font-mono font-medium text-danger hover:bg-danger/10 border border-danger/20 rounded-lg transition-all active:scale-95"
                title="Clears cached PWA chunks and reloads"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
