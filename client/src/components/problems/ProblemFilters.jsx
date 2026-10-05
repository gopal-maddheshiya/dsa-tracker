import React, { useState, useEffect } from 'react';
import { Search, X, Filter, RotateCcw, ChevronDown, Download } from 'lucide-react';

/**
 * ProblemFilters component
 * Handles debounced search, quick one-click filter chips, multi-criteria dropdowns, and CSV export.
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

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== search) {
        onSearchChange(searchInput);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput, search, onSearchChange]);

  const hasActiveFilters = Boolean(
    search.trim() || difficulty || topic || status
  );

  // Quick Preset Chips
  const quickFilters = [
    { label: 'All', active: !hasActiveFilters, onClick: onClearFilters },
    {
      label: '⚠️ Struggled',
      active: status === 'struggled',
      onClick: () => onStatusChange(status === 'struggled' ? '' : 'struggled'),
    },
    {
      label: '🔄 Revisit',
      active: status === 'revisit_needed',
      onClick: () => onStatusChange(status === 'revisit_needed' ? '' : 'revisit_needed'),
    },
    {
      label: '✅ Solved',
      active: status === 'solved',
      onClick: () => onStatusChange(status === 'solved' ? '' : 'solved'),
    },
    {
      label: '⏳ Unattempted',
      active: status === 'not_attempted',
      onClick: () => onStatusChange(status === 'not_attempted' ? '' : 'not_attempted'),
    },
    {
      label: '⚡ Hard',
      active: difficulty === 'hard',
      onClick: () => onDifficultyChange(difficulty === 'hard' ? '' : 'hard'),
    },
  ];

  return (
    <div className="space-y-3">
      {/* 1. One-Click Quick Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-mono text-muted uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
          Quick filters:
        </span>
        {quickFilters.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={q.onClick}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-150 active:scale-95 shrink-0 ${
              q.active
                ? 'bg-accent text-white font-semibold shadow-xs'
                : 'bg-surface-2 text-text-secondary hover:text-text hover:bg-surface-hover border border-line'
            }`}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* 2. Main Search & Dropdown Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        {/* Search input with search icon & clear button */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search problems by title or topic..."
            className="w-full h-9 pl-9 pr-8 bg-surface-2 text-text text-xs rounded-md border border-line focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors placeholder:text-muted/60 shadow-xs"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                onSearchChange('');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-text rounded transition-all duration-150 active:scale-95 focus-visible:ring-1 focus-visible:ring-accent"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter controls: 3-column grid on mobile, flex on desktop */}
        <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 sm:gap-2">
          {/* Difficulty Dropdown */}
          <div className="relative col-span-1">
            <select
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value)}
              aria-label="Filter by difficulty"
              className={`w-full sm:w-auto h-9 px-2 sm:px-3 pr-7 sm:pr-8 bg-surface-2 text-xs rounded-md border focus:outline-none focus:border-accent appearance-none cursor-pointer shadow-xs transition-colors ${
                difficulty
                  ? 'border-accent/60 text-text font-medium'
                  : 'border-line text-text-secondary'
              }`}
            >
              <option value="">Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <ChevronDown className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted w-3.5 h-3.5" />
          </div>

          {/* Topic Dropdown */}
          <div className="relative col-span-1">
            <select
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              aria-label="Filter by topic"
              className={`w-full sm:w-auto h-9 px-2 sm:px-3 pr-7 sm:pr-8 bg-surface-2 text-xs rounded-md border focus:outline-none focus:border-accent appearance-none cursor-pointer sm:max-w-[170px] truncate shadow-xs transition-colors ${
                topic
                  ? 'border-accent/60 text-text font-medium'
                  : 'border-line text-text-secondary'
              }`}
            >
              <option value="">Topic</option>
              {availableTopics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted w-3.5 h-3.5" />
          </div>

          {/* Status Dropdown */}
          <div className="relative col-span-1">
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              aria-label="Filter by status"
              className={`w-full sm:w-auto h-9 px-2 sm:px-3 pr-7 sm:pr-8 bg-surface-2 text-xs rounded-md border focus:outline-none focus:border-accent appearance-none cursor-pointer shadow-xs transition-colors ${
                status
                  ? 'border-accent/60 text-text font-medium'
                  : 'border-line text-text-secondary'
              }`}
            >
              <option value="">Status</option>
              <option value="solved">Solved</option>
              <option value="revisit_needed">Revisit</option>
              <option value="struggled">Struggled</option>
              <option value="not_attempted">Not tried</option>
            </select>
            <ChevronDown className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted w-3.5 h-3.5" />
          </div>

          {/* Clear Filters Action */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                onClearFilters();
              }}
              className="col-span-3 sm:col-auto h-9 inline-flex items-center justify-center gap-1.5 px-3 text-xs font-medium text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-md transition-all duration-150 active:scale-95 shadow-xs"
            >
              <RotateCcw className="w-3 h-3 text-muted" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips & Summary Bar with CSV Export */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-0.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {hasActiveFilters && (
            <>
              {search.trim() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-surface-2 text-text border border-line hover:border-line-hover transition-colors">
                  <span>query: "{search.trim()}"</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      onSearchChange('');
                    }}
                    className="hover:text-accent p-0.5 active:scale-90 transition-transform"
                    aria-label="Remove search filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {difficulty && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-surface-2 text-text border border-line hover:border-line-hover transition-colors">
                  <span>difficulty: {difficulty}</span>
                  <button
                    type="button"
                    onClick={() => onDifficultyChange('')}
                    className="hover:text-accent p-0.5 active:scale-90 transition-transform"
                    aria-label="Remove difficulty filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {topic && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-surface-2 text-text border border-line hover:border-line-hover transition-colors">
                  <span>topic: {topic}</span>
                  <button
                    type="button"
                    onClick={() => onTopicChange('')}
                    className="hover:text-accent p-0.5 active:scale-90 transition-transform"
                    aria-label="Remove topic filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {status && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-surface-2 text-text border border-line hover:border-line-hover transition-colors">
                  <span>status: {status.replace('_', ' ')}</span>
                  <button
                    type="button"
                    onClick={() => onStatusChange('')}
                    className="hover:text-accent p-0.5 active:scale-90 transition-transform"
                    aria-label="Remove status filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="text-[11px] text-muted font-mono">
            Showing <span className="text-text font-semibold">{filteredCount}</span> of {totalCount} {totalCount === 1 ? 'problem' : 'problems'}
            {hasActiveFilters && ' (filtered)'}
          </div>

          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-text-secondary hover:text-text bg-surface-2 hover:bg-surface-hover border border-line rounded transition-all active:scale-95"
              title="Export filtered problems to CSV"
            >
              <Download className="w-3 h-3 text-muted" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
