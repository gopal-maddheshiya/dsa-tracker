import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { fetchProblems, deleteProblem } from '../api/problems';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorHandler';
import { Download, Dices, Search, Tag, X, CheckCircle2, Edit2, Trash2, Plus, ExternalLink, FolderOpen, Eye, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

import ProblemTable from '../components/ProblemTable';
import ProblemForm from '../components/ProblemForm';
import AttemptForm from '../components/AttemptForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Reveal from '../components/common/Reveal';
import TiltCard from '../components/common/TiltCard';

/* ── Difficulty / Status maps ─────────────────────────────────────── */
const DIFF_STYLE = {
  easy:   { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', dot: 'bg-emerald-400' },
  medium: { text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/25',   dot: 'bg-amber-400' },
  hard:   { text: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/25',     dot: 'bg-rose-400' },
};
const STATUS_CFG = {
  solved:         { label: 'Solved',   dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.15)]' },
  struggled:      { label: 'Struggled',dot: 'bg-rose-400',    text: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/25', glow: 'shadow-[0_0_8px_rgba(244,63,94,0.15)]' },
  revisit_needed: { label: 'Revisit',  dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/25', glow: 'shadow-[0_0_8px_rgba(245,158,11,0.15)]' },
};
const PLATFORM_LABELS = {
  leetcode:   { label: 'LeetCode', short: 'LC', style: 'text-amber-400 bg-amber-500/10 border-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.08)]', dot: 'bg-amber-400' },
  gfg:        { label: 'GeeksforGeeks', short: 'GFG', style: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.08)]', dot: 'bg-emerald-400' },
  codechef:   { label: 'CodeChef', short: 'CC', style: 'text-amber-300 bg-amber-600/10 border-amber-600/25 shadow-[0_0_8px_rgba(217,119,6,0.08)]', dot: 'bg-amber-300' },
  hackerrank: { label: 'HackerRank', short: 'HR', style: 'text-green-400 bg-green-500/10 border-green-500/25 shadow-[0_0_8px_rgba(34,197,94,0.08)]', dot: 'bg-green-400' },
  other:      { label: 'External', short: 'Ext', style: 'text-[#9CA3AF] bg-white/[0.04] border-white/[0.08]', dot: 'bg-[#9CA3AF]' },
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

/* ── Mobile Problem Card (ultra polished touch card) ──────────────── */
const MobileProblemCard = ({ problem, onEdit, onDelete, onLog }) => {
  const diff = DIFF_STYLE[problem.difficulty] || { text: 'text-[#9CA3AF]', bg: 'bg-[#181B20] border-white/[0.08]', dot: 'bg-zinc-400' };
  const latestStatus = problem.latestAttempt?.status;
  const statusCfg = latestStatus ? STATUS_CFG[latestStatus] : null;
  const platform = PLATFORM_LABELS[problem.platform] || PLATFORM_LABELS.other;

  return (
    <div className="panel p-4 bg-[#12151A] border-white/[0.08] flex flex-col gap-3 relative overflow-hidden transition-all duration-150 active:border-white/[0.2] rounded-2xl shadow-lg">
      {/* Top row: Difficulty + Platform on left, Status on right */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${diff.text} ${diff.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot} animate-pulse`} />
            <span>{problem.difficulty}</span>
          </span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${platform.style}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${platform.dot}`} />
            <span>{platform.short}</span>
          </span>
        </div>

        {statusCfg ? (
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.glow}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} animate-pulse`} />
            <span className="text-[11px] font-mono font-semibold">{statusCfg.label}</span>
          </div>
        ) : (
          <span className="text-[10px] font-mono text-[#6B7280] px-2 py-0.5 rounded-md bg-[#0A0C0F] border border-white/[0.07]">
            Unattempted
          </span>
        )}
      </div>

      {/* Middle row: Problem Title + External Link */}
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/problems/${problem.id}`}
          className="text-sm font-semibold text-[#F3F4F6] leading-snug line-clamp-2 active:text-[#E07A38] transition-colors"
        >
          {problem.title}
        </Link>
        {problem.link && (
          <a
            href={problem.link}
            target="_blank"
            rel="noreferrer"
            className="p-1 text-[#6B7280] hover:text-[#E07A38] active:text-[#E07A38] shrink-0"
            title="Open original problem"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Topics & Sessions row */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-1 flex-wrap">
          {problem.topics?.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0A0C0F] border border-white/[0.08] text-[#9CA3AF]"
            >
              {t}
            </span>
          ))}
          {(problem.topics?.length || 0) > 3 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#0A0C0F] border border-white/[0.08] text-[#6B7280]">
              +{problem.topics.length - 3}
            </span>
          )}
        </div>

        <span className="text-[10px] font-mono text-[#9CA3AF]">
          {problem.attemptCount > 0 ? `${problem.attemptCount} attempt${problem.attemptCount > 1 ? 's' : ''}` : 'No attempts'}
        </span>
      </div>

      {/* Bottom actions row */}
      <div className="flex items-center gap-2 pt-2.5 border-t border-white/[0.06]">
        {onLog && (
          <button
            onClick={() => onLog(problem)}
            className="flex-1 h-9 flex items-center justify-center gap-1.5 px-3 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 active:bg-emerald-500/25 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Log Attempt</span>
          </button>
        )}

        <Link
          to={`/problems/${problem.id}`}
          aria-label="View problem details"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#181B20] text-[#9CA3AF] border border-white/[0.08] active:bg-[#22262E] active:text-[#F3F4F6] transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={() => onEdit(problem)}
          aria-label="Edit problem"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#181B20] text-[#9CA3AF] border border-white/[0.08] active:bg-amber-500/10 active:text-amber-400 transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onDelete(problem)}
          aria-label="Delete problem"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/25 active:bg-rose-500/25 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

/* ── Mobile Loading Skeleton ──────────────────────────────────────── */
const MobileProblemSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="panel p-4 bg-[#12151A] border-white/[0.08] space-y-3 animate-pulse rounded-2xl">
        <div className="flex justify-between">
          <div className="h-4 w-20 shimmer rounded-md" />
          <div className="h-4 w-16 shimmer rounded-md" />
        </div>
        <div className="h-4 w-4/5 shimmer rounded-md" />
        <div className="flex gap-1.5">
          <div className="h-3 w-12 shimmer rounded-md" />
          <div className="h-3 w-14 shimmer rounded-md" />
        </div>
        <div className="pt-2 border-t border-white/[0.06] flex gap-2">
          <div className="h-8 flex-1 shimmer rounded-xl" />
          <div className="h-8 w-8 shimmer rounded-xl" />
          <div className="h-8 w-8 shimmer rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

/* ── Mobile Empty State ───────────────────────────────────────────── */
const MobileEmptyState = ({ onOpenAdd, hasFilters, onResetFilters }) => (
  <div className="panel p-8 text-center border-dashed border-white/[0.1] bg-[#121418] space-y-3 rounded-2xl">
    <div className="w-12 h-12 rounded-2xl bg-[#181B20] border border-white/[0.08] flex items-center justify-center mx-auto text-[#9CA3AF] shadow-sm">
      <FolderOpen className="w-6 h-6" />
    </div>
    <h3 className="text-sm font-bold text-[#F3F4F6]">No problems found</h3>
    <p className="text-xs text-[#9CA3AF] max-w-xs mx-auto">
      {hasFilters ? 'No problems match your filters.' : 'Your repository is empty. Add your first problem to start tracking.'}
    </p>
    {hasFilters ? (
      <button onClick={onResetFilters} className="btn-secondary text-xs mt-2">
        Clear All Filters
      </button>
    ) : (
      <button onClick={onOpenAdd} className="btn-primary text-xs mt-2">
        + Add First Problem
      </button>
    )}
  </div>
);

/* ── Problem Card (desktop card/grid view) ────────────────────────── */
const ProblemCard = ({ problem, onEdit, onDelete, onLog }) => {
  const diff = DIFF_STYLE[problem.difficulty] || { text: 'text-[#9CA3AF]', bg: 'bg-[#181B20] border-white/[0.08]', dot: 'bg-zinc-400' };
  const latestStatus = problem.latestAttempt?.status;
  const statusCfg = latestStatus ? STATUS_CFG[latestStatus] : null;
  const platform = PLATFORM_LABELS[problem.platform] || PLATFORM_LABELS.other;

  return (
    <div className="panel p-4 sm:p-5 flex flex-col gap-3.5 bg-[#121418] hover:bg-[#15181E] border border-white/[0.08] hover:border-[#E07A38]/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-200 group relative rounded-2xl overflow-hidden">
      {/* Subtle top corner ambient glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#E07A38]/5 group-hover:bg-[#E07A38]/15 blur-2xl rounded-full pointer-events-none transition-all duration-300" />

      {/* Top row: Difficulty & Platform chips */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${diff.text} ${diff.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot} animate-pulse`} />
            <span>{problem.difficulty}</span>
          </span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${platform.style}`} title={platform.label}>
            <span className={`w-1.5 h-1.5 rounded-full ${platform.dot}`} />
            <span>{platform.short}</span>
          </span>
        </div>

        {statusCfg ? (
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-lg border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.glow}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} animate-pulse`} />
            <span>{statusCfg.label}</span>
          </span>
        ) : (
          <span className="text-[10px] font-mono text-[#6B7280] px-2 py-0.5 rounded-md bg-[#0D0F13] border border-white/[0.06]">
            Unattempted
          </span>
        )}
      </div>

      {/* Problem Title & External Link */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <Link
          to={`/problems/${problem.id}`}
          className="text-sm font-semibold text-[#F3F4F6] group-hover:text-[#E07A38] transition-colors leading-snug line-clamp-2 flex-1 tracking-tight"
          title={problem.title}
        >
          {problem.title}
        </Link>
        {problem.link && (
          <a
            href={problem.link}
            target="_blank"
            rel="noreferrer"
            className="text-[#6B7280] hover:text-[#E07A38] transition-colors shrink-0 p-1 -m-1 rounded hover:bg-white/[0.05]"
            title="Open original problem in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
        )}
      </div>

      {/* Topics */}
      {problem.topics?.length > 0 && (
        <div className="flex flex-wrap gap-1 relative z-10">
          {problem.topics.slice(0, 3).map((t) => (
            <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0D0F13] border border-white/[0.08] text-[#9CA3AF] group-hover:border-white/[0.14] transition-colors">
              {t}
            </span>
          ))}
          {problem.topics.length > 3 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#0D0F13] border border-white/[0.08] text-[#6B7280]" title={problem.topics.slice(3).join(', ')}>
              +{problem.topics.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Sessions info & action buttons */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.06] text-xs relative z-10">
        <span className="font-mono text-[11px] text-[#6B7280]">
          {problem.attemptCount > 0 ? (
            <span className="text-[#9CA3AF] font-semibold">{problem.attemptCount} attempt{problem.attemptCount > 1 ? 's' : ''}</span>
          ) : (
            'No attempts'
          )}
        </span>

        <div className="flex items-center gap-1.5">
          {onLog && (
            <button
              type="button"
              onClick={() => onLog(problem)}
              className="h-8 px-2.5 rounded-lg text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/40 text-[11px] font-mono font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Log practice attempt"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>Log</span>
            </button>
          )}
          <Link
            to={`/problems/${problem.id}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.08] border border-white/[0.08] bg-[#0E1014] transition-all"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => onEdit(problem)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-amber-400 hover:bg-amber-500/10 border border-white/[0.08] bg-[#0E1014] hover:border-amber-500/25 transition-all cursor-pointer"
            title="Edit problem"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(problem)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-rose-400 hover:bg-rose-500/10 border border-white/[0.08] bg-[#0E1014] hover:border-rose-500/25 transition-all cursor-pointer"
            title="Delete problem"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── useIsMobile hook ─────────────────────────────────────────────── */
const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

/* ── Main Page ────────────────────────────────────────────────────── */
const ProblemsPage = () => {
  useEffect(() => {
    document.title = 'Problems · DSA Tracker';
  }, []);

  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const isMobile = useIsMobile();

  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [difficulty, setDifficulty] = useState(() => searchParams.get('difficulty') || '');
  const [status, setStatus] = useState(() => searchParams.get('status') || '');
  const [topic, setTopic] = useState(() => searchParams.get('topic') || '');

  // Ref for keyboard shortcut focusing
  const searchInputRef = useRef(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 10 | 25 | 50 | 'all'

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, difficulty, status, topic, pageSize]);

  // Sync state if URL query params change
  useEffect(() => {
    const d = searchParams.get('difficulty');
    const t = searchParams.get('topic');
    const s = searchParams.get('search');
    if (d !== null && d !== difficulty) setDifficulty(d);
    if (t !== null && t !== topic) setTopic(t);
    if (s !== null && s !== search) setSearch(s);

    if (searchParams.get('new') === '1' || searchParams.get('add') === 'true' || searchParams.get('add') === '1') {
      setEditingProblem(null);
      setIsFormOpen(true);
    }
  }, [searchParams]);

  const [viewMode, setViewMode] = useState(() =>
    localStorage.getItem('problems_view') || 'table'
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [deletingProblem, setDeletingProblem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loggingProblem, setLoggingProblem] = useState(null);

  // Global '/' keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      const isModalOpen = isFormOpen || Boolean(deletingProblem) || Boolean(loggingProblem);

      if (e.key === '/' && !isInputActive && !isModalOpen) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFormOpen, deletingProblem, loggingProblem]);

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

  useEffect(() => {
    const handleProblemCreated = () => {
      loadProblems();
    };
    window.addEventListener('problem-created', handleProblemCreated);
    return () => window.removeEventListener('problem-created', handleProblemCreated);
  }, [loadProblems]);

  const toggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('problems_view', mode);
  };

  const handleOpenAdd = () => { setEditingProblem(null); setIsFormOpen(true); };
  const handleEdit = (p) => { setEditingProblem(p); setIsFormOpen(true); };
  const handleCloseForm = useCallback(() => { setIsFormOpen(false); }, []);
  const handleDeletePrompt = (p) => { setDeletingProblem(p); };

  const handleConfirmDelete = async () => {
    if (!deletingProblem) return;
    setIsDeleting(true);
    const delId = deletingProblem.id || deletingProblem._id;
    try {
      await deleteProblem(delId);
      setProblems((prev) => prev.filter((p) => (p.id || p._id) !== delId));
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
    setSearch('');
    setDifficulty('');
    setStatus('');
    setTopic('');
  };

  const activeFilterCount = [search, difficulty, status, topic].filter(Boolean).length;

  // Header quick statistics
  const stats = useMemo(() => {
    const total = problems.length;
    const easy = problems.filter((p) => p.difficulty === 'easy').length;
    const medium = problems.filter((p) => p.difficulty === 'medium').length;
    const hard = problems.filter((p) => p.difficulty === 'hard').length;
    const solved = problems.filter((p) => p.latestAttempt?.status === 'solved').length;
    return { total, easy, medium, hard, solved };
  }, [problems]);

  // Pagination calculations
  const totalProblems = problems.length;
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(totalProblems / pageSize));

  const paginatedProblems = useMemo(() => {
    if (pageSize === 'all') return problems;
    const start = (currentPage - 1) * pageSize;
    return problems.slice(start, start + pageSize);
  }, [problems, currentPage, pageSize]);

  const startIndex = (currentPage - 1) * (pageSize === 'all' ? 0 : pageSize);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  // Pick Random Problem (LeetCode style)
  const handlePickRandom = () => {
    if (!problems || problems.length === 0) {
      toast.error('No problems available to pick.');
      return;
    }
    // Prioritize revisit_needed or struggled or unattempted
    const priorityCandidates = problems.filter(
      (p) => p.latestAttempt?.status === 'revisit_needed' || p.latestAttempt?.status === 'struggled' || !p.latestAttempt
    );
    const pool = priorityCandidates.length > 0 ? priorityCandidates : problems;
    const picked = pool[Math.floor(Math.random() * pool.length)];

    toast.success(`Picked: "${picked.title}"`);
    navigate(`/problems/${picked.id}`);
  };

  const handleExportCSV = () => {
    if (!problems || problems.length === 0) {
      toast.error('No problems to export.');
      return;
    }
    const headers = ['Title', 'Difficulty', 'Platform', 'Topics', 'Latest Status', 'Attempt Count', 'URL', 'Added Date'];
    const rows = problems.map((p) => [
      `"${(p.title || '').replace(/"/g, '""')}"`,
      p.difficulty || '',
      p.platform || '',
      `"${(p.topics || []).join('; ').replace(/"/g, '""')}"`,
      p.latestAttempt?.status || 'unattempted',
      p.attemptCount || 0,
      `"${p.link || ''}"`,
      p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : '',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dsa_problems_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${problems.length} problems to CSV.`);
  };

  return (
    <div className="space-y-5 pb-24 sm:pb-12 animate-fade-up">
      {/* ── Top Header & Action Controls ───────────────────────────── */}
      <Reveal delay={0} y={14}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-[#F3F4F6]">Problems</h1>
              <span className="text-xs font-mono text-[#9CA3AF] bg-[#14171C] border border-white/[0.08] px-2.5 py-0.5 rounded-lg">
                {stats.total} total
              </span>

              {/* Quick Stat Chips — scrollable on mobile, inline on desktop */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
                <span className="inline-flex text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shrink-0">
                  ● {stats.easy} Easy
                </span>
                <span className="inline-flex text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-400 shrink-0">
                  ● {stats.medium} Med
                </span>
                <span className="inline-flex text-[11px] font-mono px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-400 shrink-0">
                  ● {stats.hard} Hard
                </span>
                <span className="inline-flex text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {stats.solved} Solved
                </span>
              </div>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-1 font-mono">
              Your centralized repository across topics, platforms, and difficulty tiers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* View toggle (desktop only) */}
            <div className="hidden sm:flex items-center gap-0.5 p-1 rounded-xl bg-[#14171C] border border-white/[0.08] h-10">
              <button
                onClick={() => toggleView('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-[#6B7280] hover:text-[#F3F4F6]'}`}
                title="Table view"
              >
                <TableIcon />
              </button>
              <button
                onClick={() => toggleView('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-[#6B7280] hover:text-[#F3F4F6]'}`}
                title="Grid view"
              >
                <GridIcon />
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              type="button"
              className="hidden sm:inline-flex btn-secondary text-xs items-center gap-1.5"
              title="Export problems as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {/* Pick Random Problem */}
            <button
              onClick={handlePickRandom}
              type="button"
              className="btn-secondary text-xs items-center gap-1.5"
              title="Pick a random problem to practice"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Pick Random</span>
            </button>

            <button
              onClick={handleOpenAdd}
              type="button"
              className="btn-primary text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Problem</span>
            </button>
          </div>
        </div>
      </Reveal>

      {/* ── Unified Modern Command & Filter Toolbar ────────────────── */}
      <Reveal delay={50} y={12}>
        <div className="panel p-3.5 sm:p-4 border-white/[0.08] bg-[#121418] space-y-3 rounded-2xl shadow-md">
          {/* Top Row: Search Title + Topic Filter + Reset */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-center">
            {/* Search Title */}
            <div className="md:col-span-6 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problems by title, keywords... (Press / to focus)"
                className="input pl-9.5 pr-8 py-2 text-xs sm:text-sm w-full bg-[#0D0F13] border-white/[0.08] rounded-xl focus:border-[#E07A38]/50 focus:ring-1 focus:ring-[#E07A38]/50"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Topic Filter Dropdown */}
            <div className="md:col-span-4 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <Tag className="w-3.5 h-3.5" />
              </span>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input pl-9 pr-8 py-2 text-xs sm:text-sm w-full bg-[#0D0F13] border-white/[0.08] rounded-xl text-slate-300 focus:border-[#E07A38]/50 focus:ring-1 focus:ring-[#E07A38]/50 appearance-none cursor-pointer"
              >
                <option value="">All Topics ({allTopics.length})</option>
                {allTopics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">
                ▼
              </span>
            </div>

            {/* Quick Reset / Filter count Indicator */}
            <div className="md:col-span-2 flex items-center justify-end gap-2">
              {activeFilterCount > 0 ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn-ghost text-xs text-amber-400 hover:text-amber-300 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 py-1.5 px-2.5 rounded-xl flex items-center gap-1.5 w-full justify-center sm:w-auto transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Reset ({activeFilterCount})</span>
                </button>
              ) : (
                <span className="text-[11px] font-mono text-slate-500 hidden md:inline">
                  No active filters
                </span>
              )}
            </div>
          </div>

          {/* Bottom Row: Difficulty & Status Quick Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-white/[0.04]">
            {/* Difficulty Segmented Control */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[11px] font-medium text-slate-400 shrink-0 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                <span>Difficulty:</span>
              </span>
              <div className="flex items-center p-0.5 rounded-lg bg-[#0B0D11] border border-white/[0.07] shrink-0">
                {[
                  { value: '', label: 'All', active: 'bg-white/[0.12] text-white font-semibold border-white/[0.2] shadow-xs' },
                  { value: 'easy', label: 'Easy', active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35 font-semibold shadow-xs' },
                  { value: 'medium', label: 'Medium', active: 'bg-amber-500/15 text-amber-400 border-amber-500/35 font-semibold shadow-xs' },
                  { value: 'hard', label: 'Hard', active: 'bg-rose-500/15 text-rose-400 border-rose-500/35 font-semibold shadow-xs' },
                ].map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDifficulty(d.value)}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      difficulty === d.value
                        ? d.active
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Segmented Control */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[11px] font-medium text-slate-400 shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-slate-500" />
                <span>Status:</span>
              </span>
              <div className="flex items-center p-0.5 rounded-lg bg-[#0B0D11] border border-white/[0.07] shrink-0">
                {[
                  { value: '', label: 'All', active: 'bg-white/[0.12] text-white font-semibold border-white/[0.2] shadow-xs' },
                  { value: 'solved', label: 'Solved', active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35 font-semibold shadow-xs' },
                  { value: 'struggled', label: 'Struggled', active: 'bg-rose-500/15 text-rose-400 border-rose-500/35 font-semibold shadow-xs' },
                  { value: 'revisit_needed', label: 'Revisit', active: 'bg-amber-500/15 text-amber-400 border-amber-500/35 font-semibold shadow-xs' },
                ].map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStatus(s.value)}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      status === s.value
                        ? s.active
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Content: Mobile Cards / Desktop Table or Grid ──────────── */}
      {isMobile ? (
        /* Mobile: Beautiful touch-first individual cards */
        isLoading ? (
          <MobileProblemSkeleton />
        ) : error ? (
          <div className="panel p-6 text-center border-rose-500/25 bg-[#140F11]">
            <p className="text-sm font-semibold text-rose-300">Unable to load problems</p>
            <p className="text-xs text-rose-400 mt-1">{error}</p>
          </div>
        ) : problems.length === 0 ? (
          <MobileEmptyState
            onOpenAdd={handleOpenAdd}
            hasFilters={activeFilterCount > 0}
            onResetFilters={handleResetFilters}
          />
        ) : (
          <div className="space-y-3">
            {paginatedProblems.map((p, idx) => (
              <Reveal key={p.id} delay={Math.min(idx * 25, 180)} y={10}>
                <MobileProblemCard
                  problem={p}
                  onEdit={handleEdit}
                  onDelete={handleDeletePrompt}
                  onLog={setLoggingProblem}
                />
              </Reveal>
            ))}
          </div>
        )
      ) : viewMode === 'grid' && !isLoading && !error && problems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedProblems.map((p, idx) => (
            <Reveal key={p.id} delay={Math.min(idx * 30, 200)} y={12} className="h-full">
              <TiltCard maxTilt={5} className="h-full">
                <ProblemCard
                  problem={p}
                  onEdit={handleEdit}
                  onDelete={handleDeletePrompt}
                  onLog={setLoggingProblem}
                />
              </TiltCard>
            </Reveal>
          ))}
        </div>
      ) : (
        <ProblemTable
          problems={paginatedProblems}
          isLoading={isLoading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDeletePrompt}
          onOpenAdd={handleOpenAdd}
          onLog={setLoggingProblem}
          startIndex={startIndex}
        />
      )}

      {/* ── Smart Responsive Pagination Footer ── */}
      {!isLoading && !error && totalProblems > 0 && (
        <div className="panel p-3 sm:px-4 sm:py-3 border-white/[0.08] bg-[#121418] rounded-2xl shadow-md space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4 overflow-hidden">
          {/* Mobile Top Row / Desktop Left: Range Info & Mobile Page Size */}
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="font-mono text-slate-400 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0" />
              <span className="text-slate-400">
                <span className="hidden sm:inline">Showing </span>
                <strong className="text-slate-100 font-semibold">
                  {pageSize === 'all' ? 1 : Math.min((currentPage - 1) * pageSize + 1, totalProblems)}–{pageSize === 'all' ? totalProblems : Math.min(currentPage * pageSize, totalProblems)}
                </strong>
                <span className="text-slate-500"> of </span>
                <strong className="text-slate-200 font-semibold">{totalProblems}</strong>
                <span className="hidden md:inline text-slate-400"> problems</span>
              </span>
            </div>

            {/* Mobile-only compact Page Size selector */}
            <div className="sm:hidden flex items-center p-0.5 rounded-lg bg-[#0B0D11] border border-white/[0.08] shrink-0">
              {[10, 25, 50, 'all'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  className={`h-6 px-2 flex items-center justify-center text-[10px] font-mono rounded-md transition-all cursor-pointer ${
                    pageSize === size
                      ? 'bg-[#1C2026] text-white font-bold border border-white/[0.12] shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {size === 'all' ? 'All' : size}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Controls: Mobile Thumb-Friendly Action Bar / Desktop Center */}
          {totalPages > 1 && (
            <div className="grid grid-cols-[1fr_auto_1fr] sm:flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="h-9 sm:h-8 px-3 rounded-xl sm:rounded-lg border border-white/[0.08] bg-[#0E1014] text-slate-300 hover:text-white hover:bg-[#181B20] disabled:opacity-25 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs text-xs font-semibold"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              {/* Desktop: Numeric Page Pills */}
              <div className="hidden md:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`w-7 h-7 rounded-lg font-mono text-xs flex items-center justify-center transition-all cursor-pointer ${
                      currentPage === p
                        ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                        : 'bg-[#0E1014] border border-white/[0.08] text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#181B20]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Mobile / Tablet: Prominent Page Counter */}
              <div className="md:hidden px-3.5 h-9 sm:h-8 flex items-center justify-center font-mono text-xs font-bold text-slate-200 bg-[#0E1014] border border-white/[0.08] rounded-xl sm:rounded-lg min-w-[70px] shadow-xs">
                <span className="text-white">{currentPage}</span>
                <span className="text-slate-500 mx-1.5 font-normal">of</span>
                <span className="text-slate-400">{totalPages}</span>
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-9 sm:h-8 px-3 rounded-xl sm:rounded-lg border border-white/[0.08] bg-[#0E1014] text-slate-300 hover:text-white hover:bg-[#181B20] disabled:opacity-25 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs text-xs font-semibold"
                title="Next Page"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Desktop Right: Per page selector */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider hidden lg:inline">Per page:</span>
            <div className="h-8 flex items-center p-0.5 rounded-lg bg-[#0E1014] border border-white/[0.08]">
              {[10, 25, 50, 'all'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  className={`h-7 px-2 sm:px-2.5 flex items-center justify-center text-[10px] sm:text-[11px] font-mono rounded-md transition-all cursor-pointer ${
                    pageSize === size
                      ? 'bg-[#1C2026] text-white font-bold border border-white/[0.12] shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {size === 'all' ? 'All' : size}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <ProblemForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
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

      <AttemptForm
        isOpen={Boolean(loggingProblem)}
        onClose={() => setLoggingProblem(null)}
        onSuccess={loadProblems}
        problemId={loggingProblem?.id || loggingProblem?._id}
        problemTitle={loggingProblem?.title}
      />
    </div>
  );
};

export default ProblemsPage;
