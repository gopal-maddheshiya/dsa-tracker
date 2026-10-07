import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, FolderPlus, SearchX, RotateCw, AlertCircle } from 'lucide-react';
import problemsApi from '../api/problems.api';
import ProblemStatsBar from '../components/problems/ProblemStatsBar';
import ProblemFilters from '../components/problems/ProblemFilters';
import ProblemTable from '../components/problems/ProblemTable';
import ProblemMobileList from '../components/problems/ProblemMobileList';
import ProblemFormModal from '../components/problems/ProblemFormModal';
import AttemptFormModal from '../components/problems/AttemptFormModal';
import DeleteConfirmModal from '../components/problems/DeleteConfirmModal';

/**
 * ProblemsPage
 * Central problem management interface supporting searching, filtering,
 * interactive KPI metrics, tabular desktop & stacked mobile views,
 * CRUD actions, and attempt logging.
 */
export default function ProblemsPage() {
  const [searchParams] = useSearchParams();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters state initialized from URL query parameters where present
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [difficulty, setDifficulty] = useState(() => searchParams.get('difficulty') || '');
  const [topic, setTopic] = useState(() => searchParams.get('topic') || '');
  const [status, setStatus] = useState(() => searchParams.get('status') || '');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(() => searchParams.get('action') === 'add');
  const [editingProblem, setEditingProblem] = useState(null);
  const [attemptingProblem, setAttemptingProblem] = useState(null);
  const [deletingProblem, setDeletingProblem] = useState(null);

  // Sync state if URL search parameters update
  useEffect(() => {
    const qSearch = searchParams.get('search');
    const qTopic = searchParams.get('topic');
    const qDiff = searchParams.get('difficulty');
    const qStatus = searchParams.get('status');
    const qAction = searchParams.get('action');

    if (qSearch !== null) setSearch(qSearch);
    if (qTopic !== null) setTopic(qTopic);
    if (qDiff !== null) setDifficulty(qDiff);
    if (qStatus !== null) setStatus(qStatus);
    if (qAction === 'add') setIsCreateOpen(true);
  }, [searchParams]);

  // Dynamic set of all discovered topics across loaded problems
  const [allKnownTopics, setAllKnownTopics] = useState(new Set());

  // Fetch problems with backend query parameters and active request tracking
  const loadProblems = useCallback(async (isCancelled = () => false, isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const queryParams = {};
      if (search.trim()) queryParams.search = search.trim();
      if (difficulty) queryParams.difficulty = difficulty;
      if (topic) queryParams.topic = topic;

      // Note: "not_attempted" is a UI-level filter; only send valid backend statuses
      if (status && status !== 'not_attempted') {
        queryParams.status = status;
      }

      const res = await problemsApi.getProblems(queryParams);
      if (isCancelled()) return;

      const fetched = res.data?.problems || [];

      // Update known topics for filter dropdown
      setAllKnownTopics((prev) => {
        const next = new Set(prev);
        fetched.forEach((p) => {
          if (Array.isArray(p.topics)) {
            p.topics.forEach((t) => next.add(t));
          }
        });
        return next;
      });

      setProblems(fetched);
    } catch (err) {
      if (!isCancelled()) {
        setError(err.message || 'Failed to load problems. Please try refreshing.');
      }
    } finally {
      if (!isCancelled()) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [search, difficulty, topic, status]);

  useEffect(() => {
    let cancelled = false;
    loadProblems(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [loadProblems]);

  // Column sorting state (default: last attempt descending)
  const [sortConfig, setSortConfig] = useState({ key: 'lastAttempt', direction: 'desc' });

  const handleSort = (columnKey) => {
    setSortConfig((prev) => {
      if (prev.key === columnKey) {
        return { key: columnKey, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key: columnKey, direction: columnKey === 'lastAttempt' ? 'desc' : 'asc' };
    });
  };

  // Client-side handling for "not_attempted" filter
  const filteredProblems = useMemo(() => {
    if (status === 'not_attempted') {
      return problems.filter((p) => !p.latestAttempt);
    }
    return problems;
  }, [problems, status]);

  // Client-side multi-column sorting
  const displayedProblems = useMemo(() => {
    const list = [...filteredProblems];
    const { key, direction } = sortConfig;
    const multiplier = direction === 'asc' ? 1 : -1;

    const difficultyRanks = { easy: 1, medium: 2, hard: 3 };
    const statusRanks = { not_attempted: 0, struggled: 1, revisit_needed: 2, solved: 3 };

    list.sort((a, b) => {
      if (key === 'title') {
        return multiplier * (a.title || '').localeCompare(b.title || '');
      }
      if (key === 'difficulty') {
        const diffA = difficultyRanks[a.difficulty] || 0;
        const diffB = difficultyRanks[b.difficulty] || 0;
        return multiplier * (diffA - diffB);
      }
      if (key === 'status') {
        const statusA = a.latestAttempt ? statusRanks[a.latestAttempt.status] : 0;
        const statusB = b.latestAttempt ? statusRanks[b.latestAttempt.status] : 0;
        return multiplier * (statusA - statusB);
      }
      if (key === 'lastAttempt') {
        const timeA = a.latestAttempt?.attemptedAt
          ? new Date(a.latestAttempt.attemptedAt).getTime()
          : 0;
        const timeB = b.latestAttempt?.attemptedAt
          ? new Date(b.latestAttempt.attemptedAt).getTime()
          : 0;
        return multiplier * (timeA - timeB);
      }
      return 0;
    });
    return list;
  }, [filteredProblems, sortConfig]);

  // Sorted topic list for filter selector
  const availableTopics = useMemo(() => {
    return Array.from(allKnownTopics).sort((a, b) => a.localeCompare(b));
  }, [allKnownTopics]);

  // Export current filtered problem repository to CSV
  const handleExportCsv = () => {
    if (!displayedProblems || displayedProblems.length === 0) return;

    const headers = ['Title', 'Platform', 'Difficulty', 'Topics', 'Status', 'Latest Attempt Date', 'URL'];
    const rows = displayedProblems.map((p) => {
      const statusStr = p.latestAttempt?.status || 'not_attempted';
      const dateStr = p.latestAttempt?.attemptedAt
        ? new Date(p.latestAttempt.attemptedAt).toLocaleDateString()
        : 'Never';
      const topicsStr = Array.isArray(p.topics) ? p.topics.join('; ') : '';
      return [
        `"${(p.title || '').replace(/"/g, '""')}"`,
        `"${p.platform || ''}"`,
        `"${p.difficulty || ''}"`,
        `"${topicsStr.replace(/"/g, '""')}"`,
        `"${statusStr}"`,
        `"${dateStr}"`,
        `"${p.link || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dsa-problems-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearch('');
    setDifficulty('');
    setTopic('');
    setStatus('');
  };

  // CRUD Handlers
  const handleCreateSubmit = async (formData) => {
    await problemsApi.createProblem(formData);
    await loadProblems();
  };

  const handleEditSubmit = async (formData) => {
    if (!editingProblem) return;
    await problemsApi.updateProblem(editingProblem.id, formData);
    await loadProblems();
  };

  const handleLogAttemptSubmit = async (attemptData) => {
    if (!attemptingProblem) return;
    await problemsApi.createAttempt(attemptingProblem.id, attemptData);
    await loadProblems();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProblem) return;
    await problemsApi.deleteProblem(deletingProblem.id);
    await loadProblems();
  };

  const hasAnyFilterActive = Boolean(
    search.trim() || difficulty || topic || status
  );

  return (
    <div className="space-y-6 pb-24 sm:pb-12 max-w-7xl mx-auto">
      {/* Standardized Page Header */}
      <div className="space-y-1.5 sm:space-y-2 border-b border-line pb-4 sm:pb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
              Problems
            </h1>
            <span className="text-xs font-mono font-medium text-muted bg-surface-2 px-2.5 py-0.5 rounded-md border border-line whitespace-nowrap shrink-0">
              {problems.length} tracked
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => loadProblems(() => false, true)}
              disabled={isRefreshing || loading}
              title="Refresh problem list"
              aria-label="Refresh problem list"
              className="h-9 w-9 p-0 inline-flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-hover border border-line rounded-lg transition-all active:scale-95 disabled:opacity-50 shadow-xs"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-accent' : ''}`}
              />
            </button>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs sm:text-sm font-semibold bg-accent hover:bg-accent-hover text-white rounded-lg transition-all active:scale-95 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add problem</span>
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-text-secondary">
          Track, review, and revisit your DSA practice repository.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <ProblemFilters
        search={search}
        onSearchChange={setSearch}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        topic={topic}
        onTopicChange={setTopic}
        status={status}
        onStatusChange={setStatus}
        availableTopics={availableTopics}
        totalCount={problems.length}
        filteredCount={displayedProblems.length}
        problems={problems}
        onClearFilters={handleClearFilters}
        onExportCsv={handleExportCsv}
      />

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/25 flex items-center justify-between text-xs text-danger shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => loadProblems()}
            className="font-medium underline hover:no-underline ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main View Area */}
      {loading ? (
        <>
          {/* Desktop Table Skeleton */}
          <div className="hidden md:block rounded-xl bg-surface border border-line overflow-hidden shadow-xs animate-pulse">
            <div className="h-10 bg-surface-2/60 border-b border-line" />
            <div className="divide-y divide-line/60">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 px-4 flex items-center justify-between gap-4">
                  <div className="h-3.5 bg-surface-2 rounded w-48" />
                  <div className="h-3 bg-surface-2 rounded w-16" />
                  <div className="h-3 bg-surface-2 rounded w-14" />
                  <div className="h-3 bg-surface-2 rounded w-28" />
                  <div className="h-3 bg-surface-2 rounded w-20" />
                  <div className="h-3 bg-surface-2 rounded w-16" />
                  <div className="h-6 bg-surface-2 rounded w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Card Skeleton */}
          <div className="block md:hidden space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-surface border border-line space-y-3 shadow-xs">
                <div className="flex justify-between">
                  <div className="h-3.5 bg-surface-2 rounded w-24" />
                  <div className="h-3.5 bg-surface-2 rounded w-16" />
                </div>
                <div className="h-4 bg-surface-2 rounded w-3/4" />
                <div className="h-3 bg-surface-2 rounded w-1/2" />
              </div>
            ))}
          </div>
        </>
      ) : displayedProblems.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <ProblemTable
              problems={displayedProblems}
              sortConfig={sortConfig}
              onSort={handleSort}
              onLogAttempt={(p) => setAttemptingProblem(p)}
              onEditProblem={(p) => setEditingProblem(p)}
              onDeleteProblem={(p) => setDeletingProblem(p)}
            />
          </div>

          {/* Mobile Card List View */}
          <div className="block md:hidden">
            <ProblemMobileList
              problems={displayedProblems}
              onLogAttempt={(p) => setAttemptingProblem(p)}
              onEditProblem={(p) => setEditingProblem(p)}
              onDeleteProblem={(p) => setDeletingProblem(p)}
            />
          </div>
        </>
      ) : hasAnyFilterActive ? (
        /* Empty State: No match for filters */
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-surface border border-line rounded-xl shadow-xs">
          <div className="p-3 rounded-full bg-surface-2 text-muted border border-line">
            <SearchX className="w-5 h-5 text-muted" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-text">No matching problems</h3>
            <p className="text-xs text-muted max-w-sm">
              We couldn't find any problems matching your current search or filter criteria.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearFilters}
            className="h-8 px-3.5 inline-flex items-center justify-center text-xs font-mono font-medium text-accent bg-accent/10 hover:bg-accent/20 border border-accent/25 rounded-lg transition-all duration-150 active:scale-95 shadow-xs"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        /* Empty State: No problems in database yet */
        <div className="p-16 text-center flex flex-col items-center justify-center space-y-4 bg-surface border border-line rounded-xl shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent border border-accent/25 flex items-center justify-center">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-text">No problems tracked yet</h3>
            <p className="text-xs text-muted max-w-md leading-relaxed">
              Start building your personal DSA knowledge base. Add questions you are
              solving, log repeated attempts, and track your mastery over time.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 h-9 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-all duration-150 active:scale-95 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add your first problem</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <ProblemFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        title="Add Problem"
      />

      <ProblemFormModal
        isOpen={Boolean(editingProblem)}
        onClose={() => setEditingProblem(null)}
        onSubmit={handleEditSubmit}
        initialData={editingProblem}
        title="Edit Problem"
      />

      <AttemptFormModal
        isOpen={Boolean(attemptingProblem)}
        onClose={() => setAttemptingProblem(null)}
        onSubmit={handleLogAttemptSubmit}
        problemTitle={attemptingProblem?.title}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingProblem)}
        onClose={() => setDeletingProblem(null)}
        onConfirm={handleDeleteConfirm}
        problemTitle={deletingProblem?.title}
      />
    </div>
  );
}
