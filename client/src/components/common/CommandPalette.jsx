import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  FolderCode,
  RotateCw,
  BarChart2,
  User,
  Settings,
  Plus,
  Sun,
  Moon,
  Flame,
  Clock,
  ArrowRight,
  Command,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { problemsApi } from '../../api/problems.api.js';

/**
 * CommandPalette: Raycast / Linear style universal floating command palette.
 * Supports keyboard navigation, quick routes, action triggers, and live problem search.
 */
export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchedProblems, setSearchedProblems] = useState([]);
  const [isSearchingProblems, setIsSearchingProblems] = useState(false);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Reset query and selected index whenever palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setSearchedProblems([]);
      // Lock background scroll
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Auto-focus input
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Static Navigation and Action Definitions
  const staticItems = useMemo(() => {
    return [
      // Section: Navigation
      {
        id: 'nav-dashboard',
        section: 'Navigation',
        title: 'Dashboard',
        subtitle: 'Activity cockpit, streaks and overview',
        icon: LayoutDashboard,
        shortcut: 'G D',
        path: '/dashboard',
      },
      {
        id: 'nav-problems',
        section: 'Navigation',
        title: 'Problems Repository',
        subtitle: 'All tracked coding problems',
        icon: FolderCode,
        shortcut: 'G P',
        path: '/problems',
      },
      {
        id: 'nav-revision',
        section: 'Navigation',
        title: 'Spaced Repetition Queue',
        subtitle: 'Due reviews and Leitner schedule',
        icon: RotateCw,
        shortcut: 'G R',
        path: '/revision',
      },
      {
        id: 'nav-analytics',
        section: 'Navigation',
        title: 'Analytics & Trends',
        subtitle: 'Topic weaknesses and solve velocity',
        icon: BarChart2,
        shortcut: 'G A',
        path: '/analytics',
      },
      {
        id: 'nav-profile',
        section: 'Navigation',
        title: 'Developer Profile',
        subtitle: 'User account and public statistics',
        icon: User,
        shortcut: 'G U',
        path: '/profile',
      },
      {
        id: 'nav-settings',
        section: 'Navigation',
        title: 'Settings & Preferences',
        subtitle: 'Account settings, notification preferences',
        icon: Settings,
        shortcut: 'G S',
        path: '/settings',
      },

      // Section: Quick Actions
      {
        id: 'action-add-problem',
        section: 'Quick Actions',
        title: 'Add New Problem',
        subtitle: 'Track a problem from LeetCode, GFG, etc.',
        icon: Plus,
        shortcut: 'N',
        path: '/problems?action=add',
      },
      {
        id: 'action-toggle-theme',
        section: 'Quick Actions',
        title: theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme',
        subtitle: 'Toggle between Dark Obsidian and Studio Light',
        icon: theme === 'dark' ? Sun : Moon,
        shortcut: 'T',
        action: toggleTheme,
      },
      {
        id: 'action-due-revision',
        section: 'Quick Actions',
        title: 'View Urgent Revisions',
        subtitle: 'Filter spaced repetition problems due now',
        icon: Clock,
        shortcut: 'D',
        path: '/revision',
      },
      {
        id: 'action-stale-problems',
        section: 'Quick Actions',
        title: 'Filter Stale Problems',
        subtitle: 'Problems not reviewed in over 30 days',
        icon: Flame,
        path: '/problems?status=stale',
      },
    ];
  }, [theme, toggleTheme]);

  // Live search for problems when user types 2+ characters
  useEffect(() => {
    if (!isOpen || query.trim().length < 2) {
      setSearchedProblems([]);
      setIsSearchingProblems(false);
      return;
    }

    let isCancelled = false;
    setIsSearchingProblems(true);

    const debounceTimer = setTimeout(async () => {
      try {
        const res = await problemsApi.getProblems({ search: query.trim() });
        if (!isCancelled) {
          const list = res.data?.problems || res.data || [];
          setSearchedProblems(list.slice(0, 5));
        }
      } catch {
        if (!isCancelled) setSearchedProblems([]);
      } finally {
        if (!isCancelled) setIsSearchingProblems(false);
      }
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(debounceTimer);
    };
  }, [isOpen, query]);

  // Filter static items by search query
  const filteredStaticItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staticItems;
    return staticItems.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.section.toLowerCase().includes(q)
      );
    });
  }, [query, staticItems]);

  // Combine static filtered items with dynamic problem results
  const allDisplayItems = useMemo(() => {
    const problemItems = searchedProblems.map((prob) => ({
      id: `problem-${prob._id || prob.id}`,
      section: 'Matching Problems',
      title: prob.title,
      subtitle: `${prob.platform || 'LeetCode'} · ${Array.isArray(prob.topics) ? prob.topics.slice(0, 2).join(', ') : 'DSA'}`,
      difficulty: prob.difficulty,
      icon: FolderCode,
      path: `/problems/${prob._id || prob.id}`,
    }));

    return [...filteredStaticItems, ...problemItems];
  }, [filteredStaticItems, searchedProblems]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex((prev) => {
      if (allDisplayItems.length === 0) return 0;
      return Math.min(prev, allDisplayItems.length - 1);
    });
  }, [allDisplayItems.length]);

  // Execute selected item
  const executeItem = useCallback(
    (item) => {
      if (!item) return;
      if (item.action) {
        item.action();
      } else if (item.path) {
        navigate(item.path);
      }
      onClose();
    },
    [navigate, onClose]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, allDisplayItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev <= 0 ? Math.max(0, allDisplayItems.length - 1) : prev - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allDisplayItems[selectedIndex]) {
          executeItem(allDisplayItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [isOpen, allDisplayItems, selectedIndex, executeItem, onClose]
  );

  // Ensure active element is scrolled into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4 bg-black/60 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      {/* Floating Modal Panel */}
      <div
        className="w-full max-w-2xl bg-surface border border-line rounded-2xl specular-card shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_24px_64px_-12px_rgba(0,0,0,0.65)] overflow-hidden flex flex-col max-h-[80vh] transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-line">
          <Search className="w-5 h-5 text-accent shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, route, or problem title..."
            className="w-full bg-transparent border-none text-sm sm:text-base text-text placeholder-muted focus:outline-none"
            aria-autocomplete="list"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-muted hover:text-text px-1.5 py-0.5 rounded bg-surface-2"
            >
              Clear
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium text-muted bg-surface-2 border border-line rounded-md">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto p-2 space-y-1 max-h-[420px] scrollbar-thin">
          {allDisplayItems.length === 0 ? (
            <div className="py-12 text-center text-muted text-xs">
              {isSearchingProblems ? 'Searching problems...' : `No matching commands or problems for "${query}"`}
            </div>
          ) : (
            allDisplayItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon || FolderCode;
              const showSectionHeader =
                index === 0 || allDisplayItems[index - 1].section !== item.section;

              return (
                <React.Fragment key={item.id}>
                  {showSectionHeader && (
                    <div className="px-3 pt-2.5 pb-1 text-[10px] font-mono uppercase tracking-wider text-muted font-semibold">
                      {item.section}
                    </div>
                  )}

                  <div
                    data-selected={isSelected}
                    onClick={() => executeItem(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-accent/10 border-l-2 border-accent text-text'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-accent text-white shadow-xs'
                            : 'bg-surface-2 text-text-secondary'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-medium text-text truncate flex items-center gap-2">
                          <span>{item.title}</span>
                          {item.difficulty && (
                            <span
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                                item.difficulty === 'easy'
                                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                                  : item.difficulty === 'medium'
                                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                                  : 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                              }`}
                            >
                              {item.difficulty}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted truncate">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {item.shortcut && (
                        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-muted bg-surface-2 border border-line rounded">
                          {item.shortcut}
                        </kbd>
                      )}
                      <ArrowRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isSelected ? 'text-accent translate-x-0.5' : 'text-muted/40'
                        }`}
                      />
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Navigation Hints */}
        <div className="px-4 py-2.5 bg-surface-2/60 border-t border-line flex items-center justify-between text-[11px] font-mono text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line text-[9px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line text-[9px]">↓</kbd>
              <span className="text-[10px]">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line text-[9px]">↵</kbd>
              <span className="text-[10px]">Select</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Command className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-sans">DSA Tracker Universal Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
}
