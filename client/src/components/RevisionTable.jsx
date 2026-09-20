import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import Badge from './ui/Badge';
import {
  ExternalLink,
  Plus,
  CheckCircle2,
  Eye,
  Flame,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react';

const DIFFICULTY_CONFIG = {
  easy:   { variant: 'easy',   label: 'Easy',   weight: 1 },
  medium: { variant: 'medium', label: 'Medium', weight: 2 },
  hard:   { variant: 'hard',   label: 'Hard',   weight: 3 },
};

const PLATFORM_CONFIG = {
  leetcode:   { label: 'LeetCode', short: 'LC', style: 'text-accent bg-accent/12 border-accent/25' },
  gfg:        { label: 'GeeksforGeeks', short: 'GFG', style: 'text-easy bg-easy/12 border-easy/25' },
  codechef:   { label: 'CodeChef', short: 'CC', style: 'text-medium bg-medium/12 border-medium/25' },
  hackerrank: { label: 'HackerRank', short: 'HR', style: 'text-success bg-success/12 border-success/25' },
  codeforces: { label: 'Codeforces', short: 'CF', style: 'text-accent bg-accent/12 border-accent/25' },
  atcoder:    { label: 'AtCoder', short: 'AC', style: 'text-medium bg-medium/12 border-medium/25' },
  other:      { label: 'External', short: 'Ext', style: 'text-muted bg-surface-2 border-line' },
};

const STATUS_CONFIG = {
  struggled: {
    label: 'Struggled',
    cycle: '2-day target',
    weight: 3,
  },
  revisit_needed: {
    label: 'Revisit',
    cycle: '5-day target',
    weight: 2,
  },
  solved: {
    label: 'Solved',
    cycle: '14-day target',
    weight: 1,
  },
};

const getUrgencyBadge = (score) => {
  if (score >= 3.0) {
    return {
      label: 'Critical Overdue',
      style: 'bg-danger/12 text-danger border-danger/25',
    };
  }
  if (score >= 2.0) {
    return {
      label: 'High Urgency',
      style: 'bg-medium/12 text-medium border-medium/25',
    };
  }
  return {
    label: 'Recall Due',
    style: 'bg-success/12 text-success border-success/25',
  };
};

const formatDaysAgo = (days) => {
  if (days == null) return 'Never';
  if (days < 0.5) return 'Today';
  const rounded = Math.round(days);
  if (rounded === 1) return 'Yesterday';
  return `${rounded}d ago`;
};

const RevisionTable = ({ queue, onOpenLog, onQuickLog, startIndex = 0 }) => {
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const tbodyRef = useRef(null);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedQueue = useMemo(() => {
    if (!queue || !sortField) return queue;
    return [...queue].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'title') {
        valA = (a.title || '').toLowerCase();
        valB = (b.title || '').toLowerCase();
      } else if (sortField === 'difficulty') {
        valA = DIFFICULTY_CONFIG[a.difficulty]?.weight || 0;
        valB = DIFFICULTY_CONFIG[b.difficulty]?.weight || 0;
      } else if (sortField === 'urgency') {
        valA = a.priorityScore || 0;
        valB = b.priorityScore || 0;
      } else if (sortField === 'lastPracticed') {
        valA = a.daysSinceLastAttempt ?? 999;
        valB = b.daysSinceLastAttempt ?? 999;
      } else if (sortField === 'score') {
        valA = a.priorityScore || 0;
        valB = b.priorityScore || 0;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [queue, sortField, sortAsc]);

  useEffect(() => {
    if (!tbodyRef.current) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rows = tbodyRef.current.querySelectorAll('tr');
    if (!rows.length) return;

    gsap.fromTo(
      rows,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.02, ease: 'power2.out', clearProps: 'all' }
    );
  }, [sortedQueue]);

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-muted opacity-0 group-hover:opacity-70 transition-opacity" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3 h-3 text-accent" />
    ) : (
      <ArrowDown className="w-3 h-3 text-accent" />
    );
  };

  return (
    <div className="panel overflow-hidden border-line rounded-xl bg-surface">
      <div className="overflow-x-auto">
        <table className="data-table min-w-[850px] w-full text-left">
          <thead>
            <tr className="border-b border-line bg-surface-2/40 text-muted text-xs tracking-wider">
              <th className="w-12 text-center py-3.5 px-3 whitespace-nowrap">#</th>
              <th
                onClick={() => handleSort('title')}
                className="py-3.5 px-3 cursor-pointer select-none hover:text-text transition-colors group whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Problem</span>
                  {renderSortIndicator('title')}
                </div>
              </th>
              <th className="py-3.5 px-3 whitespace-nowrap">Topics</th>
              <th
                onClick={() => handleSort('difficulty')}
                className="py-3.5 px-3 cursor-pointer select-none hover:text-text transition-colors group whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Difficulty</span>
                  {renderSortIndicator('difficulty')}
                </div>
              </th>
              <th className="py-3.5 px-3 whitespace-nowrap">Platform</th>
              <th
                onClick={() => handleSort('urgency')}
                className="py-3.5 px-3 cursor-pointer select-none hover:text-text transition-colors group whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Recall Urgency</span>
                  {renderSortIndicator('urgency')}
                </div>
              </th>
              <th
                onClick={() => handleSort('lastPracticed')}
                className="py-3.5 px-3 cursor-pointer select-none hover:text-text transition-colors group whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Last Practiced</span>
                  {renderSortIndicator('lastPracticed')}
                </div>
              </th>
              <th
                onClick={() => handleSort('score')}
                className="text-center py-3.5 px-3 cursor-pointer select-none hover:text-text transition-colors group whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Score</span>
                  {renderSortIndicator('score')}
                </div>
              </th>
              <th className="text-right py-3.5 px-4 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody ref={tbodyRef} className="divide-y divide-line">
            {sortedQueue.map((item, idx) => {
              const statusKey = item.latestStatus || item.lastAttemptStatus || 'revisit_needed';
              const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.revisit_needed;
              const diff = DIFFICULTY_CONFIG[item.difficulty] || { variant: 'default', label: item.difficulty };
              const platformCfg = PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.other;
              const urgency = getUrgencyBadge(item.priorityScore);
              const daysFormatted = formatDaysAgo(item.daysSinceLastAttempt);

              return (
                <tr
                  key={item.problemId || idx}
                  className="hover:bg-surface-2 transition-colors duration-150 group relative"
                >
                  {/* # Index Column with hover accent indicator */}
                  <td className="text-center text-xs tabular-nums text-muted py-3.5 px-3 whitespace-nowrap relative">
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {String(startIndex + idx + 1).padStart(2, '0')}
                  </td>

                  {/* Problem Title & External Link */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2 max-w-xs lg:max-w-sm">
                      <Link
                        to={`/problems/${item.problemId}`}
                        className="font-semibold text-text group-hover:text-accent transition-colors line-clamp-1 text-sm tracking-tight leading-snug"
                        title={item.title}
                      >
                        {item.title}
                      </Link>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          title="Open original problem in new tab"
                          className="text-muted hover:text-accent transition-colors shrink-0 p-1 -m-1 rounded hover:bg-surface-2"
                        >
                          <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Topic Pills */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {item.topics?.length > 0 ? (
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        {item.topics.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-xs font-mono px-2 py-0.5 rounded-md bg-surface-2 border border-line text-text-secondary group-hover:border-line transition-colors whitespace-nowrap"
                          >
                            {t}
                          </span>
                        ))}
                        {item.topics.length > 2 && (
                          <span
                            className="text-xs font-mono px-1.5 py-0.5 rounded-md bg-surface-2 border border-line text-muted whitespace-nowrap"
                            title={item.topics.slice(2).join(', ')}
                          >
                            +{item.topics.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>

                  {/* Difficulty Badge */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <Badge variant={diff.variant} size="sm">
                      {diff.label}
                    </Badge>
                  </td>

                  {/* Platform Pill */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center text-xs font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${platformCfg.style}`}
                      title={platformCfg.label}
                    >
                      <span>{platformCfg.short}</span>
                    </span>
                  </td>

                  {/* Recall Urgency Pill */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center justify-center text-xs font-medium px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${urgency.style}`}>
                      <span className="whitespace-nowrap">{urgency.label}</span>
                    </span>
                  </td>

                  {/* Last Practiced & Schedule */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="text-xs text-text font-medium block tabular-nums">
                      {daysFormatted}
                    </span>
                    <span className="text-[11px] text-muted block">
                      {statusCfg.cycle}
                    </span>
                  </td>

                  {/* Priority Score */}
                  <td className="text-center py-3.5 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 tabular-nums">
                      <Flame className="w-3 h-3 text-accent" />
                      <span>{item.priorityScore.toFixed(2)}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="text-right py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 text-xs">
                      {/* 1-Tap Quick Mark Solved */}
                      <button
                        type="button"
                        onClick={() => onQuickLog(item, 'solved')}
                        className="h-7.5 px-2.5 rounded-lg text-success bg-surface-2 hover:bg-success/15 border border-line hover:border-success/30 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                        title="Quick 1-Tap: Mark Solved"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Pass</span>
                      </button>

                      {/* Log recall practice attempt */}
                      <button
                        type="button"
                        onClick={() => onOpenLog(item)}
                        className="h-7.5 px-2.5 rounded-lg text-success bg-success/12 hover:bg-success/20 border border-success/25 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                        title="Log recall practice attempt"
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                        <span>Log</span>
                      </button>

                      {/* View details */}
                      <Link
                        to={`/problems/${item.problemId}`}
                        className="w-7.5 h-7.5 flex items-center justify-center rounded-lg bg-surface-2 text-muted hover:text-text border border-line hover:border-line/80 transition-all shrink-0"
                        title="View problem details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevisionTable;
