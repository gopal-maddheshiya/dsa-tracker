import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProblems } from '../../api/problems';
import {
  Search,
  Plus,
  LayoutDashboard,
  FolderOpen,
  Brain,
  User,
  ExternalLink,
  ChevronRight,
  Command,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Tag,
  ArrowRight,
  X
} from 'lucide-react';

/* ── Platform styling constants ────────────────────────────────────── */
const PLATFORMS = {
  leetcode:   { label: 'LeetCode',   bg: 'rgba(254,159,10,0.12)', border: 'rgba(254,159,10,0.3)', text: '#FE9F0A' },
  gfg:        { label: 'GFG',        bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', text: '#34D399' },
  hackerrank: { label: 'HackerRank', bg: 'rgba(46,189,89,0.12)',  border: 'rgba(46,189,89,0.3)',  text: '#2EBD59' },
  codeforces: { label: 'Codeforces', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)', text: '#38BDF8' },
  codechef:   { label: 'CodeChef',   bg: 'rgba(192,132,252,0.12)',border: 'rgba(192,132,252,0.3)',text: '#C084FC' },
  other:      { label: 'Custom',     bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)',text: '#9CA3AF' },
};

/* ── Difficulty styling constants ──────────────────────────────────── */
const DIFFICULTY_CONFIG = {
  Easy:   { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', dot: 'bg-emerald-400' },
  Medium: { text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/25',     dot: 'bg-amber-400' },
  Hard:   { text: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/25',       dot: 'bg-rose-400' },
};

const CommandPalette = ({ isOpen, onClose, onOpenQuickAdd }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const [query, setQuery] = useState('');
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fetch problems when palette opens
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
      return;
    }

    let isCancelled = false;
    const loadProblemsList = async () => {
      setIsLoading(true);
      try {
        const res = await fetchProblems({});
        if (!isCancelled) {
          setProblems(res?.data || []);
        }
      } catch (err) {
        console.error('Failed to load problems for command palette:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    loadProblemsList();

    // Auto-focus search input
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Static quick actions
  const quickActions = useMemo(() => [
    {
      id: 'action-new-problem',
      type: 'action',
      title: 'New Problem',
      subtitle: 'Catalog a problem, assign topics & set target difficulty',
      icon: Plus,
      badge: 'Create',
      shortcut: 'N',
      action: () => {
        onClose();
        if (onOpenQuickAdd) onOpenQuickAdd();
      }
    },
    {
      id: 'action-dashboard',
      type: 'action',
      title: 'Dashboard & Overview',
      subtitle: 'Velocity chart, solve rates, and heatmap overview',
      icon: LayoutDashboard,
      badge: 'Navigate',
      shortcut: 'D',
      action: () => {
        onClose();
        navigate('/dashboard');
      }
    },
    {
      id: 'action-problems',
      type: 'action',
      title: 'All Problems Catalog',
      subtitle: 'Browse full table with filters, search, and CSV export',
      icon: FolderOpen,
      badge: 'Catalog',
      shortcut: 'P',
      action: () => {
        onClose();
        navigate('/problems');
      }
    },
    {
      id: 'action-revision',
      type: 'action',
      title: 'Spaced Repetition Queue',
      subtitle: 'Smart recall queue ordered by priority and memory curve',
      icon: Brain,
      badge: 'Practice',
      shortcut: 'R',
      action: () => {
        onClose();
        navigate('/revision');
      }
    },
    {
      id: 'action-profile',
      type: 'action',
      title: 'Profile & Milestones',
      subtitle: 'Account analytics, milestones, 365-day grid, and settings',
      icon: User,
      badge: 'Settings',
      shortcut: 'U',
      action: () => {
        onClose();
        navigate('/profile');
      }
    }
  ], [navigate, onClose, onOpenQuickAdd]);

  // Filter items based on user query
  const filteredActions = useMemo(() => {
    if (!query.trim()) return quickActions;
    const q = query.toLowerCase().trim();
    return quickActions.filter(
      a => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)
    );
  }, [quickActions, query]);

  const filteredProblems = useMemo(() => {
    if (!problems.length) return [];
    if (!query.trim()) {
      // Return top 6 recent problems when no query is typed
      return problems.slice(0, 6);
    }
    const q = query.toLowerCase().trim();
    return problems.filter((p) => {
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchPlatform = p.platform?.toLowerCase().includes(q);
      const matchDiff = p.difficulty?.toLowerCase().includes(q);
      const matchTopics = Array.isArray(p.topics) && p.topics.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchPlatform || matchDiff || matchTopics;
    }).slice(0, 15);
  }, [problems, query]);

  // Combined selectable items list
  const allSelectableItems = useMemo(() => {
    const items = [];
    filteredActions.forEach(a => items.push({ kind: 'action', data: a }));
    filteredProblems.forEach(p => items.push({ kind: 'problem', data: p }));
    return items;
  }, [filteredActions, filteredProblems]);

  // Reset selected index if results change and selected index is out of bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Keyboard navigation inside the palette
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (allSelectableItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allSelectableItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allSelectableItems.length) % allSelectableItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const currentItem = allSelectableItems[selectedIndex];
      if (!currentItem) return;

      if (currentItem.kind === 'action') {
        currentItem.data.action();
      } else if (currentItem.kind === 'problem') {
        onClose();
        navigate(`/problems/${currentItem.data._id}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[#101216] border border-white/[0.14] shadow-[0_24px_64px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden flex flex-col max-h-[80vh] transition-all"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* ── Top Ambient Light Gradient ──────────────────────────── */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#F97316]/70 to-transparent pointer-events-none" />

        {/* ── Search Input Header ─────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-[#14171D]/90">
          <Search className="w-5 h-5 text-[#F97316] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems, topics, difficulty, or run actions..."
            className="flex-1 bg-transparent text-sm sm:text-base text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-[#6B7280] hover:text-[#9CA3AF] hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono text-[#9CA3AF] bg-white/[0.06] border border-white/[0.1] rounded-md">
            ESC
          </kbd>
        </div>

        {/* ── Results List ────────────────────────────────────────── */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-4 scroll-smooth">
          {isLoading && !problems.length ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-6 h-6 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#9CA3AF]">Scanning problem database...</p>
            </div>
          ) : allSelectableItems.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-[#6B7280]">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-[#D1D5DB]">No matching results</p>
              <p className="text-xs text-[#6B7280] mt-1">Try searching by problem title, topic tag (e.g. "DP", "Graph"), or platform.</p>
            </div>
          ) : (
            <>
              {/* ── Section: Quick Actions ──────────────────────────── */}
              {filteredActions.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280]">
                    Quick Actions
                  </div>
                  <div className="space-y-1 mt-1">
                    {filteredActions.map((action) => {
                      const itemGlobalIndex = allSelectableItems.findIndex(
                        (i) => i.kind === 'action' && i.data.id === action.id
                      );
                      const isSelected = itemGlobalIndex === selectedIndex;
                      const Icon = action.icon;

                      return (
                        <div
                          key={action.id}
                          data-active={isSelected}
                          onClick={() => action.action()}
                          onMouseEnter={() => setSelectedIndex(itemGlobalIndex)}
                          className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-orange-500/15 to-transparent border-l-2 border-[#F97316] text-[#F3F4F6]'
                              : 'text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#D1D5DB]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-xl border shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-[#F97316]/20 border-[#F97316]/40 text-[#F97316]'
                                : 'bg-white/[0.04] border-white/[0.08] text-[#9CA3AF]'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-[#F3F4F6] flex items-center gap-2">
                                <span>{action.title}</span>
                                <span className="text-[10px] font-mono font-normal px-1.5 py-0.2 rounded bg-white/[0.06] text-[#9CA3AF]">
                                  {action.badge}
                                </span>
                              </div>
                              <div className="text-[11px] text-[#6B7280] truncate mt-0.5">
                                {action.subtitle}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {action.shortcut && (
                              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[#6B7280] bg-[#0E1013] border border-white/[0.08] rounded">
                                {action.shortcut}
                              </kbd>
                            )}
                            <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-0.5 text-[#F97316]' : 'text-[#4B5563]'}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Section: Problems ───────────────────────────────── */}
              {filteredProblems.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280] flex items-center justify-between">
                    <span>{query.trim() ? 'Problem Results' : 'Recent Cataloged Problems'}</span>
                    <span className="text-[10px] font-mono text-[#6B7280]">{filteredProblems.length} {filteredProblems.length === 1 ? 'item' : 'items'}</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {filteredProblems.map((prob) => {
                      const itemGlobalIndex = allSelectableItems.findIndex(
                        (i) => i.kind === 'problem' && i.data._id === prob._id
                      );
                      const isSelected = itemGlobalIndex === selectedIndex;
                      const diffCfg = DIFFICULTY_CONFIG[prob.difficulty] || DIFFICULTY_CONFIG.Medium;
                      const platCfg = PLATFORMS[prob.platform?.toLowerCase()] || PLATFORMS.other;
                      const latestStatus = prob.latestAttempt?.status;

                      return (
                        <div
                          key={prob._id}
                          data-active={isSelected}
                          onClick={() => {
                            onClose();
                            navigate(`/problems/${prob._id}`);
                          }}
                          onMouseEnter={() => setSelectedIndex(itemGlobalIndex)}
                          className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-orange-500/15 to-transparent border-l-2 border-[#F97316] text-[#F3F4F6]'
                              : 'text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#D1D5DB]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Platform icon badge */}
                            <div
                              className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold shrink-0 border"
                              style={{
                                backgroundColor: platCfg.bg,
                                borderColor: platCfg.border,
                                color: platCfg.text,
                              }}
                            >
                              {platCfg.label}
                            </div>

                            {/* Title & tags */}
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-[#F3F4F6] truncate flex items-center gap-2">
                                <span className="truncate">{prob.title}</span>
                                {latestStatus === 'Solved' && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Solved" />
                                )}
                                {latestStatus === 'Revisit' && (
                                  <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" title="Needs Revisit" />
                                )}
                                {latestStatus === 'Struggled' && (
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" title="Struggled" />
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 mt-1 overflow-hidden">
                                {Array.isArray(prob.topics) && prob.topics.slice(0, 2).map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] font-mono text-[#9CA3AF] bg-white/[0.05] px-1.5 py-0.2 rounded border border-white/[0.06] shrink-0"
                                  >
                                    #{t}
                                  </span>
                                ))}
                                {Array.isArray(prob.topics) && prob.topics.length > 2 && (
                                  <span className="text-[10px] font-mono text-[#6B7280]">
                                    +{prob.topics.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Difficulty pill + Jump arrow */}
                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-lg border ${diffCfg.text} ${diffCfg.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${diffCfg.dot}`} />
                              <span>{prob.difficulty}</span>
                            </span>

                            <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-1 text-[#F97316]' : 'text-[#4B5563]'}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Keyboard Hints Footer Ribbon ────────────────────────── */}
        <div className="px-4 py-2.5 border-t border-white/[0.08] bg-[#0D0F13] flex items-center justify-between text-[11px] text-[#6B7280] font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[#9CA3AF]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[#9CA3AF]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[#9CA3AF]">↵</kbd>
              <span>to select</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[#9CA3AF]">
            <span>Tip: Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[#F97316] font-semibold">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[#F97316] font-semibold">K</kbd>
            <span>anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
