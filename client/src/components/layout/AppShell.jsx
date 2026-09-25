import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  Globe,
  X,
} from 'lucide-react';
import { scrollToTop } from '../common/SmoothScroll';

const WORKSPACE_LINKS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/problems', label: 'Problems', Icon: Code2 },
  { to: '/revision', label: 'Revision', Icon: Repeat },
  { to: '/profile', label: 'Profile', Icon: User },
];

/* ── User Profile Popover Menu (Desktop & Mobile) ───────────────────── */
const UserMenuDropdown = ({ isOpen, onClose, user, initials, streak, revisionCount, onLogout }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col justify-start">
      {/* Clickable Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs sm:bg-black/10 transition-opacity animate-fade-in cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        aria-hidden="true"
      />

      {/* Floating Popover Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className="relative z-50 mx-3 mt-16 sm:mx-0 sm:mt-14 sm:self-end sm:mr-6 w-auto sm:w-72 rounded-lg bg-surface border border-line shadow-dropdown p-3 animate-scale-in select-none max-w-sm"
      >
        {/* User Info Header with Close button */}
        <div className="flex items-center gap-3 p-2 rounded-md bg-surface-2 border border-line/60 mb-2">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover border border-line shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-surface border border-line flex items-center justify-center text-xs font-bold text-accent shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text truncate">
              {user?.name || 'DSA Learner'}
            </p>
            <p className="text-[11px] text-muted truncate">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-md text-text-secondary hover:text-text hover:bg-surface transition-colors cursor-pointer shrink-0"
            aria-label="Close menu"
            title="Close menu"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quiet Telemetry Row */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-2 p-2 rounded-md bg-surface-2 hover:bg-surface-hover border border-line-subtle transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-accent shrink-0" />
            <div className="min-w-0">
              <span className="block text-[10px] uppercase tracking-wider text-muted font-medium">Streak</span>
              <span className="block text-xs font-semibold text-text tabular-nums">
                {streak != null && streak > 0 ? `${streak} Days` : '1 Day'}
              </span>
            </div>
          </NavLink>

          <NavLink
            to="/revision"
            onClick={onClose}
            className="flex items-center gap-2 p-2 rounded-md bg-surface-2 hover:bg-surface-hover border border-line-subtle transition-colors"
          >
            <Repeat className="w-3.5 h-3.5 text-easy shrink-0" />
            <div className="min-w-0">
              <span className="block text-[10px] uppercase tracking-wider text-muted font-medium">Revision</span>
              <span className="block text-xs font-semibold text-text tabular-nums">
                {revisionCount > 0 ? `${revisionCount} Due` : 'Caught Up'}
              </span>
            </div>
          </NavLink>
        </div>

        {/* Menu Links */}
        <div className="space-y-0.5 border-t border-line-subtle pt-1.5 mb-1.5">
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
          >
            <User className="w-3.5 h-3.5 text-muted" />
            <span>Profile & Analytics</span>
          </NavLink>
          <NavLink
            to="/profile?tab=platforms"
            onClick={onClose}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-muted" />
            <span>Platform Sync</span>
          </NavLink>
          <NavLink
            to="/problems"
            onClick={onClose}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-muted" />
            <span>Problem Catalog</span>
          </NavLink>
          <NavLink
            to="/revision"
            onClick={onClose}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
          >
            <Repeat className="w-3.5 h-3.5 text-muted" />
            <span>Spaced Repetition Queue</span>
          </NavLink>
        </div>

        {/* Sign Out Button */}
        <div className="border-t border-line-subtle pt-1.5">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
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
    const location = useLocation();

    const isPlatforms = to.includes('tab=platforms');
    const isCustomActive = isPlatforms
      ? location.pathname === '/profile' && location.search.includes('tab=platforms')
      : to === '/profile'
        ? location.pathname === '/profile' && !location.search.includes('tab=platforms')
        : undefined;

    return (
      <NavLink
        to={to}
        aria-current={isCustomActive ? 'page' : undefined}
        className={({ isActive }) => {
          const active = isCustomActive !== undefined ? isCustomActive : isActive;
          return `
            group relative flex items-center gap-3 px-3 py-2 rounded-md text-xs select-none
            transition-colors duration-150
            ${active
              ? 'bg-surface-2 text-text font-medium before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-r-xs before:bg-accent'
              : 'text-text-secondary hover:text-text hover:bg-surface-hover'
            }
          `;
        }}
      >
        {({ isActive }) => {
          const active = isCustomActive !== undefined ? isCustomActive : isActive;
          return (
            <>
              <NavIcon className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-accent' : 'text-muted group-hover:text-text-secondary'}`} />
              {!collapsed ? (
                <>
                  <span className="truncate flex-1">{label}</span>
                  {badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-sm text-[11px] font-mono font-medium bg-surface-2 text-text-secondary border border-line tabular-nums">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </>
              ) : (
                <>
                  {badge > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
                  )}
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded-sm bg-surface-2 text-text text-xs font-medium whitespace-nowrap border border-line shadow-dropdown opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50"
                  >
                    {label}{badge > 0 ? ` (${badge})` : ''}
                  </span>
                </>
              )}
            </>
          );
        }}
      </NavLink>
    );
  };

  return (
    <aside
      aria-label="Desktop Navigation"
      className={`
        flex flex-col h-full bg-[#131317] border-r border-line
        transition-all duration-150 ease-in-out select-none
        ${collapsed ? 'w-[68px] overflow-visible' : 'w-[240px] overflow-hidden'}
      `}
    >
      {/* ── Brand Header ──────────────────────────── */}
      <div className="flex items-center h-14 px-3.5 border-b border-line shrink-0">
        <NavLink to="/dashboard" className="flex items-center gap-2 min-w-0" title="DSA Tracker">
          <BrandLogo size="md" showText={!collapsed} />
        </NavLink>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto p-1.5 rounded-md text-text-secondary hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Navigation Items ──────────────────────── */}
      <nav className={`flex-1 p-2.5 space-y-1 ${collapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
        {collapsed ? (
          <button
            onClick={onToggle}
            className="group relative w-full flex items-center justify-center p-2 mb-2 rounded-md text-text-secondary hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded-sm bg-surface-2 text-text text-xs font-medium whitespace-nowrap border border-line shadow-dropdown opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50"
            >
              Expand sidebar
            </span>
          </button>
        ) : (
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted select-none">
            Workspace
          </p>
        )}

        {WORKSPACE_LINKS.map(({ to, label, Icon: NavIcon }) => (
          <SideNavLink key={to} to={to} label={label} Icon={NavIcon} />
        ))}

        {!collapsed ? (
          <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted select-none">
            Integrations
          </p>
        ) : (
          <div className="my-2 border-t border-line-subtle" />
        )}
        <SideNavLink to="/profile?tab=platforms" label="Platform Sync" Icon={Globe} />
      </nav>

      {/* ── Compact Sidebar Streak Telemetry ──────── */}
      {!collapsed ? (
        <NavLink
          to="/profile"
          className="mx-2.5 mb-2 px-2.5 py-1.5 rounded-md text-text-secondary hover:text-text hover:bg-surface-hover flex items-center gap-2 text-xs transition-colors select-none"
          title="Practice streak"
        >
          <Flame className="w-3.5 h-3.5 text-accent shrink-0" />
          <span className="font-medium text-text tabular-nums">
            {streak != null && streak > 0 ? `${streak} day streak` : 'Daily practice'}
          </span>
        </NavLink>
      ) : (
        streak != null && streak > 0 && (
          <NavLink
            to="/profile"
            className="group relative mx-auto mb-2 w-9 h-9 rounded-md hover:bg-surface-hover flex items-center justify-center text-text-secondary hover:text-accent transition-colors select-none"
            aria-label={`${streak} day streak`}
          >
            <Flame className="w-4 h-4 text-accent" />
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded-sm bg-surface-2 text-text text-xs font-medium whitespace-nowrap border border-line shadow-dropdown opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50"
            >
              {streak} day streak
            </span>
          </NavLink>
        )
      )}

      {/* ── User Footer ───────────────────────────── */}
      <div className={`shrink-0 border-t border-line p-2.5 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {collapsed ? (
          <>
            <NavLink
              to="/profile"
              className="group relative cursor-pointer"
              aria-label="Profile"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-line group-hover:border-accent transition-colors"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-surface-2 border border-line flex items-center justify-center text-xs font-semibold text-text-secondary group-hover:text-text transition-colors">
                  {initials}
                </div>
              )}
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded-sm bg-surface-2 text-text text-xs font-medium whitespace-nowrap border border-line shadow-dropdown opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50"
              >
                {user?.name || 'Profile'}
              </span>
            </NavLink>
            <button
              onClick={onLogout}
              className="group relative p-1.5 rounded-md text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded-sm bg-surface-2 text-text text-xs font-medium whitespace-nowrap border border-line shadow-dropdown opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50"
              >
                Sign out
              </span>
            </button>
          </>
        ) : (
          <div className="flex items-center justify-between gap-2.5">
            <NavLink to="/profile" className="flex items-center gap-2.5 min-w-0 flex-1 group">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-line group-hover:border-accent transition-colors shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-surface-2 border border-line flex items-center justify-center shrink-0 text-xs font-semibold text-text-secondary group-hover:text-accent transition-colors">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-text truncate group-hover:text-accent transition-colors">
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] text-muted truncate">{user?.email}</p>
              </div>
            </NavLink>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-md text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors shrink-0 cursor-pointer"
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

  // Contextual breadcrumb determination (pure typography, no pills)
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

    scrollToTop(true);
  }, [location.pathname, revisionCount]);

  // Command / Search action
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

  // Public pages — no sidebar or shell chrome
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

        {/* ── Top Header Ribbon (56px) ─────────────── */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 border-b border-line bg-[#131317]/95 backdrop-blur-md shrink-0">

          {/* Left: Mobile Brand Logo OR Desktop Breadcrumbs */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <NavLink to="/dashboard" className="flex items-center gap-2 lg:hidden shrink-0 select-none" title="DSA Tracker">
              <BrandLogo size="sm" showText={true} textClassName="text-sm font-semibold tracking-tight inline" />
            </NavLink>

            {/* Desktop Breadcrumbs (Pure typography, no pills, subtle separators) */}
            <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-2 text-xs select-none">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                {breadcrumb.section}
              </span>
              <span className="text-muted/40 font-mono select-none">/</span>
              <span className="text-text-secondary font-medium">
                {breadcrumb.page}
              </span>
              {breadcrumb.subpage && (
                <>
                  <span className="text-muted/40 font-mono select-none">/</span>
                  <span className="text-text font-semibold">
                    {breadcrumb.subpage}
                  </span>
                </>
              )}
            </nav>
          </div>

          {/* Center: Global Problem Search / Cmd+K */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-6">
            <button
              type="button"
              onClick={handleSearchPillClick}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-surface-2/60 hover:bg-surface-2 border border-line text-muted hover:text-text-secondary transition-colors w-full text-xs cursor-pointer group"
              title="Search problems and topics (Press / or Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-muted group-hover:text-text-secondary transition-colors shrink-0" />
              <span className="truncate flex-1 text-left font-normal text-muted group-hover:text-text-secondary">Search problems, topics...</span>
              <div className="flex items-center gap-1 shrink-0 font-mono text-[11px] text-muted">
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.2 rounded-xs bg-surface border border-line text-[10px]">
                  ⌘K
                </kbd>
                <kbd className="inline-flex items-center px-1.5 py-0.2 rounded-xs bg-surface border border-line text-[10px]">
                  /
                </kbd>
              </div>
            </button>
          </div>

          {/* Right: Actions & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile search trigger button */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-md text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Search problems"
              title="Search problems"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Exactly ONE Dominant Solid CTA: + New Problem */}
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(true)}
              className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
              aria-label="Create new problem"
              title="Create new problem"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">New Problem</span>
            </button>

            {/* User Profile Avatar & Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsUserMenuOpen(prev => !prev);
                }}
                className={`flex items-center gap-1.5 p-1 rounded-md transition-colors cursor-pointer border ${
                  isUserMenuOpen
                    ? 'border-line bg-surface-2'
                    : 'border-transparent hover:border-line hover:bg-surface-2'
                }`}
                aria-label="User menu"
                title={user?.name || 'Account'}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-line"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-surface-2 border border-line flex items-center justify-center text-xs font-semibold text-text-secondary">
                    {initials}
                  </div>
                )}
                <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-muted" />
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
          className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#131317]/95 backdrop-blur-md border-t border-line pb-safe select-none"
        >
          <div className="grid grid-cols-4 items-center w-full max-w-md mx-auto px-2 py-1">
            {WORKSPACE_LINKS.map(({ to, label, Icon }) => {
              const isRevision = label === 'Revision';
              const badge = isRevision ? revisionCount : 0;

              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `
                    relative flex flex-col items-center justify-center py-1 px-1 rounded-md transition-colors min-h-[48px] cursor-pointer select-none
                    ${isActive ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {/* Quiet Top Indicator Line */}
                      {isActive && (
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-accent" />
                      )}

                      {/* Icon Container */}
                      <div className="relative flex items-center justify-center w-8 h-6">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-accent' : 'text-text-secondary'}`} />
                        {badge > 0 && (
                          <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-1 rounded-sm bg-surface-2 text-text border border-line text-[9px] font-mono font-medium tabular-nums flex items-center justify-center">
                            {badge > 9 ? '9+' : badge}
                          </span>
                        )}
                      </div>

                      {/* Tab label */}
                      <span className={`text-[11px] tracking-tight mt-0.5 transition-colors ${isActive ? 'font-semibold text-accent' : 'font-normal text-text-secondary'}`}>
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
