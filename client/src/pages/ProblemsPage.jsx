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
const MobileProblemCard = ({ problem, onEdit, onDelete, onLog }) => {
  const diff = DIFF_STYLE[problem.difficulty] || { text: 'text-muted', bg: 'bg-surface-2 border-line', dot: 'bg-muted' };
  const latestStatus = problem.latestAttempt?.status;
  const statusCfg = latestStatus ? STATUS_CFG[latestStatus] : null;
  const platform = PLATFORM_LABELS[problem.platform] || PLATFORM_LABELS.other;

  return (
    <div className="p-4 bg-surface border border-line flex flex-col gap-3 rounded-xl transition-all duration-150">
      {/* Top row: Difficulty + Platform on left, Status on right */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${diff.text} ${diff.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
            <span>{problem.difficulty}</span>
          </span>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border ${platform.style}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${platform.dot}`} />
            <span>{platform.short}</span>
          </span>
        </div>

        {statusCfg ? (
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            <span className="text-xs font-semibold">{statusCfg.label}</span>
          </div>
        ) : (
          <span className="text-xs text-muted px-2 py-0.5 rounded-md bg-surface-2 border border-line">
            Unattempted
          </span>
        )}
      </div>

      {/* Middle row: Problem Title + External Link */}
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/problems/${problem.id || problem._id}`}
          className="text-sm font-semibold text-text leading-snug line-clamp-2 hover:text-accent active:text-accent transition-colors"
        >
          {problem.title}
        </Link>
        {problem.link && (
          <a
            href={problem.link}
            target="_blank"
            rel="noreferrer"
            className="p-1 text-muted hover:text-accent active:text-accent shrink-0"
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
              className="text-xs font-mono px-2 py-0.5 rounded-md bg-surface-2 border border-line text-text-secondary"
            >
              #{t}
            </span>
          ))}
          {(problem.topics?.length || 0) > 3 && (
            <span className="text-xs font-mono px-1.5 py-0.5 rounded-md bg-surface-2 border border-line text-muted">
              +{problem.topics.length - 3}
            </span>
          )}
        </div>

        <span className="text-xs text-muted tabular-nums">
          {problem.attemptCount > 0 ? `${problem.attemptCount} attempt${problem.attemptCount > 1 ? 's' : ''}` : 'No attempts'}
        </span>
      </div>

      {/* Bottom actions row */}
      <div className="flex items-center gap-2 pt-2.5 border-t border-line">
        {onLog && (
          <button
            onClick={() => onLog(problem)}
            className="flex-1 h-9 flex items-center justify-center gap-1.5 px-3 rounded-lg text-xs font-semibold bg-success/10 text-success border border-success/25 hover:bg-success/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Log Attempt</span>
          </button>
        )}

        <Link
          to={`/problems/${problem.id || problem._id}`}
          aria-label="View problem details"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-2 text-muted border border-line hover:text-text transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={() => onEdit(problem)}
          aria-label="Edit problem"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-2 text-muted border border-line hover:text-medium transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onDelete(problem)}
          aria-label="Delete problem"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-danger/10 text-danger border border-danger/25 hover:bg-danger/20 transition-colors cursor-pointer"
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
      <div key={i} className="p-4 bg-surface border border-line space-y-3 animate-pulse rounded-xl">
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-surface-2 rounded-md" />
          <div className="h-4 w-16 bg-surface-2 rounded-md" />
        </div>
        <div className="h-4 w-4/5 bg-surface-2 rounded-md" />
        <div className="flex gap-1.5">
          <div className="h-3 w-12 bg-surface-2 rounded-md" />
          <div className="h-3 w-14 bg-surface-2 rounded-md" />
        </div>
        <div className="pt-2 border-t border-line flex gap-2">
          <div className="h-8 flex-1 bg-surface-2 rounded-lg" />
          <div className="h-8 w-8 bg-surface-2 rounded-lg" />
          <div className="h-8 w-8 bg-surface-2 rounded-lg" />
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
          <span className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${diff.text} ${diff.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
            <span>{problem.difficulty}</span>
          </span>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border ${platform.style}`} title={platform.label}>
            <span className={`w-1.5 h-1.5 rounded-full ${platform.dot}`} />
            <span>{platform.short}</span>
          </span>
        </div>

        {statusCfg ? (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
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

      {/* ── Unified Modern Command & Filter Toolbar ────────────────── */}
      <Reveal delay={50} y={12}>
        <div className="p-3.5 sm:p-4 border border-line bg-surface space-y-3 rounded-xl">
          {/* Top Row: Search Title + Topic Filter + Reset */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-center">
            {/* Search Title */}
            <div className="md:col-span-6 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problems by title, keywords... (Press / to focus)"
                className="input pl-9.5 pr-8 py-2 text-xs sm:text-sm w-full bg-surface-2 border border-line rounded-lg text-text placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-text p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Topic Filter Dropdown */}
            <div className="md:col-span-4 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                <Tag className="w-3.5 h-3.5" />
              </span>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input pl-9 pr-8 py-2 text-xs sm:text-sm w-full bg-surface-2 border border-line rounded-lg text-text focus:border-accent focus:ring-1 focus:ring-accent appearance-none cursor-pointer"
              >
                <option value="">All Topics ({(allTopics || []).length})</option>
                {(allTopics || []).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-xs">
                ▼
              </span>
            </div>

            {/* Quick Reset / Filter count Indicator */}
            <div className="md:col-span-2 flex items-center justify-end gap-2">
              {activeFilterCount > 0 ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-accent hover:text-accent-hover border border-accent/20 bg-accent/10 hover:bg-accent/20 py-1.5 px-2.5 rounded-lg flex items-center gap-1.5 w-full justify-center sm:w-auto transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Reset ({activeFilterCount})</span>
                </button>
              ) : (
                <span className="text-xs text-muted hidden md:inline">
                  No active filters
                </span>
              )}
            </div>
          </div>

          {/* Bottom Row: Difficulty & Status Quick Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-line">
            {/* Difficulty Segmented Control */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-xs font-medium text-text-secondary shrink-0 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-muted" />
                <span>Difficulty:</span>
              </span>
              <div className="flex items-center p-0.5 rounded-lg bg-surface-2 border border-line shrink-0">
                {[
                  { value: '', label: 'All', active: 'bg-surface text-text font-semibold border-line shadow-xs' },
                  { value: 'easy', label: 'Easy', active: 'bg-easy/15 text-easy border-easy/35 font-semibold shadow-xs' },
                  { value: 'medium', label: 'Medium', active: 'bg-medium/15 text-medium border-medium/35 font-semibold shadow-xs' },
                  { value: 'hard', label: 'Hard', active: 'bg-hard/15 text-hard border-hard/35 font-semibold shadow-xs' },
                ].map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDifficulty(d.value)}
                    className={`text-xs px-2.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                      difficulty === d.value
                        ? d.active
                        : 'border-transparent text-muted hover:text-text hover:bg-surface'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Segmented Control */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-xs font-medium text-text-secondary shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-muted" />
                <span>Status:</span>
              </span>
              <div className="flex items-center p-0.5 rounded-lg bg-surface-2 border border-line shrink-0">
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
                    className={`text-xs px-2.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                      status === s.value
                        ? s.active
                        : 'border-transparent text-muted hover:text-text hover:bg-surface'
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
        <div className="p-3 sm:px-4 sm:py-3 border border-line bg-surface rounded-xl space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4 overflow-hidden">
          {/* Mobile Top Row / Desktop Left: Range Info & Mobile Page Size */}
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="text-muted text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
              <span className="text-muted">
                <span className="hidden sm:inline">Showing </span>
                <strong className="text-text font-semibold tabular-nums">
                  {pageSize === 'all' ? 1 : Math.min((currentPage - 1) * pageSize + 1, totalProblems)}–{pageSize === 'all' ? totalProblems : Math.min(currentPage * pageSize, totalProblems)}
                </strong>
                <span className="text-muted"> of </span>
                <strong className="text-text font-semibold tabular-nums">{totalProblems}</strong>
                <span className="hidden md:inline text-muted"> problems</span>
              </span>
            </div>

            {/* Mobile-only compact Page Size selector */}
            <div className="sm:hidden flex items-center p-0.5 rounded-lg bg-surface-2 border border-line shrink-0">
              {[10, 25, 50, 'all'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  className={`h-6 px-2 flex items-center justify-center text-xs rounded-md transition-all cursor-pointer ${
                    pageSize === size
                      ? 'bg-surface text-text font-semibold border border-line shadow-xs'
                      : 'text-muted hover:text-text'
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
                className="btn-secondary h-8 px-3 rounded-lg disabled:opacity-25 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs font-semibold"
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
                    className={`w-7 h-7 rounded-lg text-xs tabular-nums flex items-center justify-center transition-all cursor-pointer ${
                      currentPage === p
                        ? 'bg-accent text-bg font-semibold'
                        : 'bg-surface-2 border border-line text-muted hover:text-text hover:bg-surface-2/80'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Mobile / Tablet: Prominent Page Counter */}
              <div className="md:hidden px-3.5 h-8 flex items-center justify-center text-xs font-semibold text-text bg-surface-2 border border-line rounded-lg min-w-[70px] tabular-nums">
                <span className="text-text">{currentPage}</span>
                <span className="text-muted mx-1.5 font-normal">of</span>
                <span className="text-muted">{totalPages}</span>
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn-secondary h-8 px-3 rounded-lg disabled:opacity-25 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs font-semibold"
                title="Next Page"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Desktop Right: Per page selector */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted uppercase tracking-wide hidden lg:inline">Per page:</span>
            <div className="h-8 flex items-center p-0.5 rounded-lg bg-surface-2 border border-line">
              {[10, 25, 50, 'all'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  className={`h-7 px-2 sm:px-2.5 flex items-center justify-center text-xs rounded-md transition-all cursor-pointer ${
                    pageSize === size
                      ? 'bg-surface text-text font-semibold border border-line shadow-xs'
                      : 'text-muted hover:text-text'
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
