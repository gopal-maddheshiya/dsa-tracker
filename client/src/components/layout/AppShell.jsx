import React, { useState, useEffect, useMemo } from 'react';
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
  Flame,
  Search,
  Plus,
} from 'lucide-react';
import { scrollToTop } from '../common/SmoothScroll';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/problems', label: 'Problems', Icon: Code2 },
  { to: '/revision', label: 'Revision', Icon: Repeat },
  { to: '/profile', label: 'Profile', Icon: User },
];

/* ── Sidebar component (Desktop) ────────────────────────────────────── */
const Sidebar = ({ collapsed, onToggle, streak }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Derive initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const SideNavLink = ({ to, label, Icon: NavIcon }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `
        group relative flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm
        transition-colors select-none
        ${isActive
          ? 'bg-surface-2 text-accent border border-line font-medium'
          : 'text-text-secondary hover:text-text hover:bg-surface-2 border border-transparent'
        }
      `}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-accent" />
          )}
          <span className={`shrink-0 ${isActive ? 'text-accent' : 'text-text-secondary group-hover:text-text'} transition-colors`}>
            <NavIcon className="w-4 h-4" />
          </span>
          {!collapsed ? (
            <span className="truncate">{label}</span>
          ) : (
            <span className="pointer-events-none absolute left-full ml-2.5 px-2.5 py-1 rounded-md bg-surface-2 text-text text-xs font-semibold whitespace-nowrap shadow-dropdown border border-line opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50">
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <aside
      className={`
        flex flex-col h-full bg-surface border-r border-line
        transition-all duration-200 ease-in-out select-none
        ${collapsed ? 'w-[64px] overflow-visible' : 'w-[240px] overflow-hidden'}
      `}
    >
      {/* ── Logo ──────────────────────────────── */}
      <div className="flex items-center h-14 sm:h-[60px] px-3.5 border-b border-line shrink-0">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <BrandLogo size="md" showText={!collapsed} />
        </NavLink>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto p-1.5 rounded-lg text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Nav ───────────────────────────────── */}
      <nav className={`flex-1 p-2.5 space-y-1 ${collapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
        {collapsed ? (
          <button
            onClick={onToggle}
            className="group relative w-full flex items-center justify-center p-2 mb-2 rounded-lg text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
            <span className="pointer-events-none absolute left-full ml-2.5 px-2.5 py-1 rounded-md bg-surface-2 text-text text-xs font-semibold whitespace-nowrap shadow-dropdown border border-line opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50">
              Expand sidebar
            </span>
          </button>
        ) : (
          <p className="px-3 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Navigation
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
          className="mx-2.5 mb-2 px-3 py-2.5 rounded-lg bg-surface-2 border border-line hover:border-accent transition-colors block group shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent/12 border border-accent/25 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-text-secondary uppercase tracking-wide">Practice Streak</p>
              <p className="text-xs font-semibold text-text tabular-nums flex items-center gap-1.5">
                <span>{streak != null ? `${streak} day${streak !== 1 ? 's' : ''}` : 'Active'}</span>
              </p>
            </div>
          </div>
        </NavLink>
      ) : (
        streak != null && streak > 0 && (
          <NavLink
            to="/profile"
            className="group relative mx-auto mb-2 w-9 h-9 rounded-lg bg-accent/12 border border-accent/25 flex items-center justify-center text-accent hover:bg-accent/20 transition-colors shrink-0"
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
      <div className={`shrink-0 border-t border-line p-2.5 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {collapsed ? (
          <>
            <NavLink
              to="/profile"
              className="group relative cursor-pointer"
              aria-label="View Profile"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg object-cover border border-line group-hover:border-accent transition-colors" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-surface-2 border border-line flex items-center justify-center text-xs font-semibold text-text-secondary group-hover:text-text transition-colors">
                  {initials}
                </div>
              )}
              <span className="pointer-events-none absolute left-full ml-2.5 px-2.5 py-1 rounded-md bg-surface-2 text-text text-xs font-semibold whitespace-nowrap shadow-dropdown border border-line opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50">
                {user?.name || 'Profile'}
              </span>
            </NavLink>
            <button
              onClick={handleLogout}
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
          <div className="flex items-center gap-2.5 p-1">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg object-cover border border-line shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-surface-2 border border-line flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-text-secondary">{initials}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-muted truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors shrink-0 cursor-pointer"
              title="Sign out"
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
  const { isAuthenticated, user } = useAuth();
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

  // Contextual breadcrumb determination
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
        />
      </div>

      {/* ── Main area ───────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Top Header Ribbon ───────────────────── */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 sm:h-[60px] px-3 sm:px-6 border-b border-line bg-surface shrink-0">

          {/* Left: Mobile Brand Logo OR Desktop Breadcrumbs */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <NavLink to="/dashboard" className="flex items-center lg:hidden shrink-0" title="DSA Tracker">
              <BrandLogo size="sm" showText={true} textClassName="hidden min-[420px]:inline" />
            </NavLink>

            {/* Desktop Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-success" />
                {breadcrumb.section}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-muted" />
              <span className="text-text-secondary font-medium">
                {breadcrumb.page}
              </span>
              {breadcrumb.subpage && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-muted" />
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
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface border border-line hover:border-accent text-text-secondary hover:text-text transition-colors group w-full text-xs cursor-pointer"
              title="Search problems and topics (Press / or Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-colors shrink-0" />
              <span className="truncate flex-1 text-left">Search problems, tags, topics...</span>
              <div className="flex items-center gap-1 shrink-0">
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-xs font-mono text-muted bg-surface border border-line rounded">
                  Ctrl K
                </kbd>
                <kbd className="inline-flex items-center px-1.5 py-0.5 text-xs font-mono text-muted bg-surface border border-line rounded">
                  /
                </kbd>
              </div>
            </button>
          </div>

          {/* Right: Actions & User Avatar */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Mobile search trigger button */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Search problems and actions"
              title="Search problems"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Practice Streak Badge */}
            {streak != null && streak > 0 && (
              <NavLink
                to="/profile"
                className="hidden min-[380px]:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/12 border border-accent/25 text-xs font-medium tabular-nums text-accent transition-colors"
                title={`${streak} day practice streak`}
              >
                <Flame className="w-3.5 h-3.5 text-accent" />
                <span>{streak}d</span>
              </NavLink>
            )}

            {/* Quick Add Problem Button: icon-only on mobile, compact with label on sm+ */}
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(true)}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-bg text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              aria-label="Create new problem"
              title="Create new problem"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">New Problem</span>
            </button>

            {/* User Profile Avatar */}
            <NavLink
              to="/profile"
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-2 transition-colors group"
              aria-label="View Profile & Settings"
              title="View Profile & Settings"
            >
              <div className="relative">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover border border-line group-hover:border-accent transition-colors"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-surface-2 border border-line flex items-center justify-center text-xs font-semibold text-text-secondary group-hover:text-text transition-colors">
                    {initials}
                  </div>
                )}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-text truncate max-w-[100px]">
                  {user?.name || 'User'}
                </span>
                <span className="text-xs text-muted">
                  Pro Learner
                </span>
              </div>
            </NavLink>
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
          className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-surface/95 backdrop-blur-md border-t border-line pb-safe"
        >
          <div className="grid grid-cols-4 items-center w-full max-w-lg mx-auto">

            {/* 1. Dashboard */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `
                flex flex-col items-center justify-center py-2 transition-colors min-h-[48px] cursor-pointer
                ${isActive ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text'}
              `}
            >
              {({ isActive }) => (
                <>
                  <LayoutDashboard className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-text-secondary'}`} />
                  <span className={`text-xs mt-1 ${isActive ? 'font-semibold text-accent' : 'text-text-secondary'}`}>
                    Dashboard
                  </span>
                </>
              )}
            </NavLink>

            {/* 2. Problems */}
            <NavLink
              to="/problems"
              className={({ isActive }) => `
                flex flex-col items-center justify-center py-2 transition-colors min-h-[48px] cursor-pointer
                ${isActive ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text'}
              `}
            >
              {({ isActive }) => (
                <>
                  <Code2 className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-text-secondary'}`} />
                  <span className={`text-xs mt-1 ${isActive ? 'font-semibold text-accent' : 'text-text-secondary'}`}>
                    Problems
                  </span>
                </>
              )}
            </NavLink>

            {/* 3. Revision */}
            <NavLink
              to="/revision"
              className={({ isActive }) => `
                flex flex-col items-center justify-center py-2 transition-colors min-h-[48px] cursor-pointer
                ${isActive ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Repeat className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-text-secondary'}`} />
                    {revisionCount > 0 && (
                      <span className="absolute -top-1 -right-2.5 min-w-[16px] h-[16px] px-1 rounded-full bg-accent text-bg text-[10px] font-bold tabular-nums flex items-center justify-center border border-surface">
                        {revisionCount > 9 ? '9+' : revisionCount}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${isActive ? 'font-semibold text-accent' : 'text-text-secondary'}`}>
                    Revision
                  </span>
                </>
              )}
            </NavLink>

            {/* 4. Profile */}
            <NavLink
              to="/profile"
              className={({ isActive }) => `
                flex flex-col items-center justify-center py-2 transition-colors min-h-[48px] cursor-pointer
                ${isActive ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text'}
              `}
            >
              {({ isActive }) => (
                <>
                  <User className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-text-secondary'}`} />
                  <span className={`text-xs mt-1 ${isActive ? 'font-semibold text-accent' : 'text-text-secondary'}`}>
                    Profile
                  </span>
                </>
              )}
            </NavLink>

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
