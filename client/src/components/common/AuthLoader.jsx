import React from 'react';

/**
 * AuthLoader: Minimal, branded session loader shown during authentication bootstrapping.
 * Avoids layout flashing before token verification completes.
 */
export default function AuthLoader({ message = 'Verifying session...' }) {
  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-surface-2 border border-line flex items-center justify-center text-accent text-sm font-mono font-semibold">
            //
          </div>
          <span className="font-semibold text-sm tracking-tight text-text">
            DSA Tracker
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted mt-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
