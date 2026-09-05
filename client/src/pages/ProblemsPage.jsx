import React, { useState, useEffect, useCallback } from 'react';
import { fetchProblems, deleteProblem } from '../api/problems';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorHandler';

import ProblemTable from '../components/ProblemTable';
import ProblemForm from '../components/ProblemForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const ProblemsPage = () => {
  const toast = useToast();
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus] = useState('');
  const [topic, setTopic] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [deletingProblem, setDeletingProblem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProblems = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchProblems({
        search: search.trim() || undefined,
        difficulty: difficulty || undefined,
        status: status || undefined,
        topic: topic.trim() || undefined,
      });
      setProblems(response.data || []);
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to retrieve problems from repository.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [search, difficulty, status, topic, toast]);

  useEffect(() => {
    // Debounce for search and filter updates
    const timer = setTimeout(() => {
      loadProblems();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadProblems]);

  const handleOpenAdd = () => {
    setEditingProblem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (problem) => {
    setEditingProblem(problem);
    setIsFormOpen(true);
  };

  const handleDeletePrompt = (problem) => {
    setDeletingProblem(problem);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProblem) return;

    setIsDeleting(true);
    const targetId = deletingProblem.id;
    const targetTitle = deletingProblem.title;

    try {
      await deleteProblem(targetId);
      // Optimistic local state update
      setProblems((prev) => prev.filter((p) => p.id !== targetId));
      setDeletingProblem(null);
      toast.success(`Deleted problem "${targetTitle}" and all associated attempts.`);
      loadProblems();
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to delete problem.');
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDifficulty('');
    setStatus('');
    setTopic('');
  };

  const activeFilterCount = [search, difficulty, status, topic].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Problem Repository</h1>
          <p className="text-sm text-slate-400 mt-1">
            Maintain your problem bank, categorize by algorithm topic, and monitor attempt history.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          type="button"
          className="inline-flex items-center justify-center px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-md transition-colors shadow-sm self-start sm:self-auto"
        >
          + Add Problem
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Search Input */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Search Title or Topic</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems..."
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Latest Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="solved">Solved</option>
              <option value="struggled">Struggled</option>
              <option value="revisit_needed">Revisit Needed</option>
              <option value="unattempted">Unattempted</option>
            </select>
          </div>

          {/* Topic Specific Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Filter by Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Binary Search"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
            <span>
              Active filters applied (<strong className="text-white font-mono">{activeFilterCount}</strong>)
            </span>
            <button
              onClick={handleResetFilters}
              type="button"
              className="text-emerald-400 hover:text-emerald-300 font-medium text-xs transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <ProblemTable
        problems={problems}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDeletePrompt}
        onOpenAdd={handleOpenAdd}
      />

      {/* Add / Edit Form Modal */}
      <ProblemForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadProblems}
        initialData={editingProblem}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingProblem)}
        onClose={() => setDeletingProblem(null)}
        onConfirm={handleConfirmDelete}
        problemTitle={deletingProblem?.title || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ProblemsPage;
