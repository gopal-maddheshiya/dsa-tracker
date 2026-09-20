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
import PaginationBar from '../components/ui/PaginationBar';
import Reveal from '../components/common/Reveal';
import TiltCard from '../components/common/TiltCard';

/* ── Difficulty / Status maps ─────────────────────────────────────── */
const DIFF_STYLE = {
  easy:   { text: 'text-easy',   bg: 'bg-easy/12 border-easy/25',   dot: 'bg-easy' },
  medium: { text: 'text-medium', bg: 'bg-medium/12 border-medium/25', dot: 'bg-medium' },
  hard:   { text: 'text-hard',   bg: 'bg-hard/12 border-hard/25',   dot: 'bg-hard' },
};
const STATUS_CFG = {
  solved:         { label: 'Solved',   dot: 'bg-success', text: 'text-success', bg: 'bg-success/12 border-success/25' },
  struggled:      { label: 'Struggled',dot: 'bg-danger',  text: 'text-danger',  bg: 'bg-danger/12 border-danger/25' },
  revisit_needed: { label: 'Revisit',  dot: 'bg-medium',  text: 'text-medium',  bg: 'bg-medium/12 border-medium/25' },
};
const PLATFORM_LABELS = {
  leetcode:   { label: 'LeetCode', short: 'LC', style: 'text-accent bg-accent/10 border-accent/20', dot: 'bg-accent' },
  gfg:        { label: 'GeeksforGeeks', short: 'GFG', style: 'text-easy bg-easy/10 border-easy/20', dot: 'bg-easy' },
  codechef:   { label: 'CodeChef', short: 'CC', style: 'text-medium bg-medium/10 border-medium/20', dot: 'bg-medium' },
  hackerrank: { label: 'HackerRank', short: 'HR', style: 'text-success bg-success/10 border-success/20', dot: 'bg-success' },
  other:      { label: 'External', short: 'Ext', style: 'text-muted bg-surface-2 border-line', dot: 'bg-muted' },
};

export const DEFAULT_DSA_TOPICS = [
  'Array',
  'Backtracking',
  'Binary Search',
  'Bit Manipulation',
  'Dynamic Programming',
  'Graph',
  'Greedy',
  'Hash Table',
  'Heap',
  'Linked List',
  'Math',
  'Matrix',
  'Recursion',
  'Sliding Window',
  'Stack',
  'String',
  'Tree',
  'Trie',
  'Two Pointers',
];

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

/* ── Mobile Problem Card (touch-first card) ──────────────────────── */
/* ── Mobile Problem Card (High-density touch-first card) ───────────── */
const MobileProblemCard = ({ problem, onEdit, onDelete, onLog }) => {
  const diff = DIFF_STYLE[problem.difficulty] || { text: 'text-muted', bg: 'bg-surface-2 border-line', dot: 'bg-muted' };
  const latestStatus = problem.latestAttempt?.status;
  const statusCfg = latestStatus ? STATUS_CFG[latestStatus] : null;
  const platform = PLATFORM_LABELS[problem.platform] || PLATFORM_LABELS.other;

  return (
    <div className="p-3 bg-surface border border-line rounded-lg flex flex-col gap-2 transition-all">
      {/* Top Line: Title + Status Pill */}
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/problems/${problem.id || problem._id}`}
          className="text-sm font-semibold text-text leading-snug line-clamp-1 hover:text-accent active:text-accent transition-colors flex-1"
        >
          {problem.title}
        </Link>
        {statusCfg ? (
          <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${statusCfg.bg} ${statusCfg.text}`}>
            <span>{statusCfg.label}</span>
          </span>
        ) : (
          <span className="text-[10px] text-muted px-1.5 py-0.2 rounded bg-surface-2 border border-line shrink-0">
            New
          </span>
        )}
      </div>

      {/* Middle Line: Difficulty · Platform · Topics · Sessions */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted flex-wrap">
        <span className={`inline-flex items-center font-semibold ${diff.text}`}>
          <span className="capitalize">{problem.difficulty}</span>
        </span>
        <span className="text-line">•</span>
        <span className="font-medium text-text-secondary">{platform.short}</span>
        {problem.topics?.length > 0 && (
          <>
            <span className="text-line">•</span>
            <span className="text-muted truncate max-w-[140px] font-mono text-[10px]">
              #{problem.topics[0]}
              {problem.topics.length > 1 ? ` +${problem.topics.length - 1}` : ''}
            </span>
          </>
        )}
        <span className="text-line">•</span>
        <span className="text-[10px] tabular-nums">
          {problem.attemptCount > 0 ? `${problem.attemptCount} att.` : '0 att.'}
        </span>
      </div>

      {/* Bottom Action Strip (Compact) */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-line/50">
        {onLog && (
          <button
            onClick={() => onLog(problem)}
            className="h-7 flex-1 flex items-center justify-center gap-1 px-2.5 rounded-md text-[11px] font-semibold bg-success/10 text-success border border-success/25 hover:bg-success/20 transition-all cursor-pointer"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
            <span>Log Attempt</span>
          </button>
        )}

        <div className="flex items-center gap-1 shrink-0">
          {problem.link && (
            <a
              href={problem.link}
              target="_blank"
              rel="noreferrer"
              className="w-7 h-7 flex items-center justify-center rounded-md bg-surface-2 text-muted hover:text-accent border border-line"
              title="Open problem link"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <Link
            to={`/problems/${problem.id || problem._id}`}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-surface-2 text-muted hover:text-text border border-line"
            title="View details"
          >
            <Eye className="w-3 h-3" />
          </Link>
          <button
            onClick={() => onEdit(problem)}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-surface-2 text-muted hover:text-medium border border-line cursor-pointer"
            title="Edit problem"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(problem)}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-danger/10 text-danger hover:bg-danger/20 border border-danger/25 cursor-pointer"
            title="Delete problem"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Mobile Loading Skeleton ──────────────────────────────────────── */
const MobileProblemSkeleton = () => (
  <div className="space-y-2.5">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="p-3 bg-surface border border-line space-y-2 animate-pulse rounded-lg">
        <div className="flex justify-between items-center">
          <div className="h-4 w-44 bg-surface-2 rounded" />
          <div className="h-3.5 w-14 bg-surface-2 rounded-full" />
        </div>
        <div className="flex gap-2">
          <div className="h-3 w-12 bg-surface-2 rounded" />
          <div className="h-3 w-16 bg-surface-2 rounded" />
          <div className="h-3 w-14 bg-surface-2 rounded" />
        </div>
        <div className="pt-2 border-t border-line/40 flex gap-2">
          <div className="h-7 flex-1 bg-surface-2 rounded" />
          <div className="h-7 w-7 bg-surface-2 rounded" />
          <div className="h-7 w-7 bg-surface-2 rounded" />
        </div>
      </div>
    ))}
  </div>
);

