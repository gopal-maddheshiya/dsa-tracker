import React from 'react';
import { CheckCircle2, RotateCw, AlertCircle, CircleDashed } from 'lucide-react';

import { PLATFORM_NAMES, formatRelativeDate } from '../../lib/problemUtils';
export { PLATFORM_NAMES, formatRelativeDate };

/**
 * Difficulty Badge component with semantic indicator dot and harmonious tones
 * @param {{ difficulty: 'easy' | 'medium' | 'hard', className?: string }} props
 */
export function DifficultyBadge({ difficulty = 'easy', className = '' }) {
  const norm = (difficulty || '').toLowerCase();

  const styles = {
    easy: {
      pill: 'text-easy bg-easy/10 border-easy/25 hover:bg-easy/15',
      dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]',
    },
    medium: {
      pill: 'text-medium bg-medium/10 border-medium/25 hover:bg-medium/15',
      dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]',
    },
    hard: {
      pill: 'text-hard bg-hard/10 border-hard/25 hover:bg-hard/15',
      dot: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]',
    },
  }[norm] || {
    pill: 'text-muted bg-surface-2 border-line',
    dot: 'bg-muted',
  };

  const label = norm ? norm.charAt(0).toUpperCase() + norm.slice(1) : 'Unknown';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border transition-colors ${styles.pill} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
      <span>{label}</span>
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
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-surface-2/80 text-muted border border-line ${className}`}
      >
        <CircleDashed className="w-3 h-3 text-muted shrink-0" />
        <span>Unattempted</span>
      </span>
    );
  }

  const norm = status.toLowerCase();

  if (norm === 'solved') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-xs ${className}`}
      >
        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
        <span>Solved</span>
      </span>
    );
  }

  if (norm === 'revisit_needed') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow-xs ${className}`}
      >
        <RotateCw className="w-3 h-3 text-amber-400 shrink-0" />
        <span>Revisit</span>
      </span>
    );
  }

  if (norm === 'struggled') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/25 shadow-xs ${className}`}
      >
        <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
        <span>Struggled</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-surface-2 text-text-secondary border border-line ${className}`}
    >
      <span>{status}</span>
    </span>
  );
}

/**
 * Platform Badge component with platform brand micro-accents
 * @param {{ platform: string, className?: string }} props
 */
export function PlatformBadge({ platform, className = '' }) {
  const norm = (platform || '').toLowerCase();
  const label = PLATFORM_NAMES[norm] || platform || 'Other';

  const brandStyles = {
    leetcode: 'text-amber-400/90 border-amber-500/20 bg-amber-500/5',
    gfg: 'text-emerald-400/90 border-emerald-500/20 bg-emerald-500/5',
    codechef: 'text-orange-400/90 border-orange-500/20 bg-orange-500/5',
    hackerrank: 'text-green-400/90 border-green-500/20 bg-green-500/5',
    other: 'text-text-secondary border-line bg-surface-2',
  }[norm] || 'text-text-secondary border-line bg-surface-2';

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border transition-colors ${brandStyles} ${className}`}
    >
      {label}
    </span>
  );
}
