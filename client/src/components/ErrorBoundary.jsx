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
        <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6 select-none font-sans text-slate-200">
          <div className="relative max-w-md w-full p-8 rounded-2xl bg-[#11141B] border border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-center">
            {/* Ambient amber glow */}
            <div
              className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-amber-500/15 pointer-events-none"
              style={{ filter: 'blur(50px)' }}
            />

            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h1 className="text-xl font-bold text-white tracking-tight mb-2">
              Something went wrong
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              An unexpected application error occurred. You can reload the page or return to the main dashboard.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 rounded-xl bg-[#090B0E] border border-white/[0.06] text-left overflow-x-auto max-h-24">
                <p className="font-mono text-[11px] text-rose-400 truncate">
                  {this.state.error?.message || String(this.state.error)}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B202B] hover:bg-[#232938] border border-white/[0.1] text-xs font-medium text-slate-200 transition-all active:scale-[0.98]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoDashboard}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#FB923C] hover:to-[#F97316] text-xs font-semibold text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all active:scale-[0.98]"
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
