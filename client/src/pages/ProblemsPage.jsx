import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchProblems, deleteProblem } from '../api/problems';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorHandler';

import ProblemTable from '../components/ProblemTable';
import ProblemForm from '../components/ProblemForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

/* ── Difficulty / Status maps ─────────────────────────────────────── */
const DIFF_STYLE = {
  easy:   { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  medium: { text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'   },
  hard:   { text: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20'       },
};
const STATUS_CFG = {
  solved:         { label: 'Solved',   dot: 'bg-emerald-400', text: 'text-emerald-400' },
  struggled:      { label: 'Struggled',dot: 'bg-red-400',     text: 'text-red-400'     },
  revisit_needed: { label: 'Revisit',  dot: 'bg-amber-400',   text: 'text-amber-400'   },
};
const PLATFORM_LABELS = {
  leetcode: 'LC', gfg: 'GFG', codechef: 'CC', hackerrank: 'HR', other: 'Ext',
};

/* ── View toggle icons ───────────────────────────────────────────── */
const TableIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18M3 14h18M3 18h18" />
  </svg>
);
const GridIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

/* ── Problem Card (card view) ─────────────────────────────────────── */
const ProblemCard = ({ problem, onEdit, onDelete }) => {
  const diff = DIFF_STYLE[problem.difficulty] || { text: 'text-[#A8A29E]', bg: 'bg-[#211F1D] border-[#2E2A27]' };
  const latestStatus = problem.latestAttempt?.status;
  const statusCfg = latestStatus ? STATUS_CFG[latestStatus] : null;
  const platform = PLATFORM_LABELS[problem.platform] || problem.platform;

  return (
    <div className="panel p-4 flex flex-col gap-3 hover:-translate-y-0.5 hover:border-[#3E3834] hover:shadow-2xl hover:shadow-black/60 transition-all duration-200 group">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/problems/${problem.id}`}
          className="text-sm font-semibold text-[#F5F5F4] hover:text-[#FB923C] transition-colors leading-snug line-clamp-2 flex-1"
        >
          {problem.title}
        </Link>
        <a href={problem.link} target="_blank" rel="noreferrer"
          className="text-[#3E3834] hover:text-[#A8A29E] transition-colors shrink-0 text-xs mt-0.5">↗</a>
      </div>

      {/* Topics */}
      {problem.topics?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {problem.topics.slice(0, 3).map(t => (
            <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-[#211F1D] border border-[#262320] text-[#6B6560]">
              {t}
            </span>
          ))}
          {problem.topics.length > 3 && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-[#211F1D] border border-[#262320] text-[#3E3834]">
              +{problem.topics.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#262320]">
        <div className="flex items-center gap-2">
          {/* Difficulty badge */}
          <span className={`text-[10px] font-semibold capitalize px-2 py-0.5 rounded-lg border ${diff.text} ${diff.bg}`}>
            {problem.difficulty}
          </span>
          {/* Platform */}
          <span className="text-[10px] font-mono text-[#3E3834] px-1.5 py-0.5 rounded-md bg-[#141312] border border-[#262320]">
            {platform}
          </span>
        </div>

        {/* Status */}
        {statusCfg ? (
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            <span className={`text-[10px] ${statusCfg.text}`}>{statusCfg.label}</span>
          </div>
        ) : (
          <span className="text-[10px] text-[#3E3834] font-mono">—</span>
        )}
      </div>

      {/* Hover actions */}
      <div className="flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link to={`/problems/${problem.id}`}
          className="flex-1 text-center text-[10px] font-semibold py-1.5 rounded-lg bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 hover:bg-[#F97316]/20 transition-colors">
          Open
        </Link>
        <button onClick={() => onEdit(problem)}
          className="flex-1 text-center text-[10px] font-semibold py-1.5 rounded-lg bg-[#211F1D] text-[#A8A29E] border border-[#2E2A27] hover:bg-[#262320] transition-colors">
          Edit
        </button>
        <button onClick={() => onDelete(problem)}
          className="flex-1 text-center text-[10px] font-semibold py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
          Delete
        </button>
      </div>
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────── */
const ProblemsPage = () => {
  const toast = useToast();
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus] = useState('');
  const [topic, setTopic] = useState('');

  const [viewMode, setViewMode] = useState(() =>
    localStorage.getItem('problems_view') || 'table'
  );

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

  const toggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('problems_view', mode);
  };

  const handleOpenAdd   = () => { setEditingProblem(null); setIsFormOpen(true); };
  const handleEdit      = (p) => { setEditingProblem(p); setIsFormOpen(true); };
  const handleDeletePrompt = (p) => { setDeletingProblem(p); };

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

  const handleResetFilters = () => { setSearch(''); setDifficulty(''); setStatus(''); setTopic(''); };
  const activeFilterCount = [search, difficulty, status, topic].filter(Boolean).length;

  return (
    <div className="space-y-5 pb-12 animate-fade-up">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#F5F5F4]">Problems</h1>
            <span className="text-xs font-mono text-[#3E3834] bg-[#1C1A18] border border-[#262320] px-2 py-0.5 rounded-lg">
              {problems.length}
            </span>
          </div>
          <p className="text-xs text-[#6B6560] mt-0.5 font-mono">
            Your repository across all topics, platforms and difficulty tiers.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* View toggle */}
          <div className="flex items-center gap-0.5 p-1 rounded-xl bg-[#1C1A18] border border-[#262320]">
            <button
              onClick={() => toggleView('table')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-[#F97316] text-white' : 'text-[#6B6560] hover:text-[#A8A29E]'}`}
              title="Table view"
            ><TableIcon /></button>
            <button
              onClick={() => toggleView('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#F97316] text-white' : 'text-[#6B6560] hover:text-[#A8A29E]'}`}
              title="Grid view"
            ><GridIcon /></button>
          </div>
          <button onClick={handleOpenAdd} type="button" className="btn-primary text-xs">
            + Add Problem
          </button>
        </div>
      </div>

      {/* ── Quick Filter Chips ── */}
      <div className="flex flex-wrap items-center gap-2">
        {['', 'easy', 'medium', 'hard'].map(d => (
          <button key={d}
            onClick={() => setDifficulty(d)}
            className={`text-[11px] font-semibold px-3 py-1 rounded-xl border transition-all duration-150 ${
              difficulty === d
                ? d === '' ? 'bg-[#F97316]/10 border-[#F97316]/30 text-[#F97316]'
                  : d === 'easy' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : d === 'medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-[#1C1A18] border-[#262320] text-[#6B6560] hover:text-[#A8A29E] hover:border-[#3E3834]'
            }`}
          >
            {d === '' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
        <div className="h-5 w-px bg-[#262320] mx-1" />
        {['', 'solved', 'struggled', 'revisit_needed'].map(s => (
          <button key={s}
            onClick={() => setStatus(s)}
            className={`text-[11px] font-semibold px-3 py-1 rounded-xl border transition-all duration-150 ${
              status === s
                ? s === '' ? 'bg-[#F97316]/10 border-[#F97316]/30 text-[#F97316]'
                  : s === 'solved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : s === 'struggled' ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-[#1C1A18] border-[#262320] text-[#6B6560] hover:text-[#A8A29E] hover:border-[#3E3834]'
            }`}
          >
            {s === '' ? 'All Status' : s === 'revisit_needed' ? 'Revisit' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Search + Topic row ── */}
      <div className="panel p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block section-label mb-1.5">Search title</label>
            <input type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. Two Sum" className="input-base" />
          </div>
          <div>
            <label className="block section-label mb-1.5">Topic</label>
            <input type="text" value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Dynamic Programming" className="input-base" />
          </div>
        </div>
        {activeFilterCount > 0 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2E2A27] text-xs">
            <span className="text-[#78716C]">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
            <button onClick={handleResetFilters} type="button"
              className="text-[#F97316] hover:text-[#FB923C] transition-colors font-medium">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Content: Table or Card Grid ── */}
      {viewMode === 'grid' && !isLoading && !error && problems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map(p => (
            <ProblemCard key={p.id} problem={p} onEdit={handleEdit} onDelete={handleDeletePrompt} />
          ))}
        </div>
      ) : (
        <ProblemTable
          problems={problems}
          isLoading={isLoading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDeletePrompt}
          onOpenAdd={handleOpenAdd}
        />
      )}

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