/* ── Mobile Empty State ───────────────────────────────────────────── */
const MobileEmptyState = ({ onOpenAdd, hasFilters, onResetFilters }) => (
  <div className="p-8 text-center border border-dashed border-line bg-surface space-y-3 rounded-xl">
    <div className="w-12 h-12 rounded-xl bg-surface-2 border border-line flex items-center justify-center mx-auto text-muted">
      <FolderOpen className="w-6 h-6" />
    </div>
    <h3 className="text-sm font-semibold text-text">No problems found</h3>
    <p className="text-xs text-muted max-w-xs mx-auto">
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
  const diff = DIFF_STYLE[problem.difficulty] || { text: 'text-muted', bg: 'bg-surface-2 border-line', dot: 'bg-muted' };
  const latestStatus = problem.latestAttempt?.status;
  const statusCfg = latestStatus ? STATUS_CFG[latestStatus] : null;
  const platform = PLATFORM_LABELS[problem.platform] || PLATFORM_LABELS.other;

  return (
    <div className="p-4 sm:p-5 flex flex-col gap-3.5 bg-surface hover:bg-surface-2/60 border border-line hover:border-line/80 transition-colors group relative rounded-xl overflow-hidden">
      {/* Top row: Difficulty & Platform chips */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center text-xs font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${diff.text} ${diff.bg}`}>
            <span>{problem.difficulty}</span>
          </span>
          <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-md border ${platform.style}`} title={platform.label}>
            <span>{platform.short}</span>
          </span>
        </div>

        {statusCfg ? (
          <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text}`}>
            <span>{statusCfg.label}</span>
          </span>
        ) : (
          <span className="text-xs text-muted px-2 py-0.5 rounded-md bg-surface-2 border border-line">
            Unattempted
          </span>
        )}
      </div>

      {/* Problem Title & External Link */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <Link
          to={`/problems/${problem.id || problem._id}`}
          className="text-sm font-semibold text-text group-hover:text-accent transition-colors leading-snug line-clamp-2 flex-1 tracking-tight"
          title={problem.title}
        >
          {problem.title}
        </Link>
        {problem.link && (
          <a
            href={problem.link}
            target="_blank"
            rel="noreferrer"
            className="text-muted hover:text-accent transition-colors shrink-0 p-1 -m-1 rounded hover:bg-surface-2"
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
            <span key={t} className="text-xs font-mono px-2 py-0.5 rounded-md bg-surface-2 border border-line text-text-secondary">
              #{t}
            </span>
          ))}
          {problem.topics.length > 3 && (
            <span className="text-xs font-mono px-1.5 py-0.5 rounded-md bg-surface-2 border border-line text-muted" title={problem.topics.slice(3).join(', ')}>
              +{problem.topics.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Sessions info & action buttons */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-line text-xs relative z-10">
        <span className="text-xs text-muted tabular-nums">
          {problem.attemptCount > 0 ? (
            <span className="text-text-secondary font-medium">{problem.attemptCount} attempt{problem.attemptCount > 1 ? 's' : ''}</span>
          ) : (
            'No attempts'
          )}
        </span>

        <div className="flex items-center gap-1.5">
          {onLog && (
            <button
              type="button"
              onClick={() => onLog(problem)}
              className="h-8 px-2.5 rounded-lg text-success bg-success/10 hover:bg-success/20 border border-success/25 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              title="Log practice attempt"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>Log</span>
            </button>
          )}
          <Link
            to={`/problems/${problem.id || problem._id}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-surface-2 border border-line bg-surface transition-all"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => onEdit(problem)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-medium hover:bg-medium/10 border border-line bg-surface transition-all cursor-pointer"
            title="Edit problem"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(problem)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 border border-line bg-surface transition-all cursor-pointer"
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
    const list = Array.isArray(problems) ? problems : [];
    const total = list.length;
    const easy = list.filter((p) => p?.difficulty === 'easy').length;
    const medium = list.filter((p) => p?.difficulty === 'medium').length;
    const hard = list.filter((p) => p?.difficulty === 'hard').length;
    const solved = list.filter((p) => p?.latestAttempt?.status === 'solved').length;
    return { total, easy, medium, hard, solved };
  }, [problems]);

  // Extract all unique sorted topics from problems catalog and maintain persistent set across filters
  const [knownTopics, setKnownTopics] = useState([]);

  useEffect(() => {
    if (Array.isArray(problems) && problems.length > 0) {
      setKnownTopics((prev) => {
        const set = new Set(prev);
        problems.forEach((p) => {
          if (Array.isArray(p?.topics)) {
            p.topics.forEach((t) => {
              if (t && typeof t === 'string' && t.trim()) {
                set.add(t.trim());
              }
            });
          }
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
      });
    }
  }, [problems]);

  const allTopics = useMemo(() => {
    const set = new Set(DEFAULT_DSA_TOPICS);
    (knownTopics || []).forEach((t) => set.add(t));
    if (Array.isArray(problems)) {
      problems.forEach((p) => {
        if (Array.isArray(p?.topics)) {
          p.topics.forEach((t) => {
            if (t && typeof t === 'string' && t.trim()) set.add(t.trim());
          });
        }
      });
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [knownTopics, problems]);

  // Pagination calculations
  const totalProblems = Array.isArray(problems) ? problems.length : 0;
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

    if (picked) {
      toast.success(`Picked: "${picked.title || 'Problem'}"`);
      navigate(`/problems/${picked.id || picked._id}`);
    }
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
              <h1 className="text-xl font-semibold tracking-tight text-text">Problems</h1>
              <span className="text-xs text-muted bg-surface-2 border border-line px-2.5 py-0.5 rounded-lg tabular-nums">
                {stats.total} total
              </span>

              {/* Quick Stat Chips — scrollable on mobile, inline on desktop */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
                <span className="inline-flex text-xs px-2.5 py-0.5 rounded-full bg-easy/12 border border-easy/25 text-easy shrink-0 tabular-nums">
                  ● {stats.easy} Easy
                </span>
                <span className="inline-flex text-xs px-2.5 py-0.5 rounded-full bg-medium/12 border border-medium/25 text-medium shrink-0 tabular-nums">
                  ● {stats.medium} Med
                </span>
                <span className="inline-flex text-xs px-2.5 py-0.5 rounded-full bg-hard/12 border border-hard/25 text-hard shrink-0 tabular-nums">
                  ● {stats.hard} Hard
                </span>
                <span className="inline-flex text-xs px-2.5 py-0.5 rounded-full bg-success/12 border border-success/25 text-success items-center gap-1 shrink-0 tabular-nums">
                  <CheckCircle2 className="w-3 h-3 text-success" />
                  {stats.solved} Solved
                </span>
              </div>
            </div>
            <p className="text-xs text-muted mt-1">
              Your centralized repository across topics, platforms, and difficulty tiers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* View toggle (desktop only) */}
            <div className="hidden sm:flex items-center gap-0.5 p-1 rounded-lg bg-surface-2 border border-line h-9">
              <button
                onClick={() => toggleView('table')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'table' ? 'bg-accent text-bg font-semibold shadow-xs' : 'text-muted hover:text-text'}`}
                title="Table view"
              >
                <TableIcon />
              </button>
              <button
                onClick={() => toggleView('grid')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-accent text-bg font-semibold shadow-xs' : 'text-muted hover:text-text'}`}
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
              <Dices className="w-3.5 h-3.5 text-accent" />
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

      {/* ── Unified Modern Command & Filter Toolbar (Compact 1-Row Desktop) ── */}
      <Reveal delay={50} y={12}>
        <div className="p-2.5 sm:p-3 border border-line bg-surface rounded-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 shadow-xs">
          {/* Search Bar with Shortcut Badge */}
          <div className="relative flex-1 min-w-[220px] max-w-full lg:max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center justify-center">
              <Search className="w-4 h-4" />
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems, topics, keywords..."
              className="w-full h-9 pl-10 pr-9 text-sm bg-surface-2 border border-line rounded-lg text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-text p-1 rounded hover:bg-surface-3 cursor-pointer transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-muted bg-surface-3 px-1.5 py-0.5 rounded border border-line pointer-events-none select-none">
                /
              </kbd>
            )}
          </div>

          {/* Inline Filter Cluster (Topic, Difficulty, Status, Reset) */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* Topic Filter Dropdown */}
            <div className="relative shrink-0">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                <Tag className="w-3 h-3" />
              </span>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="pl-7 pr-6 py-1 text-xs bg-surface-2 border border-line rounded-lg text-text focus:border-accent focus:outline-none appearance-none cursor-pointer h-7.5"
              >
                <option value="">All Topics ({(allTopics || []).length})</option>
                {(allTopics || []).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-[9px]">
                ▼
              </span>
            </div>

            {/* Difficulty Segmented Group */}
            <div className="flex items-center p-0.5 rounded-lg bg-surface-2 border border-line h-7.5 shrink-0">
              {[
                { value: '', label: 'All', active: 'bg-surface text-text font-semibold border-line shadow-xs' },
                { value: 'easy', label: 'Easy', active: 'bg-easy/15 text-easy border-easy/35 font-semibold shadow-xs' },
                { value: 'medium', label: 'Med', active: 'bg-medium/15 text-medium border-medium/35 font-semibold shadow-xs' },
                { value: 'hard', label: 'Hard', active: 'bg-hard/15 text-hard border-hard/35 font-semibold shadow-xs' },
              ].map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDifficulty(d.value)}
                  className={`text-xs px-2 py-0.5 rounded transition-all cursor-pointer ${
                    difficulty === d.value
                      ? d.active
                      : 'border-transparent text-muted hover:text-text'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Status Segmented Group */}
            <div className="flex items-center p-0.5 rounded-lg bg-surface-2 border border-line h-7.5 shrink-0">
              {[
                { value: '', label: 'All', active: 'bg-surface text-text font-semibold border-line shadow-xs' },
                { value: 'solved', label: 'Solved', active: 'bg-success/15 text-success border-success/35 font-semibold shadow-xs' },
                { value: 'struggled', label: 'Struggled', active: 'bg-danger/15 text-danger border-danger/35 font-semibold shadow-xs' },
                { value: 'revisit_needed', label: 'Revisit', active: 'bg-medium/15 text-medium border-medium/35 font-semibold shadow-xs' },
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={`text-xs px-2 py-0.5 rounded transition-all cursor-pointer ${
                    status === s.value
                      ? s.active
                      : 'border-transparent text-muted hover:text-text'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Reset Button */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-accent hover:text-accent-hover border border-accent/25 bg-accent/10 hover:bg-accent/20 h-7.5 px-2.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                title="Reset all filters"
              >
                <X className="w-3 h-3" />
                <span>Reset ({activeFilterCount})</span>
              </button>
            )}
          </div>
        </div>
      </Reveal>

      {/* ── Content: Mobile Cards / Desktop Table or Grid ──────────── */}
      {isMobile ? (
        /* Mobile: touch-first individual cards */
        isLoading ? (
          <MobileProblemSkeleton />
        ) : error ? (
          <div className="p-6 text-center border border-danger/25 bg-danger/10 rounded-xl">
            <p className="text-sm font-semibold text-danger">Unable to load problems</p>
            <p className="text-xs text-danger/80 mt-1">{error}</p>
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
              <Reveal key={p.id || p._id || idx} delay={Math.min(idx * 25, 180)} y={10}>
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
            <Reveal key={p.id || p._id || idx} delay={Math.min(idx * 30, 200)} y={12} className="h-full">
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
        <PaginationBar
          currentPage={currentPage}
          totalItems={totalProblems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="problems"
        />
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
