import React from 'react';

/**
 * LogoAssembleLoader: Cinematic Brand Assemble Loading Screen.
 *
 * Smoothly animates the logo drawing itself (stroke assemble)
 * with a subtle ambient glow, replacing raw "Verifying session..." text
 * with a polished, native-app loading experience.
 */
const LogoAssembleLoader = ({ fullScreen = true, message = '' }) => {
  return (
    <div
      role="status"
      aria-label="Loading workspace"
      className={`flex flex-col items-center justify-center select-none ${
        fullScreen
          ? 'fixed inset-0 z-50 bg-bg text-text'
          : 'min-h-[50vh] w-full text-text'
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Soft Ambient Warm Glow */}
        <div
          className="absolute -inset-6 rounded-full bg-accent/10 blur-2xl pointer-events-none animate-pulse"
          style={{ animationDuration: '2.4s' }}
        />

        {/* Emblem Tile */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface border border-line p-3.5 sm:p-4 flex items-center justify-center shadow-2xl shadow-black/60">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible"
            aria-hidden="true"
          >
            {/* Left Bracket < (Smooth stroke assemble) */}
            <path
              d="M9.5 9.5L4.5 16L9.5 22.5"
              stroke="var(--accent)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="logo-draw-left"
            />

            {/* Central Spark ⚡ (Smooth stroke assemble) */}
            <path
              d="M17.5 7.5L12.5 15.5H16.8L14.2 24.5"
              stroke="var(--text)"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="logo-draw-spark"
            />

            {/* Right Bracket > (Smooth stroke assemble) */}
            <path
              d="M22.5 9.5L27.5 16L22.5 22.5"
              stroke="var(--accent)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="logo-draw-right"
            />
          </svg>
        </div>

        {/* Brand Typography */}
        <div className="mt-4 flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-tight text-text">
          <span className="tracking-wide">DSA</span>
          <span className="text-accent">Tracker</span>
        </div>

        {/* Subtle Progress Bar Ribbon */}
        <div className="mt-3 w-20 sm:w-24 h-0.5 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full bg-accent rounded-full animate-loader-bar" />
        </div>

        {message && (
          <span className="mt-2 text-[11px] font-mono text-muted tracking-wide animate-fade-in">
            {message}
          </span>
        )}
      </div>
    </div>
  );
};

export default LogoAssembleLoader;
