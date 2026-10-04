import React from 'react';
import { Outlet, Link } from 'react-router-dom';

/**
 * PublicLayout: Clean, focused shell for public views like /login and /signup.
 */
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between p-6">
      {/* Top Header */}
      <header className="max-w-md mx-auto w-full pt-4">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-md bg-surface-2 border border-line flex items-center justify-center text-accent text-sm font-mono font-semibold transition-colors group-hover:border-accent/40">
            //
          </div>
          <span className="font-semibold text-sm tracking-tight text-text">
            DSA Tracker
          </span>
        </Link>
      </header>

      {/* Main Form Slot */}
      <main className="max-w-md mx-auto w-full my-auto py-8">
        <Outlet />
      </main>

      {/* Bottom Footer */}
      <footer className="max-w-md mx-auto w-full pb-4 text-center text-xs text-muted font-mono">
        DSA / Interview Prep Tracker
      </footer>
    </div>
  );
}
