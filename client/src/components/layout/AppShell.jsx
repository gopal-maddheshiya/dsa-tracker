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
  X,
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
        group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm
        transition-all duration-150 relative overflow-hidden
        ${isActive
          ? 'bg-[#E07A38]/10 text-[#E07A38] border border-[#E07A38]/25 font-semibold'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
        }
      `}
    >
      {({ isActive }) => (
        <>
          {/* Active left accent bar */}
          {isActive && (
            <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[#E07A38] shadow-[0_0_8px_rgba(224,122,56,0.5)]" />
          )}
          <span className={`shrink-0 ${isActive ? 'text-[#E07A38]' : 'text-zinc-400 group-hover:text-zinc-200'} transition-colors`}>
            <NavIcon className="w-4 h-4" />
          </span>
          {!collapsed && <span className="truncate">{label}</span>}
        </>
      )}
    </NavLink>
  );

  return (
    <aside
      className={`
        flex flex-col h-full bg-[#0E1118]/90 backdrop-blur-2xl border-r border-white/[0.08]
        transition-all duration-300 ease-in-out overflow-hidden select-none
        ${collapsed ? 'w-[64px]' : 'w-[240px]'}
      `}
    >
      {/* ── Logo ──────────────────────────────── */}
      <div className="flex items-center h-14 sm:h-[60px] px-3.5 border-b border-white/[0.08] shrink-0">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <BrandLogo size="md" showText={!collapsed} />
        </NavLink>
        {/* Desktop collapse toggle */}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-all cursor-pointer"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Nav ───────────────────────────────── */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
        {collapsed ? (
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2.5 mb-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-all"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 font-mono">
            Navigation
          </p>
        )}
        {NAV_LINKS.map(({ to, label, Icon: NavIcon }) => (
          <SideNavLink key={to} to={to} label={label} Icon={NavIcon} />
        ))}
      </nav>

      {/* ── Streak strip ──────────────────────── */}
      {!collapsed && (
        <NavLink
          to="/profile"
          className="mx-2.5 mb-2 px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-[#E07A38]/40 transition-all block group shadow-sm hover:shadow-[0_0_16px_rgba(224,122,56,0.1)] shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#E07A38]/15 border border-[#E07A38]/25 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-[#E07A38] group-hover:scale-110 transition-transform" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Practice Streak</p>
              <p className="text-xs font-bold font-mono text-zinc-100 flex items-center gap-1.5">
                <span>{streak != null ? `${streak} day${streak !== 1 ? 's' : ''}` : 'Active'}</span>
              </p>
            </div>
          </div>
        </NavLink>
      )}

      {/* ── User footer ───────────────────────── */}
      <div className={`shrink-0 border-t border-zinc-800/80 p-2.5 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {collapsed ? (
          <>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-xl object-cover border border-[#E07A38]/30 shadow-xs" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[#E07A38]/15 border border-[#E07A38]/25 flex items-center justify-center shadow-xs">
                <span className="text-[11px] font-bold text-[#E07A38] font-mono">{initials}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2.5 p-1">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-xl object-cover border border-[#E07A38]/30 shrink-0 shadow-xs" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[#E07A38]/15 border border-[#E07A38]/25 flex items-center justify-center shrink-0 shadow-xs">
                <span className="text-[11px] font-bold text-[#E07A38] font-mono">{initials}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-100 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-zinc-400 font-mono truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0"
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

  // Live streak & revision count fetch on mount and route change
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
  }, [isAuthenticated, location.pathname]);

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
      <div className="min-h-screen flex flex-col text-[#F8FAFC]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex text-[#F8FAFC]">

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

        {/* ── Top Header Ribbon (Frosted Obsidian Glass) ───────── */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 sm:h-[60px] px-3 sm:px-6 border-b border-white/[0.08] bg-[#0B0D13]/80 backdrop-blur-2xl shrink-0 transition-all">

          {/* Left: Mobile Brand Logo OR Desktop Breadcrumbs */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Mobile logo (prominent, clean, without hamburger clutter) */}
            <NavLink to="/dashboard" className="flex items-center lg:hidden active:scale-95 transition-transform" title="DSA Tracker">
              <BrandLogo size="sm" showText={true} />
            </NavLink>

            {/* Desktop Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                {breadcrumb.section}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-zinc-400 font-medium">
                {breadcrumb.page}
              </span>
              {breadcrumb.subpage && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="text-zinc-100 font-semibold">
                    {breadcrumb.subpage}
                  </span>
                </>
              )}
            </nav>
          </div>

          {/* Center: Command / Search Pill (Desktop/Tablet only) */}
          <div className="hidden md:flex items-center justify-center">
            <button
              type="button"
              onClick={handleSearchPillClick}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800/80 hover:border-[#E07A38]/35 text-zinc-400 hover:text-zinc-200 transition-all group w-52 sm:w-64 lg:w-72 shadow-sm text-xs cursor-pointer"
              title="Search problems and topics (Press / or Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#E07A38] transition-colors" />
              <span className="truncate flex-1 text-left">Search problems, tags...</span>
              <div className="flex items-center gap-1">
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-950 border border-zinc-800 rounded group-hover:border-[#E07A38]/30 group-hover:text-[#E07A38] transition-colors">
                  Ctrl K
                </kbd>
                <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-950 border border-zinc-800 rounded group-hover:border-[#E07A38]/30 group-hover:text-[#E07A38] transition-colors">
                  /
                </kbd>
              </div>
            </button>
          </div>

          {/* Right: Actions & User Avatar */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Mobile search trigger button */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 active:scale-95 transition-all"
              aria-label="Search problems and actions"
              title="Search problems"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Practice Streak Badge */}
            {streak != null && streak > 0 && (
              <NavLink
                to="/profile"
                className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-zinc-900 border border-[#E07A38]/25 hover:border-[#E07A38]/50 text-xs font-mono font-bold text-[#E07A38] transition-all active:scale-95 shadow-[0_0_12px_rgba(224,122,56,0.12)]"
                title={`${streak} day practice streak`}
              >
                <Flame className="w-3.5 h-3.5 text-[#E07A38]" />
                <span>{streak}d</span>
              </NavLink>
            )}

            {/* Desktop Quick Add Problem Button */}
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E07A38] hover:opacity-92 text-[#12151B] text-xs font-bold shadow-[0_1px_3px_rgba(0,0,0,0.35),0_4px_12px_rgba(0,0,0,0.25)] active:scale-95 transition-all cursor-pointer"
              title="Create / Catalog a new problem"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Problem</span>
            </button>

            {/* User Profile Avatar */}
            <NavLink
              to="/profile"
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-zinc-800/60 transition-all group active:scale-95"
              title="View Profile & Settings"
            >
              <div className="relative">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-xl object-cover ring-1 ring-white/10 group-hover:ring-[#E07A38]/50 transition-all"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-300 group-hover:border-[#E07A38]/50 group-hover:text-white transition-all shadow-inner">
                    {initials}
                  </div>
                )}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-zinc-100 group-hover:text-white transition-colors truncate max-w-[100px]">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
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
          className="flex-1 px-4 sm:px-6 md:px-8 py-6 max-w-7xl w-full mx-auto outline-none focus:outline-none"
        >
          {children}
        </main>

        {/* ── Mobile Floating Dock Navigation ── */}
        <nav
          aria-label="Mobile Dock Navigation"
          className="fixed bottom-0 inset-x-0 z-40 lg:hidden px-3 pb-safe pt-1 pointer-events-none"
        >
          {/* Frosted Glass Pill Container */}
          <div className="pointer-events-auto max-w-md mx-auto mb-2.5 px-3 py-1.5 rounded-2xl bg-[#0F1218]/90 backdrop-blur-2xl border border-white/[0.1] shadow-[0_8px_32px_rgba(0,0,0,0.6),0_1px_1px_rgba(255,255,255,0.08)_inset] grid grid-cols-5 items-center gap-1">

            {/* 1. Dashboard */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `
                group relative flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-90 min-h-[46px] cursor-pointer
                ${isActive ? 'text-[#E07A38] font-semibold' : 'text-zinc-400 hover:text-zinc-200'}
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Top glowing active indicator */}
                  {isActive && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-[#E07A38] shadow-[0_0_8px_rgba(224,122,56,0.6)]" />
                  )}
                  <div className="relative">
                    <LayoutDashboard className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-[#E07A38]' : 'group-hover:text-zinc-200'}`} />
                  </div>
                  <span className={`text-[10px] tracking-tight mt-1 transition-colors ${isActive ? 'font-bold text-[#E07A38]' : 'font-medium text-zinc-400 group-hover:text-zinc-300'}`}>
                    Dashboard
                  </span>
                </>
              )}
            </NavLink>

            {/* 2. Problems */}
            <NavLink
              to="/problems"
              className={({ isActive }) => `
                group relative flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-90 min-h-[46px] cursor-pointer
                ${isActive ? 'text-[#E07A38] font-semibold' : 'text-zinc-400 hover:text-zinc-200'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-[#E07A38] shadow-[0_0_8px_rgba(224,122,56,0.6)]" />
                  )}
                  <div className="relative">
                    <Code2 className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-[#E07A38]' : 'group-hover:text-zinc-200'}`} />
                  </div>
                  <span className={`text-[10px] tracking-tight mt-1 transition-colors ${isActive ? 'font-bold text-[#E07A38]' : 'font-medium text-zinc-400 group-hover:text-zinc-300'}`}>
                    Problems
                  </span>
                </>
              )}
            </NavLink>

            {/* 3. Center Elevated Quick Action Button (Add Problem - Portfolio Ember) */}
            <div className="flex flex-col items-center justify-center -mt-5 relative z-10">
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(true)}
                className="group relative flex flex-col items-center justify-center cursor-pointer focus:outline-none"
                aria-label="Add new problem"
              >
                <div className="w-12 h-12 rounded-[20px] bg-[#E07A38] text-[#12151B] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.45)] ring-4 ring-[#0B0D13] group-active:scale-90 group-hover:scale-105 group-hover:opacity-92 transition-all duration-200">
                  <Plus className="w-6 h-6 stroke-[2.5] text-[#12151B] group-hover:rotate-90 transition-transform duration-200" />
                </div>
                <span className="text-[10px] font-semibold text-zinc-300 mt-1 tracking-tight group-hover:text-white transition-colors">
                  Add
                </span>
              </button>
            </div>

            {/* 4. Revision */}
            <NavLink
              to="/revision"
              className={({ isActive }) => `
                group relative flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-90 min-h-[46px] cursor-pointer
                ${isActive ? 'text-[#E07A38] font-semibold' : 'text-zinc-400 hover:text-zinc-200'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-[#E07A38] shadow-[0_0_8px_rgba(224,122,56,0.6)]" />
                  )}
                  <div className="relative">
                    <Repeat className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-[#E07A38]' : 'group-hover:text-zinc-200'}`} />
                    {revisionCount > 0 && (
                      <span className="absolute -top-1 -right-2.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#E07A38] text-[#12151B] font-mono text-[9px] font-black flex items-center justify-center shadow-xs border-2 border-[#0B0D13]">
                        {revisionCount > 9 ? '9+' : revisionCount}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] tracking-tight mt-1 transition-colors ${isActive ? 'font-bold text-[#E07A38]' : 'font-medium text-zinc-400 group-hover:text-zinc-300'}`}>
                    Revision
                  </span>
                </>
              )}
            </NavLink>

            {/* 5. Profile */}
            <NavLink
              to="/profile"
              className={({ isActive }) => `
                group relative flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-90 min-h-[46px] cursor-pointer
                ${isActive ? 'text-[#E07A38] font-semibold' : 'text-zinc-400 hover:text-zinc-200'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-[#E07A38] shadow-[0_0_8px_rgba(224,122,56,0.6)]" />
                  )}
                  <div className="relative">
                    <User className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-[#E07A38]' : 'group-hover:text-zinc-200'}`} />
                  </div>
                  <span className={`text-[10px] tracking-tight mt-1 transition-colors ${isActive ? 'font-bold text-[#E07A38]' : 'font-medium text-zinc-400 group-hover:text-zinc-300'}`}>
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

