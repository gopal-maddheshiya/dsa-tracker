import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  FolderOpen,
  ExternalLink,
  Eye,
  Edit2,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Globe,
} from 'lucide-react';

import { PLATFORM_CONFIG } from '../theme/platforms';

const DIFFICULTY_CONFIG = {
  easy:   { variant: 'easy',   label: 'Easy',   dot: 'bg-easy',   text: 'text-easy',   weight: 1 },
  medium: { variant: 'medium', label: 'Medium', dot: 'bg-medium', text: 'text-medium', weight: 2 },
  hard:   { variant: 'hard',   label: 'Hard',   dot: 'bg-hard',   text: 'text-hard',   weight: 3 },
};

const STATUS_CONFIG = {
  solved: {
    label: 'Solved',
    text: 'text-success',
    bg: 'bg-success/12 border-success/25',
    dot: 'bg-success',
  },
  struggled: {
    label: 'Struggled',
    text: 'text-danger',
    bg: 'bg-danger/12 border-danger/25',
    dot: 'bg-danger',
  },
  revisit_needed: {
    label: 'Revisit Needed',
    text: 'text-medium',
    bg: 'bg-medium/12 border-medium/25',
    dot: 'bg-medium',
  },
};

const ProblemTable = ({ problems, isLoading, error, onEdit, onDelete, onOpenAdd, onLog, startIndex = 0 }) => {
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

  const sortedProblems = useMemo(() => {
    if (!problems || !sortField) return problems;
    return [...problems].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'difficulty') {
        valA = DIFFICULTY_CONFIG[a.difficulty]?.weight || 0;
        valB = DIFFICULTY_CONFIG[b.difficulty]?.weight || 0;
      } else if (sortField === 'sessions') {
        valA = a.attemptCount || 0;
        valB = b.attemptCount || 0;
      } else if (sortField === 'title') {
        valA = (a.title || '').toLowerCase();
        valB = (b.title || '').toLowerCase();
      } else if (sortField === 'status') {
        valA = a.latestAttempt?.status || '';
        valB = b.latestAttempt?.status || '';
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [problems, sortField, sortAsc]);

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
  }, [sortedProblems]);

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
          {[40, 220, 140, 90, 80, 90, 60, 100].map((w, i) => (
            <div key={i} className="h-3 shimmer rounded-md" style={{ width: w }} />
          ))}
        </div>
        <div className="divide-y divide-line">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex gap-4 px-6 py-4 items-center">
              <div className="h-3.5 w-8 shimmer rounded-md" />
              <div className="h-3.5 w-56 shimmer rounded-md" />
              <div className="h-3 w-32 shimmer rounded-md" />
              <div className="h-4 w-16 shimmer rounded-md" />
              <div className="h-3 w-12 shimmer rounded-md" />
              <div className="h-3 w-20 shimmer rounded-md" />
              <div className="h-3 w-10 shimmer rounded-md mx-auto" />
              <div className="h-4 w-20 shimmer rounded-md ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-8 text-center border-danger/25 rounded-xl bg-danger/5">
        <p className="text-sm font-semibold text-danger">Unable to load problems</p>
        <p className="text-xs text-muted mt-1">{error}</p>
      </div>
    );
  }

  if (!problems || problems.length === 0) {
    return (
      <div className="panel border-dashed p-14 text-center border-line bg-surface rounded-xl">
        <div className="w-12 h-12 rounded-xl bg-surface-2 border border-line flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-6 h-6 text-muted" />
        </div>
        <h3 className="text-base font-semibold text-text tracking-tight">No problems found</h3>
        <p className="text-xs text-muted mt-1 max-w-xs mx-auto leading-relaxed">
          No problems match your search or filters. Catalog your first problem to get started.
        </p>
        <div className="flex items-center justify-center gap-3 mt-5">
          <button onClick={onOpenAdd} type="button" className="btn-primary text-xs">
            + Add First Problem
          </button>
          <Link to="/profile?tab=platforms" className="btn-secondary text-xs flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-accent" />
            <span>Sync from Platforms</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden border-line rounded-xl bg-surface">
      <div className="overflow-x-auto">
        <table className="data-table min-w-[760px] w-full text-left">
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
                onClick={() => handleSort('status')}
                className="py-3.5 px-3 cursor-pointer select-none hover:text-text transition-colors group whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {renderSortIndicator('status')}
                </div>
              </th>
              <th
                onClick={() => handleSort('sessions')}
                className="text-center py-3.5 px-3 cursor-pointer select-none hover:text-text transition-colors group whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Sessions</span>
                  {renderSortIndicator('sessions')}
                </div>
              </th>
              <th className="text-right py-3.5 px-4 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody ref={tbodyRef} className="divide-y divide-line">
            {sortedProblems.map((problem, idx) => {
              const diff = DIFFICULTY_CONFIG[problem.difficulty] || { variant: 'default', label: problem.difficulty };
              const latestStatus = problem.latestAttempt?.status;
              const statusCfg = latestStatus ? STATUS_CONFIG[latestStatus] : null;
              const platformCfg = PLATFORM_CONFIG[problem.platform] || PLATFORM_CONFIG.other;

              return (
                <tr
                  key={problem.id || problem._id || idx}
                  className="hover:bg-surface-2 transition-colors duration-150 group relative"
                >
                  {/* # Index Column with subtle hover accent */}
                  <td className="text-center text-xs tabular-nums text-muted py-3.5 px-3 whitespace-nowrap relative">
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {String(startIndex + idx + 1).padStart(2, '0')}
                  </td>

                  {/* Problem Title & External Link */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2 max-w-md lg:max-w-xl">
                      <Link
                        to={`/problems/${problem.id || problem._id}`}
                        className="font-semibold text-text group-hover:text-accent transition-colors line-clamp-1 text-sm tracking-tight leading-snug"
                        title={problem.title}
                      >
                        {problem.title}
                      </Link>
                      {problem.link && (
                        <a
                          href={problem.link}
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

                  {/* Topic Inline Monospace Tags */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {problem.topics?.length > 0 ? (
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        {problem.topics.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[11px] font-mono text-text-secondary/85 hover:text-text transition-colors whitespace-nowrap"
                          >
                            #{t}
                          </span>
                        ))}
                        {problem.topics.length > 2 && (
                          <span
                            className="text-[10px] font-mono text-muted whitespace-nowrap cursor-help"
                            title={problem.topics.slice(2).join(', ')}
                          >
                            +{problem.topics.length - 2}
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

                  {/* Brand Platform Quiet Text + Indicator */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs font-medium" title={platformCfg.label}>
                      <span className={`w-1.5 h-1.5 rounded-full ${platformCfg.dot}`} />
                      <span className={`font-mono text-[11px] font-semibold ${platformCfg.text}`}>
                        {platformCfg.short}
                      </span>
                    </div>
                  </td>

                  {/* Status Semantic Dot + Text */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {statusCfg ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        <span className={statusCfg.text}>{statusCfg.label}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted/40" />
                        <span>Unattempted</span>
                      </div>
                    )}
                  </td>

                  {/* Session Count */}
                  <td className="text-center py-3 px-3 whitespace-nowrap">
                    <span className="inline-block text-xs font-medium tabular-nums text-muted px-2 py-0.5 rounded bg-surface-2/60 border border-line/60 whitespace-nowrap">
                      {problem.attemptCount || 0}
                    </span>
                  </td>

                  {/* Icon Actions */}
                  <td className="text-right py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 text-xs">
                      {/* 1-Click Quick Log Attempt */}
                      {onLog && (
                        <button
                          type="button"
                          onClick={() => onLog(problem)}
                          title={`Log attempt for "${problem.title}"`}
                          aria-label={`Log attempt for "${problem.title}"`}
                          className="h-8 px-2.5 rounded-lg text-success bg-success/12 hover:bg-success/20 border border-success/25 transition-all text-xs font-semibold flex items-center gap-1 shrink-0 active:scale-95 mr-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-success"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Log</span>
                        </button>
                      )}

                      {/* View Action */}
                      <Link
                        to={`/problems/${problem.id || problem._id}`}
                        title="View problem details"
                        aria-label={`View ${problem.title}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-surface-2 border border-line bg-surface transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      {/* Edit Action */}
                      <button
                        type="button"
                        onClick={() => onEdit(problem)}
                        title="Edit problem details"
                        aria-label={`Edit ${problem.title}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-accent hover:bg-accent/12 border border-line bg-surface hover:border-accent/25 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={() => onDelete(problem)}
                        title="Delete problem"
                        aria-label={`Delete ${problem.title}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/12 border border-line bg-surface hover:border-danger/25 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-danger"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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

export default ProblemTable;
