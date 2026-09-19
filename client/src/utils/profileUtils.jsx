import React from 'react';
import { Sprout, BookOpen, Zap, Flame, Gem, Crown } from 'lucide-react';
import { colors } from '../theme/colors';

/* ── Shared Profile Utilities ─────────────────────────────────────── */

/**
 * Rank tiers based on total solved count.
 * Used by both DashboardPage and ProfilePage.
 */
export const RANKS = [
  { min: 0,   label: 'Beginner',     iconName: 'Sprout',   Icon: Sprout,   color: colors.muted },
  { min: 5,   label: 'Learner',      iconName: 'BookOpen', Icon: BookOpen, color: colors.easy },
  { min: 25,  label: 'Intermediate', iconName: 'Zap',      Icon: Zap,      color: colors.success },
  { min: 50,  label: 'Advanced',     iconName: 'Flame',    Icon: Flame,    color: colors.medium },
  { min: 100, label: 'Expert',       iconName: 'Gem',      Icon: Gem,      color: colors.accent },
  { min: 250, label: 'Legend',       iconName: 'Crown',    Icon: Crown,    color: colors.hard },
];

/**
 * Get current rank + next rank info for a given solved count.
 * @param {number} solved — total problems solved
 * @returns {{ label, Icon, color, min, next, progress }}
 */
export const getRank = (solved) => {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (solved >= r.min) rank = r;
  }
  const idx = RANKS.indexOf(rank);
  const next = idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
  return { ...rank, next, progress: next ? Math.round((solved / next.min) * 100) : 100 };
};

/**
 * Format a date as "Mon YYYY" (e.g. "Jun 2025").
 */
export const fmtMonthYear = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};
