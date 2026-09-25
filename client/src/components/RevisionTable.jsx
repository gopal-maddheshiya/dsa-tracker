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

import { PLATFORM_CONFIG } from '../theme/platforms';
import { getUrgencyPresentation } from './RevisionMobileCard';

const DIFFICULTY_CONFIG = {
  easy:   { variant: 'easy',   label: 'Easy',   dot: 'bg-easy',   text: 'text-easy',   weight: 1 },
  medium: { variant: 'medium', label: 'Medium', dot: 'bg-medium', text: 'text-medium', weight: 2 },
  hard:   { variant: 'hard',   label: 'Hard',   dot: 'bg-hard',   text: 'text-hard',   weight: 3 },
};

const STATUS_CONFIG = {
  struggled: {
    label: 'Struggled',
    cycle: '2-day target',
    weight: 3,
  },
  revisit_needed: {
    label: 'Revisit Needed',
    cycle: '5-day target',
    weight: 2,
  },
  solved: {
    label: 'Solved',
    cycle: '14-day target',
    weight: 1,
  },
};

const formatDaysAgo = (days) => {
  if (days == null) return 'Never';
  if (days < 0.5) return 'Today';
  const rounded = Math.round(days);
  if (rounded === 1) return 'Yesterday';
  return `${rounded}d ago`;
};

const RevisionTable = ({ queue, isLoading = false, onOpenLog, onQuickLog, startIndex = 0 }) => {
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
    if (!queue || !sortField) return queue || [];
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
    if (isLoading || !tbodyRef.current) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rows = tbodyRef.current.querySelectorAll('tr');
    if (!rows.length) return;

    gsap.fromTo(
      rows,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.02, ease: 'power2.out', clearProps: 'all' }
    );
  }, [sortedQueue, isLoading]);

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

  if (isLoading) {
    return (
      <div className="panel overflow-hidden animate-pulse border-line rounded-xl">
        <div className="flex gap-4 px-6 py-4 bg-surface-2/40 border-b border-line">
          {[36, 200, 130, 90, 80, 100, 100, 90].map((w, i) => (
            <div key={i} className="h-3 shimmer rounded-md" style={{ width: w }} />
          ))}
        </div>
        <div className="divide-y divide-line">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex gap-4 px-6 py-4 items-center">
              <div className="h-3.5 w-8 shimmer rounded-md" />
              <div className="h-3.5 w-52 shimmer rounded-md" />
              <div className="h-3 w-28 shimmer rounded-md" />
              <div className="h-4 w-16 shimmer rounded-md" />
              <div className="h-3 w-12 shimmer rounded-md" />
              <div className="h-3.5 w-24 shimmer rounded-md" />
              <div className="h-3 w-16 shimmer rounded-md" />
              <div className="h-7 w-20 shimmer rounded-md ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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
              <th className="py-3 px-3 whitespace-nowrap">Platform</th>
              <th
                onClick={() => handleSort('urgency')}
                className="py-3 px-3 cursor-pointer select-none hover:text-text transition-colors group whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Urgency</span>
                  {renderSortIndicator('urgency')}
                </div>
              </th>
              <th
                onClick={() => handleSort('lastPracticed')}
                className="py-3 px-3 cursor-pointer select-none hover:text-text transition-colors group whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Last Practiced</span>
                  {renderSortIndicator('lastPracticed')}
                </div>
              </th>
              <th className="text-right py-3 px-4 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody ref={tbodyRef} className="divide-y divide-line">
            {sortedQueue.map((item, idx) => {
              const statusKey = item.latestStatus || item.lastAttemptStatus || 'revisit_needed';
              const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.revisit_needed;
              const diff = DIFFICULTY_CONFIG[item.difficulty] || { variant: 'default', label: item.difficulty, dot: 'bg-muted', text: 'text-muted' };
              const platformCfg = PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.other;
              const urgency = getUrgencyPresentation(item.priorityScore);
              const daysFormatted = formatDaysAgo(item.daysSinceLastAttempt);

              return (
                <tr
                  key={item.problemId || idx}
                  className="hover:bg-surface-2 transition-colors duration-150 group relative"
                >
                  {/* # Index Column with hover accent indicator */}
                  <td className="text-center text-xs tabular-nums text-muted py-3 px-3 whitespace-nowrap relative">
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {String(startIndex + idx + 1).padStart(2, '0')}
                  </td>

                  {/* Problem Title & External Link */}
                  <td className="py-3 px-3">
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

                  {/* Topic Tags */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {item.topics?.length > 0 ? (
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        {item.topics.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[11px] font-mono text-text-secondary/85 hover:text-text transition-colors whitespace-nowrap"
                          >
                            #{t}
                          </span>
                        ))}
                        {item.topics.length > 2 && (
                          <span
                            className="text-[10px] font-mono text-muted whitespace-nowrap cursor-help"
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

                  {/* Difficulty Semantic Dot + Text */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <span className={`w-1.5 h-1.5 rounded-full ${diff.dot || 'bg-muted'}`} />
                      <span className={diff.text || 'text-muted'}>{diff.label}</span>
                    </div>
                  </td>

                  {/* Platform Abbreviation + Dot Indicator */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs font-medium" title={platformCfg.label}>
                      <span className={`w-1.5 h-1.5 rounded-full ${platformCfg.dot}`} />
                      <span className={`font-mono text-[11px] font-semibold ${platformCfg.text}`}>
                        {platformCfg.short}
                      </span>
                    </div>
                  </td>

                  {/* Recall Urgency Semantic Dot + Score Tooltip */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div
                      className="inline-flex items-center gap-1.5 cursor-help"
                      title={urgency.tooltip}
                    >
                      <span className={`w-2 h-2 rounded-full ${urgency.dot}`} />
                      <span className={`text-xs font-semibold ${urgency.text}`}>
                        {urgency.label}
                      </span>
                      <span className="text-[10px] font-mono text-muted tabular-nums ml-0.5">
                        ({item.priorityScore.toFixed(2)})
                      </span>
                    </div>
                  </td>

                  {/* Last Practiced & Schedule */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs text-text font-medium tabular-nums">{daysFormatted}</span>
                      <span className="text-[10px] text-muted">{statusCfg.cycle} · {statusCfg.label}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="text-right py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 text-xs">
                      {/* 1-Tap Quick Mark Solved */}
                      <button
                        type="button"
                        onClick={() => onQuickLog(item, 'solved')}
                        className="h-8 px-2.5 rounded-lg text-success bg-surface-2 hover:bg-success/15 border border-line hover:border-success/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-success"
                        title="Quick 1-Tap: Mark Solved"
                        aria-label={`Mark ${item.title} as solved`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Solved</span>
                      </button>

                      {/* Log recall practice attempt */}
                      <button
                        type="button"
                        onClick={() => onOpenLog(item)}
                        className="h-8 px-2.5 rounded-lg text-success bg-success/12 hover:bg-success/20 border border-success/25 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-success"
                        title="Log recall practice attempt"
                        aria-label={`Log recall attempt for ${item.title}`}
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Log</span>
                      </button>

                      {/* View details */}
                      <Link
                        to={`/problems/${item.problemId}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 text-muted hover:text-text border border-line hover:border-line/80 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                        title="View problem details"
                        aria-label={`View ${item.title} details`}
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
