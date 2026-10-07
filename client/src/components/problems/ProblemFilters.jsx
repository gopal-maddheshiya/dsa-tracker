import React, { useState, useEffect } from 'react';
import { Search, X, ChevronDown, Download, RotateCcw } from 'lucide-react';

/**
 * ProblemFilters
 * Spacious, tactile, and premium filter controls for the problem repository.
 * Features comfortable h-11 search, h-10/h-11 dropdown controls,
 * and solid h-9.5 status tabs with no icon-text overlapping or cut-offs.
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
  problems = [],
  onClearFilters,
  onExportCsv,
}) {
  const [searchInput, setSearchInput] = useState(search);

  // Synchronize internal input state if parent changes search
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounce search input by 200ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== search) {
        onSearchChange(searchInput);
      }
    }, 200);

    return () => clearTimeout(handler);
  }, [searchInput, search, onSearchChange]);

  const hasActiveFilters = Boolean(
    search.trim() || difficulty || topic || status
  );

  // Calculate live counts for status tabs
  const solvedCount = problems.filter((p) => p.latestAttempt?.status === 'solved').length;
  const revisitCount = problems.filter((p) => p.latestAttempt?.status === 'revisit_needed').length;
  const struggledCount = problems.filter((p) => p.latestAttempt?.status === 'struggled').length;
  const unattemptedCount = problems.filter((p) => !p.latestAttempt).length;

  const statusTabs = [
    { id: 'all', label: 'All', value: '', count: totalCount, active: !status },
    {
      id: 'solved',
      label: 'Solved',
      value: 'solved',
      count: solvedCount,
      active: status === 'solved',
      activeColor: 'bg-emerald-500 text-white shadow-xs font-semibold',
    },
    {
      id: 'revisit',
      label: 'Revisit',
      value: 'revisit_needed',
      count: revisitCount,
      active: status === 'revisit_needed',
      activeColor: 'bg-amber-500 text-white shadow-xs font-semibold',
    },
    {
      id: 'struggled',
      label: 'Struggled',
      value: 'struggled',
      count: struggledCount,
      active: status === 'struggled',
      activeColor: 'bg-rose-500 text-white shadow-xs font-semibold',
    },
    {
      id: 'unattempted',
      label: 'Unattempted',
      value: 'not_attempted',
      count: unattemptedCount,
      active: status === 'not_attempted',
      activeColor: 'bg-purple-600 text-white shadow-xs font-semibold',
    },
  ];

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-surface border border-line shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_2px_8px_-2px_rgba(0,0,0,0.25)] space-y-2.5 sm:space-y-3">
      {/* 1. Search Bar & Dropdown Controls */}
      {/* Desktop view: Single comfortable row */}
      <div className="hidden sm:flex items-center gap-2.5">
        {/* Search input with generous padding and no text overlap */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search problems by title, topic..."
            className="w-full h-9.5 sm:h-10 bg-surface-2 border border-line rounded-lg pl-9 pr-8 text-xs sm:text-sm text-text placeholder-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:shadow-[0_0_16px_rgba(237,134,65,0.18)] transition-all shadow-xs"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                onSearchChange('');
              }}
              title="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-text rounded-md transition-all active:scale-90"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Difficulty Dropdown */}
        <div className="relative min-w-[145px]">
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            aria-label="Filter by difficulty"
            className={`w-full h-9.5 sm:h-10 pl-3 pr-9 bg-surface-2 text-xs sm:text-sm font-mono rounded-lg border focus:outline-none focus:border-accent appearance-none cursor-pointer shadow-xs transition-colors ${
              difficulty
                ? 'border-accent/60 text-accent font-semibold'
                : 'border-line text-text-secondary'
            }`}
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted w-3.5 h-3.5" />
        </div>

        {/* Topic Dropdown */}
        <div className="relative min-w-[135px] max-w-[210px]">
          <select
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            aria-label="Filter by topic"
            className={`w-full h-9.5 sm:h-10 pl-3 pr-9 bg-surface-2 text-xs sm:text-sm font-mono rounded-lg border focus:outline-none focus:border-accent appearance-none cursor-pointer truncate shadow-xs transition-colors ${
              topic
                ? 'border-accent/60 text-accent font-semibold'
                : 'border-line text-text-secondary'
            }`}
          >
            <option value="">All Topics</option>
            {availableTopics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted w-3.5 h-3.5" />
        </div>

        {/* Export to CSV */}
        {onExportCsv && (
          <button
            type="button"
            onClick={onExportCsv}
            className="h-9.5 sm:h-10 px-3 inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono text-text-secondary hover:text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-lg transition-all duration-150 active:scale-95 shadow-xs shrink-0"
            title="Export filtered problems to CSV"
          >
            <Download className="w-3.5 h-3.5 text-muted" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Mobile view: Search on row 1, Dropdowns on row 2 */}
      <div className="block sm:hidden space-y-2">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search problems by title, topic..."
            className="w-full h-9 bg-surface-2 border border-line rounded-lg pl-9 pr-8 text-xs text-text placeholder-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-xs"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                onSearchChange('');
              }}
              title="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-text rounded-md transition-all active:scale-90"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value)}
              aria-label="Filter by difficulty"
              className={`w-full h-9 pl-2.5 pr-8 bg-surface-2 text-xs font-mono rounded-lg border focus:outline-none focus:border-accent appearance-none cursor-pointer shadow-xs transition-colors ${
                difficulty
                  ? 'border-accent/60 text-accent font-semibold'
                  : 'border-line text-text-secondary'
              }`}
            >
              <option value="">Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted w-3 h-3" />
          </div>

          <div className="relative flex-1">
            <select
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              aria-label="Filter by topic"
              className={`w-full h-9 pl-2.5 pr-8 bg-surface-2 text-xs font-mono rounded-lg border focus:outline-none focus:border-accent appearance-none cursor-pointer truncate shadow-xs transition-colors ${
                topic
                  ? 'border-accent/60 text-accent font-semibold'
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
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted w-3 h-3" />
          </div>

          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="h-9 px-2.5 inline-flex items-center gap-1.5 text-xs font-mono text-text-secondary hover:text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-lg transition-all duration-150 active:scale-95 shadow-xs shrink-0"
              title="Export filtered problems to CSV"
            >
              <Download className="w-3 text-muted" />
              <span>CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Quick Status Segmented Tabs */}
      <div className="pt-2 border-t border-line/50 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        {statusTabs.map((tab) => {
          const isSelected = tab.active;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange(isSelected && tab.value !== '' ? '' : tab.value)}
              className={`whitespace-nowrap shrink-0 h-8 sm:h-8.5 px-3 rounded-lg text-xs font-mono font-medium transition-all duration-150 active:scale-95 inline-flex items-center gap-1.5 shadow-xs ${
                isSelected
                  ? tab.activeColor || 'bg-accent text-white font-semibold'
                  : 'bg-surface-2 text-text-secondary hover:text-text hover:bg-surface-hover border border-line'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded font-semibold ${
                  isSelected ? 'bg-black/25 text-white' : 'bg-surface/80 text-muted border border-line/60'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Active Filters Tags HUD (Only shown when any filter is active) */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-line/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono text-muted">
              Showing <span className="font-semibold text-text">{filteredCount}</span> of {totalCount}:
            </span>

            {search.trim() && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 border border-line text-xs font-mono text-text">
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
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {difficulty && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 border border-line text-xs font-mono text-text">
                <span className="text-muted">Diff:</span>
                <span className="font-semibold capitalize text-accent">{difficulty}</span>
                <button
                  type="button"
                  onClick={() => onDifficultyChange('')}
                  className="text-muted hover:text-rose-400 ml-0.5 p-0.5"
                  aria-label="Remove difficulty filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {topic && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 border border-line text-xs font-mono text-text">
                <span className="text-muted">Topic:</span>
                <span className="font-semibold text-accent">{topic}</span>
                <button
                  type="button"
                  onClick={() => onTopicChange('')}
                  className="text-muted hover:text-rose-400 ml-0.5 p-0.5"
                  aria-label="Remove topic filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {status && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 border border-line text-xs font-mono text-text">
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
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                onClearFilters();
              }}
              className="text-xs font-mono font-medium text-accent hover:underline ml-1 inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
