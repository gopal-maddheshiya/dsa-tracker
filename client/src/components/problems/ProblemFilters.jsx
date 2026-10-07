import React, { useState, useEffect } from 'react';
import { Search, X, Tag, RotateCcw, ChevronDown, Download, SlidersHorizontal, Check } from 'lucide-react';

/**
 * ProblemFilters
 * Premium glassmorphic filter card container.
 * - Row 1: Status Segmented Control (uniform h-8, whitespace-nowrap) + Instant Search
 * - Row 2: Difficulty Segmented Control + Dedicated Topic Chips Carousel + Export CSV
 * - Row 3: Active Filters Summary HUD with 1-click remove chips and clear all CTA
 */
export default function ProblemFilters({
  search,
  onSearchChange,
  difficulty,
  onDifficultyChange,
  topic,
  onTopicChange,
  status,
  onStatusChange,
  availableTopics = [],
  totalCount = 0,
  filteredCount = 0,
  onClearFilters,
  onExportCsv,
}) {
  const [searchInput, setSearchInput] = useState(search);

  // Synchronize internal input state if parent changes search
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounce search input by 250ms for responsive feel
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== search) {
        onSearchChange(searchInput);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [searchInput, search, onSearchChange]);

  const hasActiveFilters = Boolean(
    search.trim() || difficulty || topic || status
  );

  const statusOptions = [
    { id: 'all', label: 'All', value: '', active: !status },
    {
      id: 'solved',
      label: 'Solved',
      value: 'solved',
      active: status === 'solved',
      activeClass: 'bg-emerald-500 text-white shadow-xs',
      colorDot: 'bg-emerald-400',
    },
    {
      id: 'revisit',
      label: 'Revisit',
      value: 'revisit_needed',
      active: status === 'revisit_needed',
      activeClass: 'bg-amber-500 text-white shadow-xs',
      colorDot: 'bg-amber-400',
    },
    {
      id: 'struggled',
      label: 'Struggled',
      value: 'struggled',
      active: status === 'struggled',
      activeClass: 'bg-rose-500 text-white shadow-xs',
      colorDot: 'bg-rose-400',
    },
    {
      id: 'unattempted',
      label: 'Unattempted',
      value: 'not_attempted',
      active: status === 'not_attempted',
      activeClass: 'bg-purple-600 text-white shadow-xs',
      colorDot: 'bg-purple-400',
    },
  ];

  const difficultyOptions = [
    { label: 'All', value: '' },
    { label: 'Easy', value: 'easy', dot: 'bg-emerald-400' },
    { label: 'Medium', value: 'medium', dot: 'bg-amber-400' },
    { label: 'Hard', value: 'hard', dot: 'bg-rose-400' },
  ];

  return (
    <div className="p-3 sm:p-4 rounded-xl bg-surface border border-line shadow-xs space-y-3">
      {/* Row 1: Status Tabs + Search Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Status Segmented Control (strictly uniform h-8, whitespace-nowrap, shrink-0) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {statusOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onStatusChange(opt.active && opt.value !== '' ? '' : opt.value)}
              className={`whitespace-nowrap shrink-0 h-8 px-3 rounded-lg text-xs font-mono font-medium transition-all duration-150 active:scale-95 inline-flex items-center gap-1.5 ${
                opt.active
                  ? opt.activeClass || 'bg-accent text-white shadow-xs'
                  : 'bg-surface-2 text-text-secondary hover:text-text hover:bg-surface-hover border border-line'
              }`}
            >
              {opt.colorDot && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    opt.active ? 'bg-white' : opt.colorDot
                  }`}
                />
              )}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Live Search Input with icon and clear button */}
        <div className="relative flex-1 sm:min-w-[220px] md:max-w-xs">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search problems by title, topic..."
            className="w-full h-8 bg-surface-2 border border-line rounded-lg pl-8 pr-7 text-xs text-text placeholder-muted/70 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-xs"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                onSearchChange('');
              }}
              title="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted hover:text-text rounded transition-all active:scale-90"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Difficulty Filter Pills & Topic Chips Carousel & CSV Export */}
      <div className="pt-2 border-t border-line/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left Side: Difficulty pills + Topic Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-1">
          {/* Difficulty Group */}
          <div className="inline-flex items-center gap-1 bg-surface-2/60 p-0.5 rounded-lg border border-line shrink-0">
            <span className="text-[10px] font-mono text-muted uppercase px-1.5 hidden lg:inline">
              Diff:
            </span>
            {difficultyOptions.map((d) => {
              const isSelected = difficulty === d.value;
              return (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => onDifficultyChange(isSelected && d.value !== '' ? '' : d.value)}
                  className={`h-6 px-2 rounded-md text-[11px] font-mono whitespace-nowrap transition-all duration-150 active:scale-95 inline-flex items-center gap-1 ${
                    isSelected
                      ? 'bg-surface text-accent font-semibold shadow-xs border border-accent/30'
                      : 'text-text-secondary hover:text-text hover:bg-surface-2'
                  }`}
                >
                  {d.dot && <span className={`w-1.5 h-1.5 rounded-full ${d.dot}`} />}
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>

          {/* Topic Pills Divider */}
          {availableTopics.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-mono uppercase text-muted tracking-wider shrink-0 flex items-center gap-1">
                <Tag className="w-3 h-3 text-muted" /> Topics:
              </span>
              <button
                type="button"
                onClick={() => onTopicChange('')}
                className={`whitespace-nowrap shrink-0 h-6 px-2.5 rounded-full text-[11px] font-mono transition-all active:scale-95 inline-flex items-center gap-1 ${
                  !topic
                    ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                    : 'bg-surface-2/70 text-text-secondary hover:text-text hover:bg-surface-2 border border-line'
                }`}
              >
                All Topics
              </button>
              {availableTopics.map((t) => {
                const isSelected = topic === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onTopicChange(isSelected ? '' : t)}
                    className={`whitespace-nowrap shrink-0 h-6 px-2.5 rounded-full text-[11px] font-mono transition-all active:scale-95 inline-flex items-center gap-1 ${
                      isSelected
                        ? 'bg-accent text-white font-semibold shadow-xs'
                        : 'bg-surface-2/70 text-text-secondary hover:text-text hover:bg-surface-2 border border-line'
                    }`}
                  >
                    <span>{t}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Export to CSV */}
        {onExportCsv && (
          <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onExportCsv}
              className="h-7 inline-flex items-center gap-1.5 px-2.5 text-[11px] font-mono text-text-secondary hover:text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-lg transition-all duration-150 active:scale-95 shadow-xs"
              title="Export filtered problems to CSV"
            >
              <Download className="w-3 h-3 text-muted" />
              <span>Export CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* Row 3: Active Filters Summary & Count HUD */}
      <div className="pt-2 border-t border-line/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-muted">
            Showing <span className="font-semibold text-text">{filteredCount}</span> of {totalCount} problems
            {hasActiveFilters && ' (filtered)'}
          </span>

          {hasActiveFilters && (
            <>
              {search.trim() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-2 border border-line text-[11px] font-mono text-text">
                  <span className="text-muted">Query:</span>
                  <span className="font-semibold">"{search.trim()}"</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      onSearchChange('');
                    }}
                    className="text-muted hover:text-rose-400 ml-0.5 p-0.5"
                    aria-label="Remove search filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {difficulty && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-2 border border-line text-[11px] font-mono text-text">
                  <span className="text-muted">Difficulty:</span>
                  <span className="font-semibold capitalize text-accent">{difficulty}</span>
                  <button
                    type="button"
                    onClick={() => onDifficultyChange('')}
                    className="text-muted hover:text-rose-400 ml-0.5 p-0.5"
                    aria-label="Remove difficulty filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {topic && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-2 border border-line text-[11px] font-mono text-text">
                  <span className="text-muted">Topic:</span>
                  <span className="font-semibold text-accent">{topic}</span>
                  <button
                    type="button"
                    onClick={() => onTopicChange('')}
                    className="text-muted hover:text-rose-400 ml-0.5 p-0.5"
                    aria-label="Remove topic filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {status && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-2 border border-line text-[11px] font-mono text-text">
                  <span className="text-muted">Status:</span>
                  <span className="font-semibold capitalize">
                    {status === 'not_attempted' ? 'Unattempted' : status.replace('_', ' ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => onStatusChange('')}
                    className="text-muted hover:text-rose-400 ml-0.5 p-0.5"
                    aria-label="Remove status filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  onClearFilters();
                }}
                className="text-[11px] font-mono text-accent hover:underline ml-1 inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear all filters</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
