import React from 'react';
import { CheckCircle2, RotateCw, AlertCircle, CircleDashed } from 'lucide-react';

import { PLATFORM_NAMES, formatRelativeDate } from '../../lib/problemUtils';
export { PLATFORM_NAMES, formatRelativeDate };

/**
 * Difficulty Badge component
 * @param {{ difficulty: 'easy' | 'medium' | 'hard', className?: string }} props
 */
export function DifficultyBadge({ difficulty = 'easy', className = '' }) {
  const norm = (difficulty || '').toLowerCase();
  
  const styles = {
    easy: 'text-easy bg-easy/10 border-easy/25',
    medium: 'text-medium bg-medium/10 border-medium/25',
    hard: 'text-hard bg-hard/10 border-hard/25',
  }[norm] || 'text-muted bg-surface-2 border-line';

  const label = norm ? norm.charAt(0).toUpperCase() + norm.slice(1) : 'Unknown';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${styles} ${className}`}
    >
      {label}
    </span>
  );
}

/**
 * Status Badge component based on latest attempt status
 * @param {{ status: 'solved' | 'revisit_needed' | 'struggled' | null, className?: string }} props
 */
export function StatusBadge({ status, className = '' }) {
  if (!status) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-surface-2 text-muted border border-line ${className}`}
      >
        <CircleDashed className="w-3 h-3 text-muted" />
        Not attempted
      </span>
    );
  }

  const norm = status.toLowerCase();

  if (norm === 'solved') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-success/10 text-success border border-success/25 ${className}`}
      >
        <CheckCircle2 className="w-3 h-3" />
        Solved
      </span>
    );
  }

  if (norm === 'revisit_needed') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-warning/10 text-warning border border-warning/25 ${className}`}
      >
        <RotateCw className="w-3 h-3" />
        Revisit needed
      </span>
    );
  }

  if (norm === 'struggled') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-danger/10 text-danger border border-danger/25 ${className}`}
      >
        <AlertCircle className="w-3 h-3" />
        Struggled
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-surface-2 text-text-secondary border border-line ${className}`}
    >
      {status}
    </span>
  );
}

/**
 * Platform Badge component
 * @param {{ platform: string, className?: string }} props
 */
export function PlatformBadge({ platform, className = '' }) {
  const norm = (platform || '').toLowerCase();
  const label = PLATFORM_NAMES[norm] || platform || 'Other';

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono text-text-secondary bg-surface-2 border border-line ${className}`}
    >
      {label}
    </span>
  );
}

