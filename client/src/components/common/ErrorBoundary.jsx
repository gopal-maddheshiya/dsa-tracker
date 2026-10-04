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

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg text-text flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-surface border border-line rounded-lg p-6 shadow-elevated text-center">
            <div className="w-10 h-10 rounded-md bg-danger/10 border border-danger/20 text-danger flex items-center justify-center mx-auto mb-4 text-lg font-bold">
              !
            </div>
            <h2 className="text-lg font-semibold text-text mb-2">Something went wrong</h2>
            <p className="text-sm text-text-secondary mb-4">
              An unexpected error occurred in the application view.
            </p>
            {this.state.error && (
              <pre className="text-xs bg-bg border border-line-subtle rounded p-3 text-left font-mono text-danger mb-5 overflow-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="px-4 py-2 text-xs font-medium bg-surface-2 hover:bg-surface-hover text-text border border-line rounded-md transition-colors duration-150"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
