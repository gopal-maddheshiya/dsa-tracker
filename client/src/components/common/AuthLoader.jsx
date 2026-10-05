import React from 'react';
import { Code2 } from 'lucide-react';

/**
 * AuthLoader: Minimal, branded session loader shown during authentication bootstrapping.
 * Avoids layout flashing before token verification completes.
 */
export default function AuthLoader({ message = 'Verifying session...' }) {
  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/25 via-accent/15 to-surface-2 border border-accent/35 flex items-center justify-center text-accent shadow-xs shrink-0">
            <Code2 className="w-4 h-4 stroke-[2.2]" />
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
