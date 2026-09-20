import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchProfileAnalytics, fetchRevisionQueue } from '../../api/analytics';
import InstallAppBanner from './InstallAppBanner';
import ProblemForm from '../ProblemForm';
import CommandPalette from '../ui/CommandPalette';
import BrandLogo from '../ui/BrandLogo';
import {
  LayoutDashboard,
  Code2,
  Repeat,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Flame,
  Search,
  Plus,
  X,
} from 'lucide-react';
import { scrollToTop } from '../common/SmoothScroll';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/problems', label: 'Problems', Icon: Code2 },
  { to: '/revision', label: 'Revision', Icon: Repeat },
  { to: '/profile', label: 'Profile', Icon: User },
];

/* ── User Profile Popover Menu (Desktop & Mobile) ───────────────────── */
const UserMenuDropdown = ({ isOpen, onClose, user, initials, streak, revisionCount, onLogout }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Clickable Backdrop: Soft blur & dim on mobile, transparent click-catcher on desktop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs sm:bg-black/10 transition-opacity animate-in fade-in duration-150"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-hidden="true"
      />

      {/* Floating Popover Card */}
      <div
        ref={dropdownRef}
        className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-80 rounded-2xl bg-surface/98 backdrop-blur-2xl border border-line shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 select-none max-w-sm mx-auto sm:mx-0"
      >
        {/* User Info Header with Close (X) button */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-2/60 border border-line/50 mb-2.5">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-xl object-cover border border-line shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-surface-2 border border-line flex items-center justify-center text-sm font-bold text-accent shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text truncate">
              {user?.name || 'DSA Learner'}
            </p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>
          {/* Explicit Close Button for Mobile & Desktop */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer shrink-0"
            aria-label="Close menu"
            title="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-2 p-2 rounded-xl bg-accent/10 border border-accent/20 hover:bg-accent/15 transition-colors"
          >
            <Flame className="w-4 h-4 text-accent shrink-0" />
            <div className="min-w-0">
              <span className="block text-[10px] uppercase tracking-wider text-muted font-medium">Streak</span>
              <span className="block text-xs font-bold text-accent tabular-nums">
                {streak != null && streak > 0 ? `${streak} Days` : '1 Day'}
              </span>
            </div>
          </NavLink>

          <NavLink
            to="/revision"
            onClick={onClose}
            className="flex items-center gap-2 p-2 rounded-xl bg-surface-2/80 border border-line/60 hover:bg-surface-2 transition-colors"
          >
            <Repeat className="w-4 h-4 text-easy shrink-0" />
            <div className="min-w-0">
              <span className="block text-[10px] uppercase tracking-wider text-muted font-medium">Revision</span>
              <span className="block text-xs font-bold text-text tabular-nums">
                {revisionCount > 0 ? `${revisionCount} Due` : 'Caught Up'}
              </span>
            </div>
          </NavLink>
        </div>

        {/* Menu Links */}
        <div className="space-y-1 border-t border-line/60 pt-2 mb-2">
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-colors active:scale-98"
          >
            <User className="w-4 h-4 text-muted" />
            <span>Profile & Analytics</span>
          </NavLink>
          <NavLink
            to="/problems"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-colors active:scale-98"
          >
            <Code2 className="w-4 h-4 text-muted" />
            <span>Problem Catalog</span>
          </NavLink>
          <NavLink
            to="/revision"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-colors active:scale-98"
          >
            <Repeat className="w-4 h-4 text-muted" />
            <span>Spaced Repetition Queue</span>
          </NavLink>
        </div>

        {/* Sign Out Button */}
        <div className="border-t border-line/60 pt-2">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-medium text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

/* ── Sidebar component (Desktop) ────────────────────────────────────── */
const Sidebar = ({ collapsed, onToggle, streak, revisionCount, onLogout }) => {
  const { user } = useAuth();

  // Derive initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const SideNavLink = ({ to, label, Icon: NavIcon }) => {
    const isRevision = label === 'Revision';
    const badge = isRevision ? revisionCount : 0;

    return (
      <NavLink
        to={to}
        className={({ isActive }) => `
          group relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm
          transition-all duration-150 select-none
          ${isActive
            ? 'bg-surface-2/90 text-accent border border-line/80 font-medium shadow-xs'
            : 'text-text-secondary hover:text-text hover:bg-surface-2/60 border border-transparent'
          }
        `}
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-accent nav-active-glow" />
            )}
            <span className={`shrink-0 ${isActive ? 'text-accent' : 'text-text-secondary group-hover:text-text'} transition-colors`}>
              <NavIcon className="w-4 h-4" />
            </span>
            {!collapsed ? (
              <>
                <span className="truncate flex-1">{label}</span>
                {badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-accent text-bg tabular-nums shadow-xs">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </>
            ) : (
              <>
                {badge > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent nav-active-glow" />
                )}
                <span className="pointer-events-none absolute left-full ml-2.5 px-2.5 py-1 rounded-md bg-surface-2 text-text text-xs font-semibold whitespace-nowrap shadow-dropdown border border-line opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50">
                  {label}{badge > 0 ? ` (${badge})` : ''}
                </span>
              </>
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <aside
      className={`
        flex flex-col h-full bg-surface border-r border-line/70
        transition-all duration-200 ease-in-out select-none
        ${collapsed ? 'w-[68px] overflow-visible' : 'w-[244px] overflow-hidden'}
      `}
    >
      {/* ── Logo ──────────────────────────────── */}
      <div className="flex items-center h-14 sm:h-[60px] px-3.5 border-b border-line/70 shrink-0">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <BrandLogo size="md" showText={!collapsed} />
        </NavLink>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto p-1.5 rounded-lg text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Nav ───────────────────────────────── */}
      <nav className={`flex-1 p-2.5 space-y-1.5 ${collapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
        {collapsed ? (
          <button
            onClick={onToggle}
            className="group relative w-full flex items-center justify-center p-2 mb-2 rounded-xl text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
            <span className="pointer-events-none absolute left-full ml-2.5 px-2.5 py-1 rounded-md bg-surface-2 text-text text-xs font-semibold whitespace-nowrap shadow-dropdown border border-line opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50">
              Expand sidebar
            </span>
          </button>
        ) : (
          <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Workspace
          </p>
        )}
        {NAV_LINKS.map(({ to, label, Icon: NavIcon }) => (
          <SideNavLink key={to} to={to} label={label} Icon={NavIcon} />
        ))}
      </nav>

      {/* ── Streak strip ──────────────────────── */}
      {!collapsed ? (
        <NavLink
          to="/profile"
          className="mx-2.5 mb-2.5 p-2.5 rounded-xl bg-surface-2/70 border border-line/70 hover:border-accent/40 transition-all block group shrink-0 hover:bg-surface-2"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium text-muted uppercase tracking-wider">Practice Streak</p>
              <p className="text-xs font-semibold text-text tabular-nums flex items-center gap-1.5">
                <span>{streak != null && streak > 0 ? `${streak} day${streak !== 1 ? 's' : ''}` : 'Daily Practice'}</span>
              </p>
            </div>
          </div>
        </NavLink>
      ) : (
        streak != null && streak > 0 && (
          <NavLink
            to="/profile"
            className="group relative mx-auto mb-2 w-9 h-9 rounded-xl bg-accent/12 border border-accent/25 flex items-center justify-center text-accent hover:bg-accent/20 transition-colors shrink-0"
            aria-label={`${streak} day streak`}
          >
            <Flame className="w-4 h-4 text-accent" />
            <span className="pointer-events-none absolute left-full ml-2.5 px-2.5 py-1 rounded-md bg-surface-2 text-text text-xs font-semibold whitespace-nowrap shadow-dropdown border border-line opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50">
              {streak} day streak
            </span>
          </NavLink>
        )
      )}

      {/* ── User footer ───────────────────────── */}
      <div className={`shrink-0 border-t border-line/70 p-2.5 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {collapsed ? (
          <>
            <NavLink
              to="/profile"
              className="group relative cursor-pointer"
              aria-label="View Profile"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg object-cover border border-line/80 group-hover:border-accent transition-colors" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-surface-2 border border-line/80 flex items-center justify-center text-xs font-semibold text-text-secondary group-hover:text-text transition-colors">
                  {initials}
                </div>
              )}
              <span className="pointer-events-none absolute left-full ml-2.5 px-2.5 py-1 rounded-md bg-surface-2 text-text text-xs font-semibold whitespace-nowrap shadow-dropdown border border-line opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50">
                {user?.name || 'Profile'}
              </span>
            </NavLink>
            <button
              onClick={onLogout}
              className="group relative p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="pointer-events-none absolute left-full ml-2.5 px-2.5 py-1 rounded-md bg-surface-2 text-text text-xs font-semibold whitespace-nowrap shadow-dropdown border border-line opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50">
                Sign out
              </span>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2.5 p-1 rounded-xl bg-surface-2/40 border border-line/40">
            <NavLink to="/profile" className="flex items-center gap-2.5 min-w-0 flex-1 group">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg object-cover border border-line/80 group-hover:border-accent transition-colors shrink-0" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-surface-2 border border-line/80 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-text-secondary group-hover:text-accent transition-colors">{initials}</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-text truncate group-hover:text-accent transition-colors">
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] text-muted truncate">{user?.email}</p>
              </div>
            </NavLink>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors shrink-0 cursor-pointer"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

/* ── AppShell — top-level layout wrapper ─────────────────────────── */
const AppShell = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Desktop collapse state (persisted)
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === 'true'; } catch { return false; }
  });

  const [streak, setStreak] = useState(null);
  const [revisionCount, setRevisionCount] = useState(0);

  // Quick Problem Creation modal state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Command Palette spotlight modal state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // User Profile Dropdown Popover state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Close user dropdown on route change
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Live streak & revision count fetch on mount/auth (and event-driven upon problem updates)
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileAnalytics()
        .then((res) => {
          if (res?.data?.currentStreak !== undefined) {
            setStreak(res.data.currentStreak);
          }
        })
        .catch(() => { });

      fetchRevisionQueue()
        .then((res) => {
          if (Array.isArray(res?.data)) {
            setRevisionCount(res.data.length);
          }
        })
        .catch(() => { });
    }
  }, [isAuthenticated]);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('sidebar_collapsed', String(next)); } catch { }
      return next;
    });
  };

  // Listen to problem-created event to update streak & revision queue
  useEffect(() => {
    const handleProblemCreated = () => {
      fetchProfileAnalytics()
        .then((res) => {
          if (res?.data?.currentStreak !== undefined) {
            setStreak(res.data.currentStreak);
          }
        })
        .catch(() => { });

      fetchRevisionQueue()
        .then((res) => {
          if (Array.isArray(res?.data)) {
            setRevisionCount(res.data.length);
          }
        })
        .catch(() => { });
    };
    window.addEventListener('problem-created', handleProblemCreated);
    return () => window.removeEventListener('problem-created', handleProblemCreated);
  }, []);

  // Listen to open-quick-add custom event from anywhere in the app
  useEffect(() => {
    const handleOpenQuickAdd = () => setIsQuickAddOpen(true);
    window.addEventListener('open-quick-add', handleOpenQuickAdd);
    return () => window.removeEventListener('open-quick-add', handleOpenQuickAdd);
  }, []);

  // Derive initials for avatar
  const initials = useMemo(() => {
    if (user?.name) {
      return user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    }
    return (user?.email?.[0] ?? 'U').toUpperCase();
  }, [user]);

  // Contextual breadcrumb determination (without bullet dots)
  const breadcrumb = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith('/dashboard')) {
      return { section: 'Workspace', page: 'Dashboard', subpage: 'Overview' };
    }
    if (p === '/problems') {
      return { section: 'Workspace', page: 'Problems', subpage: 'Catalog & Tracker' };
    }
    if (p.startsWith('/problems/')) {
      return { section: 'Workspace', page: 'Problems', subpage: 'Problem Details' };
    }
    if (p.startsWith('/revision')) {
      return { section: 'Workspace', page: 'Revision', subpage: 'Spaced Repetition' };
    }
    if (p.startsWith('/profile')) {
      return { section: 'Account', page: 'Profile', subpage: 'Analytics & Settings' };
    }
    return { section: 'Workspace', page: 'App', subpage: '' };
  }, [location.pathname]);

  // Dynamic Chrome / Browser Tab Title
  useEffect(() => {
    const p = location.pathname;
    const base = ' · DSA Tracker';
    if (p.startsWith('/dashboard') || p === '/') {
      document.title = `Dashboard${base}`;
    } else if (p === '/problems') {
      document.title = `Problems${base}`;
    } else if (p.startsWith('/problems/')) {
      if (!document.title.includes('· DSA Tracker') || document.title.startsWith('Dashboard')) {
        document.title = `Problem Details${base}`;
      }
    } else if (p.startsWith('/revision')) {
      document.title = revisionCount > 0 ? `(${revisionCount}) Revision${base}` : `Revision${base}`;
    } else if (p.startsWith('/profile')) {
      document.title = `Profile${base}`;
    }

    // Reset window scroll to top smoothly on route change
    scrollToTop(true);
  }, [location.pathname, revisionCount]);

  // Command / Search Pill click action
  const handleSearchPillClick = () => {
    setIsCommandPaletteOpen(true);
  };

  // Global keyboard shortcuts: Cmd+K / Ctrl+K and '/' to trigger Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      const isProblemsPage = location.pathname === '/problems';
      if (e.key === '/' && !isInputActive && !isQuickAddOpen && !isCommandPaletteOpen && !isProblemsPage) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickAddOpen, isCommandPaletteOpen, location.pathname]);

  const handleQuickAddSuccess = () => {
    window.dispatchEvent(new CustomEvent('problem-created'));
  };

  // Public pages — no sidebar
  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex flex-col text-text bg-bg">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex text-text bg-bg">

      {/* ── Desktop sidebar ─────────────────────── */}
      <div className="hidden lg:flex shrink-0 h-screen sticky top-0 z-20">
        <Sidebar
          collapsed={collapsed}
          onToggle={toggleCollapsed}
          streak={streak}
          revisionCount={revisionCount}
          onLogout={handleLogout}
        />
      </div>

      {/* ── Main area ───────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Top Header Ribbon ───────────────────── */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 sm:h-[60px] px-3 sm:px-6 border-b border-line/70 glass-nav shrink-0">

          {/* Left: Mobile Brand Logo OR Desktop Breadcrumbs */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <NavLink to="/dashboard" className="flex items-center gap-2 lg:hidden shrink-0 select-none" title="DSA Tracker">
              <BrandLogo size="md" showText={true} textClassName="text-sm font-bold tracking-tight inline" />
            </NavLink>

            {/* Desktop Breadcrumbs (Dot-free & clean) */}
            <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-2 text-xs select-none">
              <span className="px-2 py-0.5 rounded-md bg-surface-2/80 border border-line/70 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                {breadcrumb.section}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-muted/70" />
              <span className="text-text-secondary font-medium">
                {breadcrumb.page}
              </span>
              {breadcrumb.subpage && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-muted/70" />
                  <span className="text-text font-semibold">
                    {breadcrumb.subpage}
                  </span>
                </>
              )}
            </nav>
          </div>

          {/* Center: Command / Search Pill (Desktop/Tablet only) */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-4">
            <button
              type="button"
              onClick={handleSearchPillClick}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-surface-2/80 hover:bg-surface-2 border border-line/80 hover:border-accent/40 text-text-secondary hover:text-text transition-all duration-200 group w-full text-xs shadow-inner cursor-pointer hover:shadow-[0_0_12px_rgba(255,161,22,0.1)]"
              title="Search problems and topics (Press / or Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-colors shrink-0" />
              <span className="truncate flex-1 text-left font-normal text-text-secondary/90">Search problems, tags, topics...</span>
              <div className="flex items-center gap-1 shrink-0">
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-text-secondary bg-surface border border-line/80 rounded-md shadow-xs">
                  ⌘K
                </kbd>
                <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-text-secondary bg-surface border border-line/80 rounded-md shadow-xs">
                  /
                </kbd>
              </div>
            </button>
          </div>

          {/* Right: Actions & User Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Mobile search trigger button (uniform 36x36 h-9 w-9) */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-surface-2/70 hover:bg-surface-2 border border-line/70 text-text-secondary hover:text-text transition-all active:scale-95 cursor-pointer"
              aria-label="Search problems and actions"
              title="Search problems"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Practice Streak Badge (h-9 on mobile & desktop) */}
            {streak != null && streak > 0 && (
              <NavLink
                to="/profile"
                className="hidden min-[380px]:flex items-center gap-1.5 h-9 px-2.5 rounded-xl bg-accent/12 hover:bg-accent/20 border border-accent/30 text-xs font-semibold tabular-nums text-accent transition-all duration-150 shadow-xs hover:shadow-[0_0_10px_rgba(255,161,22,0.2)] active:scale-95"
                title={`${streak} day practice streak`}
              >
                <Flame className="w-4 h-4 text-accent animate-pulse" />
                <span>{streak}d</span>
              </NavLink>
            )}

            {/* Quick Add Problem Button: 36x36 icon square on mobile, styled button on sm+ */}
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(true)}
              className="flex items-center justify-center w-9 h-9 sm:w-auto sm:px-3 rounded-xl bg-gradient-to-r from-accent to-[#ffb84d] hover:brightness-105 active:scale-95 text-bg text-xs font-semibold transition-all duration-150 cursor-pointer shadow-sm shadow-accent/25 gap-1.5"
              aria-label="Create new problem"
              title="Create new problem"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">New Problem</span>
            </button>

            {/* User Profile Avatar & Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUserMenuOpen(prev => !prev);
                }}
                className="flex items-center gap-2 p-0.5 sm:p-1 rounded-xl hover:bg-surface-2/80 border border-transparent hover:border-line/70 transition-all cursor-pointer group active:scale-95"
                aria-label="User menu"
                title={user?.name || 'Account'}
              >
                <div className="relative">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl object-cover border border-line/80 group-hover:border-accent transition-colors"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-surface-2 border border-line/80 flex items-center justify-center text-xs font-bold text-accent group-hover:border-accent transition-colors">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-semibold text-text truncate max-w-[110px]">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[11px] text-muted leading-none">
                    Pro Learner
                  </span>
                </div>
                <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-muted group-hover:text-text transition-colors" />
              </button>

              {/* Dropdown Popover */}
              {isUserMenuOpen && (
                <UserMenuDropdown
                  isOpen={isUserMenuOpen}
                  onClose={() => setIsUserMenuOpen(false)}
                  user={user}
                  initials={initials}
                  streak={streak}
                  revisionCount={revisionCount}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </div>
        </header>

        {/* ── Scrollable Body Area ────────────────────────── */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 pb-20 sm:pb-24 md:pb-28 lg:pb-8 max-w-7xl w-full mx-auto outline-none focus:outline-none"
        >
          {children}
        </main>

        {/* ── Fixed Bottom Tab Bar Navigation (< lg) ── */}
        <nav
          aria-label="Bottom Tab Navigation"
          className="fixed bottom-0 inset-x-0 z-40 lg:hidden glass-bottom-nav border-t border-line/70 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] pb-safe select-none"
        >
          <div className="grid grid-cols-4 items-center w-full max-w-md mx-auto px-2 py-1">
            {NAV_LINKS.map(({ to, label, Icon }) => {
              const isRevision = label === 'Revision';
              const badge = isRevision ? revisionCount : 0;

              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `
                    relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 min-h-[48px] cursor-pointer select-none active:scale-95
                    ${isActive ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {/* Illuminated Top Indicator Bar */}
                      {isActive && (
                        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full bg-accent nav-active-glow" />
                      )}

                      {/* Icon Container with soft active pill */}
                      <div className={`relative flex items-center justify-center w-10 h-7 rounded-lg transition-all duration-200 ${isActive ? 'bg-accent/12' : ''}`}>
                        <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-accent scale-110' : 'text-text-secondary'}`} />
                        {badge > 0 && (
                          <span className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-accent text-bg text-[10px] font-bold tabular-nums flex items-center justify-center border border-[#1e1e1e] shadow-xs">
                            {badge > 9 ? '9+' : badge}
                          </span>
                        )}
                      </div>

                      {/* Tab label */}
                      <span className={`text-[11px] tracking-tight mt-0.5 transition-colors ${isActive ? 'font-semibold text-accent' : 'font-medium text-text-secondary'}`}>
                        {label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Quick Add Problem Modal */}
      {isQuickAddOpen && (
        <ProblemForm
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onSuccess={handleQuickAddSuccess}
        />
      )}

      {/* Universal Command Palette Spotlight */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      {/* PWA Install Prompt Banner */}
      <InstallAppBanner />
    </div>
  );
};

export default AppShell;
