import React from 'react';
import { Link } from 'react-router-dom';

/**
 * NotFoundPage: Clean 404 response for unmatched client routes.
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-surface border border-line rounded-lg p-8 shadow-elevated">
        <div className="w-12 h-12 rounded-md bg-surface-2 border border-line text-muted flex items-center justify-center mx-auto mb-4 text-base font-mono font-bold">
          404
        </div>
        <h1 className="text-lg font-semibold text-text tracking-tight mb-2">
          Page Not Found
        </h1>
        <p className="text-xs text-text-secondary mb-6">
          The requested route does not exist or has been relocated.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-4 py-2 text-xs font-medium rounded-md bg-surface-2 hover:bg-surface-hover text-text border border-line transition-colors"
        >
          ← Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
