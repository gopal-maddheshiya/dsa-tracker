import React, { useState, useEffect } from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';

/**
 * ProblemFilters component
 * Handles debounced search and multi-criteria filters for topics, difficulties, and statuses.
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

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search input with search icon & clear button */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search problems by title or topic..."
            className="w-full pl-9 pr-9 py-2 bg-surface text-text text-xs rounded-md border border-line focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-muted"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                onSearchChange('');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-text rounded transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Dropdown */}
          <div className="relative">
            <select
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value)}
              aria-label="Filter by difficulty"
              className="px-3 py-2 pr-8 bg-surface text-text text-xs rounded-md border border-line focus:outline-none focus:border-accent appearance-none cursor-pointer"
            >
              <option value="">All difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
              ▾
            </div>
          </div>

          {/* Topic Dropdown */}
          <div className="relative">
            <select
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              aria-label="Filter by topic"
              className="px-3 py-2 pr-8 bg-surface text-text text-xs rounded-md border border-line focus:outline-none focus:border-accent appearance-none cursor-pointer max-w-[160px] truncate"
            >
              <option value="">All topics</option>
              {availableTopics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
              ▾
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              aria-label="Filter by status"
              className="px-3 py-2 pr-8 bg-surface text-text text-xs rounded-md border border-line focus:outline-none focus:border-accent appearance-none cursor-pointer"
            >
              <option value="">All statuses</option>
              <option value="solved">Solved</option>
              <option value="revisit_needed">Revisit needed</option>
              <option value="struggled">Struggled</option>
              <option value="not_attempted">Not attempted</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
              ▾
            </div>
          </div>

          {/* Clear Filters Action */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                onClearFilters();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs text-text-secondary hover:text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-md transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter metrics & summary bar */}
      <div className="flex items-center justify-between text-[11px] text-muted font-mono px-1">
        <div>
          Showing {filteredCount} of {totalCount} {totalCount === 1 ? 'problem' : 'problems'}
          {hasActiveFilters && ' (filtered)'}
        </div>
      </div>
    </div>
  );
}
