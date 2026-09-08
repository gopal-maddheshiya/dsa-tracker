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

  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus] = useState('');
  const [topic, setTopic] = useState('');

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
      const msg = getErrorMessage(err, 'Failed to load problems.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [search, difficulty, status, topic, toast]);

  useEffect(() => {
    const timer = setTimeout(() => { loadProblems(); }, 250);
    return () => clearTimeout(timer);
  }, [loadProblems]);

  const handleOpenAdd = () => { setEditingProblem(null); setIsFormOpen(true); };
  const handleEdit = (problem) => { setEditingProblem(problem); setIsFormOpen(true); };
  const handleDeletePrompt = (problem) => { setDeletingProblem(problem); };

  const handleConfirmDelete = async () => {
    if (!deletingProblem) return;
    setIsDeleting(true);
    try {
      await deleteProblem(deletingProblem.id);
      setProblems(prev => prev.filter(p => p.id !== deletingProblem.id));
      setDeletingProblem(null);
      toast.success(`Deleted "${deletingProblem.title}".`);
      loadProblems();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete problem.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch(''); setDifficulty(''); setStatus(''); setTopic('');
  };

  const activeFilterCount = [search, difficulty, status, topic].filter(Boolean).length;

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-12 animate-fade-up">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F4]">Problems</h1>
            <span className="text-sm font-mono text-[#78716C]">({problems.length})</span>
          </div>
          <p className="text-sm text-[#A8A29E] mt-0.5">
            Your repository across all topics, platforms, and difficulty tiers.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          type="button"
          className="btn-primary text-sm self-start sm:self-auto"
        >
          + Add Problem
        </button>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="panel p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block section-label mb-1.5">Search title</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. Two Sum"
              className="input-base"
            />
          </div>
          <div>
            <label className="block section-label mb-1.5">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Dynamic Programming"
              className="input-base"
            />
          </div>
          <div>
            <label className="block section-label mb-1.5">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="input-base"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block section-label mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-base"
            >
              <option value="">All Statuses</option>
              <option value="solved">Solved</option>
              <option value="struggled">Struggled</option>
              <option value="revisit_needed">Revisit Needed</option>
              <option value="unattempted">Unattempted</option>
            </select>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2E2A27] text-xs">
            <span className="text-[#78716C]">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
            <button
              onClick={handleResetFilters}
              type="button"
              className="text-[#F97316] hover:text-[#FB923C] transition-colors font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <ProblemTable
        problems={problems}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDeletePrompt}
        onOpenAdd={handleOpenAdd}
      />

      <ProblemForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadProblems}
        initialData={editingProblem}
      />

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
