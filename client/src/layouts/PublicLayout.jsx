import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import LogoMark from '../components/common/LogoMark';

/**
 * PublicLayout: Clean, focused shell for public views like /login and /signup.
 */
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header */}
      <header className="max-w-md mx-auto w-full pt-4">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <LogoMark size={32} />
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
