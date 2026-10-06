import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Code2 } from 'lucide-react';

/**
 * PublicLayout: Clean, focused shell for public views like /login and /signup.
 */
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header */}
      <header className="max-w-md mx-auto w-full pt-4">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/25 via-accent/15 to-surface-2 border border-accent/35 flex items-center justify-center text-accent shadow-xs group-hover:border-accent/60 group-hover:shadow-[0_0_12px_rgba(237,134,65,0.25)] transition-all duration-150 group-active:scale-95 shrink-0">
            <Code2 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-text leading-tight group-hover:text-text">
              DSA Tracker
            </span>
            <span className="text-[10px] font-mono text-muted leading-none">
              prep workspace
            </span>
          </div>
        </Link>
      </header>

      {/* Main Form Slot */}
      <main className="max-w-md mx-auto w-full my-auto py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Bottom Footer */}
      <footer className="max-w-md mx-auto w-full pb-4 text-center text-xs text-muted font-mono">
        DSA / Interview Prep Tracker
      </footer>
    </div>
  );
}
