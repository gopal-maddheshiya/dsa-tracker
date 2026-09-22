import { colors } from './colors';

/**
 * Centralized Platform Visual Design Tokens
 * Single source of truth for DSA platform branding, colors, indicators, and labels.
 */
export const PLATFORM_CONFIG = {
  leetcode: {
    key: 'leetcode',
    label: 'LeetCode',
    short: 'LC',
    color: colors.accent, // #ffa116
    text: 'text-accent',
    dot: 'bg-accent',
    style: 'text-accent bg-accent/10 border-accent/20',
    badge: 'text-accent bg-accent/10 border-accent/20',
    ring: 'border-accent/25',
    glow: 'shadow-[0_0_20px_rgba(255,161,22,0.12)]',
  },
  codeforces: {
    key: 'codeforces',
    label: 'Codeforces',
    short: 'CF',
    color: '#2196F3',
    text: 'text-[#2196F3]',
    dot: 'bg-[#2196F3]',
    style: 'text-[#2196F3] bg-[#2196F3]/10 border-[#2196F3]/20',
    badge: 'text-[#2196F3] bg-[#2196F3]/10 border-[#2196F3]/20',
    ring: 'border-[#2196F3]/25',
    glow: 'shadow-[0_0_20px_rgba(33,150,243,0.12)]',
  },
  gfg: {
    key: 'gfg',
    label: 'GeeksforGeeks',
    short: 'GFG',
    color: colors.easy, // #00b8a3
    text: 'text-easy',
    dot: 'bg-easy',
    style: 'text-easy bg-easy/10 border-easy/20',
    badge: 'text-easy bg-easy/10 border-easy/20',
    ring: 'border-easy/25',
    glow: 'shadow-[0_0_20px_rgba(0,184,163,0.12)]',
  },
  codechef: {
    key: 'codechef',
    label: 'CodeChef',
    short: 'CC',
    color: '#D4A373',
    text: 'text-[#D4A373]',
    dot: 'bg-[#D4A373]',
    style: 'text-[#D4A373] bg-[#8B572A]/15 border-[#8B572A]/30',
    badge: 'text-[#D4A373] bg-[#8B572A]/15 border-[#8B572A]/30',
    ring: 'border-[#8B572A]/30',
    glow: 'shadow-[0_0_20px_rgba(212,163,115,0.12)]',
  },
  hackerrank: {
    key: 'hackerrank',
    label: 'HackerRank',
    short: 'HR',
    color: colors.success, // #2cbb5d
    text: 'text-success',
    dot: 'bg-success',
    style: 'text-success bg-success/10 border-success/20',
    badge: 'text-success bg-success/10 border-success/20',
    ring: 'border-success/25',
    glow: 'shadow-[0_0_20px_rgba(44,187,93,0.12)]',
  },
  atcoder: {
    key: 'atcoder',
    label: 'AtCoder',
    short: 'AC',
    color: colors.medium, // #ffc01e
    text: 'text-medium',
    dot: 'bg-medium',
    style: 'text-medium bg-medium/10 border-medium/20',
    badge: 'text-medium bg-medium/10 border-medium/20',
    ring: 'border-medium/25',
    glow: 'shadow-[0_0_20px_rgba(255,192,30,0.12)]',
  },
  other: {
    key: 'other',
    label: 'External',
    short: 'Ext',
    color: colors.muted, // #9ca3af
    text: 'text-muted',
    dot: 'bg-muted',
    style: 'text-muted bg-surface-2 border-line',
    badge: 'text-muted bg-surface-2 border-line',
    ring: 'border-line',
    glow: '',
  },
};

/**
 * Standard short-label lookup map
 */
export const PLATFORM_LABELS = {
  leetcode: 'LC',
  codeforces: 'CF',
  gfg: 'GFG',
  codechef: 'CC',
  hackerrank: 'HR',
  atcoder: 'AC',
  other: 'Ext',
};

/**
 * Safely get platform configuration with fallback to 'other'
 */
export function getPlatformConfig(platformKey) {
  if (!platformKey) return PLATFORM_CONFIG.other;
  const key = String(platformKey).toLowerCase();
  return PLATFORM_CONFIG[key] || PLATFORM_CONFIG.other;
}

export default PLATFORM_CONFIG;
