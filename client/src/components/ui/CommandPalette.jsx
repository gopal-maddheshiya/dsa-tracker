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
  leetcode:   { label: 'LeetCode',   style: 'bg-accent/12 border-accent/25 text-accent' },
  gfg:        { label: 'GFG',        style: 'bg-easy/12 border-easy/25 text-easy' },
  hackerrank: { label: 'HackerRank', style: 'bg-success/12 border-success/25 text-success' },
  codeforces: { label: 'Codeforces', style: 'bg-surface-2 border-line text-text' },
  codechef:   { label: 'CodeChef',   style: 'bg-medium/12 border-medium/25 text-medium' },
  other:      { label: 'Custom',     style: 'bg-surface-2 border-line text-muted' },
};

/* ── Difficulty styling constants ──────────────────────────────────── */
const DIFFICULTY_CONFIG = {
  easy:   { text: 'text-easy',   bg: 'bg-easy/12 border-easy/25',     dot: 'bg-easy' },
  medium: { text: 'text-medium', bg: 'bg-medium/12 border-medium/25', dot: 'bg-medium' },
  hard:   { text: 'text-hard',   bg: 'bg-hard/12 border-hard/25',     dot: 'bg-hard' },
  Easy:   { text: 'text-easy',   bg: 'bg-easy/12 border-easy/25',     dot: 'bg-easy' },
  Medium: { text: 'text-medium', bg: 'bg-medium/12 border-medium/25', dot: 'bg-medium' },
  Hard:   { text: 'text-hard',   bg: 'bg-hard/12 border-hard/25',     dot: 'bg-hard' },
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
        const targetId = currentItem.data.id || currentItem.data._id;
        navigate(`/problems/${targetId}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4 bg-black/70 animate-fadeIn"
      onClick={onClose}
    >
      <div
        data-lenis-prevent
        className="relative w-full max-w-2xl rounded-xl bg-surface border border-line shadow-modal overflow-hidden flex flex-col max-h-[80vh] transition-all"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* ── Search Input Header ─────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line bg-surface-2">
          <Search className="w-5 h-5 text-accent shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems, topics, difficulty, or run actions..."
            className="flex-1 bg-transparent text-sm text-text placeholder:text-muted focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-muted hover:text-text hover:bg-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono text-muted bg-surface border border-line rounded-md">
            ESC
          </kbd>
        </div>

        {/* ── Results List ────────────────────────────────────────── */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-4 scroll-smooth">
          {isLoading && !problems.length ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-muted">Scanning problem database...</p>
            </div>
          ) : allSelectableItems.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-surface-2 border border-line flex items-center justify-center mx-auto mb-3 text-muted">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-text">No matching results</p>
              <p className="text-xs text-muted mt-1">Try searching by problem title, topic tag (e.g. "DP", "Graph"), or platform.</p>
            </div>
          ) : (
            <>
              {/* ── Section: Quick Actions ──────────────────────────── */}
              {filteredActions.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
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
                          className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-surface-2 border-l-2 border-accent text-text'
                              : 'text-text-secondary hover:bg-surface-2 hover:text-text'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-lg border shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-accent/15 border-accent/30 text-accent'
                                : 'bg-surface-2 border-line text-muted'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-text flex items-center gap-2">
                                <span>{action.title}</span>
                                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-surface border border-line text-text-secondary">
                                  {action.badge}
                                </span>
                              </div>
                              <div className="text-xs text-muted truncate mt-0.5">
                                {action.subtitle}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {action.shortcut && (
                              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs font-mono text-muted bg-surface border border-line rounded">
                                {action.shortcut}
                              </kbd>
                            )}
                            <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-0.5 text-accent' : 'text-muted'}`} />
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
                  <div className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-text-secondary flex items-center justify-between">
                    <span>{query.trim() ? 'Problem Results' : 'Recent Cataloged Problems'}</span>
                    <span className="text-xs text-muted">{filteredProblems.length} {filteredProblems.length === 1 ? 'item' : 'items'}</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {filteredProblems.map((prob) => {
                      const probId = prob.id || prob._id;
                      const itemGlobalIndex = allSelectableItems.findIndex(
                        (i) => i.kind === 'problem' && (i.data.id || i.data._id) === probId
                      );
                      const isSelected = itemGlobalIndex === selectedIndex;
                      const diffKey = prob.difficulty?.toLowerCase() || 'medium';
                      const diffCfg = DIFFICULTY_CONFIG[diffKey] || DIFFICULTY_CONFIG.medium;
                      const platCfg = PLATFORMS[prob.platform?.toLowerCase()] || PLATFORMS.other;
                      const latestStatus = prob.latestAttempt?.status?.toLowerCase();

                      return (
                        <div
                          key={probId}
                          data-active={isSelected}
                          onClick={() => {
                            onClose();
                            navigate(`/problems/${probId}`);
                          }}
                          onMouseEnter={() => setSelectedIndex(itemGlobalIndex)}
                          className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-surface-2 border-l-2 border-accent text-text'
                              : 'text-text-secondary hover:bg-surface-2 hover:text-text'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Platform badge */}
                            <div className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 border ${platCfg.style}`}>
                              {platCfg.label}
                            </div>

                            {/* Title & tags */}
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-text truncate flex items-center gap-2">
                                <span className="truncate">{prob.title}</span>
                                {latestStatus === 'solved' && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" title="Solved" />
                                )}
                                {(latestStatus === 'revisit_needed' || latestStatus === 'revisit') && (
                                  <RotateCcw className="w-3.5 h-3.5 text-medium shrink-0" title="Needs Revisit" />
                                )}
                                {latestStatus === 'struggled' && (
                                  <AlertCircle className="w-3.5 h-3.5 text-danger shrink-0" title="Struggled" />
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 mt-1 overflow-hidden">
                                {Array.isArray(prob.topics) && prob.topics.slice(0, 2).map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs font-mono text-text-secondary bg-surface px-1.5 py-0.5 rounded border border-line shrink-0"
                                  >
                                    #{t}
                                  </span>
                                ))}
                                {Array.isArray(prob.topics) && prob.topics.length > 2 && (
                                  <span className="text-xs font-mono text-muted">
                                    +{prob.topics.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Difficulty pill + Jump arrow */}
                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${diffCfg.text} ${diffCfg.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${diffCfg.dot}`} />
                              <span>{prob.difficulty}</span>
                            </span>

                            <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-1 text-accent' : 'text-muted'}`} />
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
        <div className="px-4 py-2.5 border-t border-line bg-surface-2 flex items-center justify-between text-xs text-text-secondary">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line text-text-secondary">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line text-text-secondary">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line text-text-secondary">↵</kbd>
              <span>to select</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-text-secondary">
            <span>Tip: Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line text-accent font-semibold">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line text-accent font-semibold">K</kbd>
            <span>anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
