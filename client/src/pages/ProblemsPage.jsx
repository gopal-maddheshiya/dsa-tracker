import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { fetchProblems, deleteProblem } from '../api/problems';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorHandler';
import { Download, Dices, Search, Tag, X, CheckCircle2, Edit2, Trash2, Plus, ExternalLink, FolderOpen, Eye } from 'lucide-react';

import ProblemTable from '../components/ProblemTable';
import ProblemForm from '../components/ProblemForm';
import AttemptForm from '../components/AttemptForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

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
          className="text-sm font-semibold text-[#F3F4F6] leading-snug line-clamp-2 active:text-[#FB923C] transition-colors"
        >
          {problem.title}
        </Link>
        {problem.link && (
          <a
            href={problem.link}
            target="_blank"
            rel="noreferrer"
            className="p-1 text-[#6B7280] hover:text-[#F97316] active:text-[#FB923C] shrink-0"
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
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 active:bg-emerald-500/25 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Log Attempt</span>
          </button>
        )}

        <Link
          to={`/problems/${problem.id}`}
          aria-label="View problem details"
          className="p-2 rounded-xl bg-[#181B20] text-[#9CA3AF] border border-white/[0.08] active:bg-[#22262E] active:text-[#F3F4F6] transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={() => onEdit(problem)}
          aria-label="Edit problem"
          className="p-2 rounded-xl bg-[#181B20] text-[#9CA3AF] border border-white/[0.08] active:bg-amber-500/10 active:text-amber-400 transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onDelete(problem)}
          aria-label="Delete problem"
          className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/25 active:bg-rose-500/25 transition-colors cursor-pointer"
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
    <div className="panel p-4 sm:p-5 flex flex-col gap-3.5 bg-[#121418] hover:bg-[#15181E] border border-white/[0.08] hover:border-[#F97316]/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-200 group relative rounded-2xl overflow-hidden">
      {/* Subtle top corner ambient glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#F97316]/5 group-hover:bg-[#F97316]/15 blur-2xl rounded-full pointer-events-none transition-all duration-300" />

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
          className="text-sm font-semibold text-[#F3F4F6] group-hover:text-[#FB923C] transition-colors leading-snug line-clamp-2 flex-1 tracking-tight"
          title={problem.title}
        >
          {problem.title}
        </Link>
        {problem.link && (
          <a
            href={problem.link}
            target="_blank"
            rel="noreferrer"
            className="text-[#6B7280] hover:text-[#F97316] transition-colors shrink-0 p-1 -m-1 rounded hover:bg-white/[0.05]"
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
              className="px-2.5 py-1 rounded-lg text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/40 text-[11px] font-mono font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Log practice attempt"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>Log</span>
            </button>
          )}
          <Link
            to={`/problems/${problem.id}`}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.08] border border-transparent hover:border-white/[0.1] transition-all"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => onEdit(problem)}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all cursor-pointer"
            title="Edit problem"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(problem)}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
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
  const handleDeletePrompt = (p) => { setDeletingProblem(p); };

  const handleConfirmDelete = async () => {
    if (!deletingProblem) return;
    setIsDeleting(true);
    try {
      await deleteProblem(deletingProblem.id);
      setProblems((prev) => prev.filter((p) => p.id !== deletingProblem.id));
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
    <div className="space-y-5 pb-12 animate-fade-up">
      {/* ── Top Header & Action Controls ───────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#F3F4F6]">Problems</h1>
            <span className="text-xs font-mono text-[#9CA3AF] bg-[#14171C] border border-white/[0.08] px-2.5 py-0.5 rounded-lg">
              {stats.total} total
            </span>

            {/* Quick Stat Chips — hidden on mobile to avoid overflow */}
            <span className="hidden sm:inline-flex text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
              ● {stats.easy} Easy
            </span>
            <span className="hidden sm:inline-flex text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-400">
              ● {stats.medium} Med
            </span>
            <span className="hidden sm:inline-flex text-[11px] font-mono px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-400">
              ● {stats.hard} Hard
            </span>
            <span className="hidden sm:inline-flex text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {stats.solved} Solved
            </span>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-1 font-mono">
            Your centralized repository across topics, platforms, and difficulty tiers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* View toggle (desktop only) */}
          <div className="hidden sm:flex items-center gap-0.5 p-1 rounded-xl bg-[#14171C] border border-white/[0.08]">
            <button
              onClick={() => toggleView('table')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-[#F97316] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#F3F4F6]'}`}
              title="Table view"
            >
              <TableIcon />
            </button>
            <button
              onClick={() => toggleView('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#F97316] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#F3F4F6]'}`}
              title="Grid view"
            >
              <GridIcon />
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            type="button"
            className="hidden sm:flex btn-ghost text-xs items-center gap-1.5"
            title="Export problems as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {/* Pick Random Problem */}
          <button
            onClick={handlePickRandom}
            type="button"
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#14171C] border border-white/[0.12] hover:border-white/[0.22] hover:bg-[#1B1F25] text-[#F3F4F6] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Pick a random problem to practice"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Pick Random</span>
          </button>

          <button
            onClick={handleOpenAdd}
            type="button"
            className="btn-primary text-xs flex items-center gap-1 px-3.5 py-2 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* ── Unified Modern Command & Filter Toolbar ────────────────── */}
      <div className="panel p-3.5 sm:p-4 border-white/[0.08] bg-[#121418] space-y-3">
        {/* Top Row: Search Title + Topic Filter + Reset */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-center">
          {/* Search Title */}
          <div className="md:col-span-6 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  if (search) setSearch('');
                  else searchInputRef.current?.blur();
                }
              }}
              placeholder="Search problems by title..."
              className="input-base pl-9 pr-8 text-xs h-9 w-full bg-[#0D0F13] border-white/[0.09] focus:border-[#F97316]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                title="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#F3F4F6]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Topic */}
          <div className="md:col-span-4 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none">
              <Tag className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Filter by topic (e.g. Graph, DP)..."
              className="input-base pl-9 pr-8 text-xs h-9 w-full bg-[#0D0F13] border-white/[0.09] focus:border-[#F97316]"
            />
            {topic && (
              <button
                onClick={() => setTopic('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#F3F4F6]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter count & Reset button */}
          <div className="md:col-span-2 flex justify-end">
            {activeFilterCount > 0 ? (
              <button
                onClick={handleResetFilters}
                type="button"
                className="text-xs font-mono text-[#F97316] hover:text-[#FB923C] bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition-colors w-full text-center flex items-center justify-center gap-1.5"
              >
                <span>Reset ({activeFilterCount})</span>
                <X className="w-3 h-3" />
              </button>
            ) : (
              <span className="text-[11px] font-mono text-[#6B7280] hidden md:block text-right w-full">
                {problems.length} matches
              </span>
            )}
          </div>
        </div>

        {/* Bottom Row: Difficulty & Status Quick Filter Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-white/[0.06]">
          {/* Difficulty Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <span className="text-[10px] font-mono uppercase text-[#6B7280] mr-1 shrink-0">Diff:</span>
            {['', 'easy', 'medium', 'hard'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border shrink-0 transition-all ${
                  difficulty === d
                    ? d === ''
                      ? 'bg-[#F97316] text-white font-bold border-transparent shadow-sm'
                      : d === 'easy'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                      : d === 'medium'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold'
                    : 'bg-[#0E1014] border-white/[0.08] text-[#9CA3AF] hover:text-[#F3F4F6] hover:border-white/[0.18]'
                }`}
              >
                {d === '' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>

          {/* Status Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <span className="text-[10px] font-mono uppercase text-[#6B7280] mr-1 shrink-0">Status:</span>
            {['', 'solved', 'struggled', 'revisit_needed'].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border shrink-0 transition-all ${
                  status === s
                    ? s === ''
                      ? 'bg-[#F97316] text-white font-bold border-transparent shadow-sm'
                      : s === 'solved'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                      : s === 'struggled'
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold'
                      : 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                    : 'bg-[#0E1014] border-white/[0.08] text-[#9CA3AF] hover:text-[#F3F4F6] hover:border-white/[0.18]'
                }`}
              >
                {s === '' ? 'All' : s === 'revisit_needed' ? 'Revisit' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

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
            {paginatedProblems.map((p) => (
              <MobileProblemCard
                key={p.id}
                problem={p}
                onEdit={handleEdit}
                onDelete={handleDeletePrompt}
                onLog={setLoggingProblem}
              />
            ))}
          </div>
        )
      ) : viewMode === 'grid' && !isLoading && !error && problems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedProblems.map((p) => (
            <ProblemCard
              key={p.id}
              problem={p}
              onEdit={handleEdit}
              onDelete={handleDeletePrompt}
              onLog={setLoggingProblem}
            />
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

      {/* ── Smart Pagination Footer ── */}
      {!isLoading && !error && totalProblems > 0 && (
        <div className="panel px-4 py-3 border-white/[0.08] bg-[#121418] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Left: Range text */}
          <div className="font-mono text-[#9CA3AF] text-center sm:text-left">
            Showing{' '}
            <strong className="text-[#F3F4F6]">
              {pageSize === 'all' ? 1 : Math.min((currentPage - 1) * pageSize + 1, totalProblems)}
            </strong>{' '}
            to{' '}
            <strong className="text-[#F3F4F6]">
              {pageSize === 'all' ? totalProblems : Math.min(currentPage * pageSize, totalProblems)}
            </strong>{' '}
            of <strong className="text-[#F3F4F6]">{totalProblems}</strong>
          </div>

          {/* Middle: Page navigation pills */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-[#0E1014] text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#181B20] disabled:opacity-30 disabled:pointer-events-none transition-all font-mono text-xs active:bg-[#1C2026]"
              >
                ← Prev
              </button>

              {/* Mobile: compact "Page X / Y" */}
              <div className="sm:hidden px-3 py-1 font-mono text-xs text-[#F3F4F6] bg-[#0E1014] border border-white/[0.08] rounded-lg">
                {currentPage} / {totalPages}
              </div>

              {/* Desktop: all page number buttons */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`w-7 h-7 rounded-lg font-mono text-xs transition-all ${
                      currentPage === p
                        ? 'bg-[#F97316] text-white font-bold shadow-md shadow-[#F97316]/25'
                        : 'bg-[#0E1014] border border-white/[0.08] text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#181B20]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-[#0E1014] text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#181B20] disabled:opacity-30 disabled:pointer-events-none transition-all font-mono text-xs active:bg-[#1C2026]"
              >
                Next →
              </button>
            </div>
          )}

          {/* Right: Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#6B7280]">Per page:</span>
            <div className="flex items-center p-0.5 rounded-lg bg-[#0E1014] border border-white/[0.08]">
              {[10, 25, 50, 'all'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded transition-all ${
                    pageSize === size
                      ? 'bg-[#1C2026] text-[#F3F4F6] font-semibold border border-white/[0.12]'
                      : 'text-[#6B7280] hover:text-[#9CA3AF]'
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

      <AttemptForm
        isOpen={Boolean(loggingProblem)}
        onClose={() => setLoggingProblem(null)}
        onSuccess={loadProblems}
        problemId={loggingProblem?.id}
        problemTitle={loggingProblem?.title}
      />
    </div>
  );
};

export default ProblemsPage;
