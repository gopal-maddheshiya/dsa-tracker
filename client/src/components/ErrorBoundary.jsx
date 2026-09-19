import React from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoDashboard = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-6 select-none font-sans text-text">
          <div className="relative max-w-md w-full p-8 rounded-xl bg-surface border border-line shadow-modal text-center">
            <div className="w-12 h-12 rounded-lg bg-medium/12 border border-medium/25 flex items-center justify-center mx-auto mb-5 text-medium">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h1 className="text-xl font-semibold text-text tracking-tight mb-2">
              Something went wrong
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed mb-6">
              An unexpected application error occurred. You can reload the page or return to the main dashboard.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 rounded-lg bg-surface-2 border border-line text-left overflow-x-auto max-h-24">
                <p className="font-mono text-xs text-danger truncate">
                  {this.state.error?.message || String(this.state.error)}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="btn-secondary flex items-center gap-2 px-4 py-2 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-text-secondary" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoDashboard}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
