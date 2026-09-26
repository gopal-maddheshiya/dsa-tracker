import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchProfileAnalytics, fetchRevisionQueue } from '../../api/analytics';
import InstallAppBanner from './InstallAppBanner';
import AppBackground from './AppBackground';
import ProblemForm from '../ProblemForm';
import CommandPalette from '../ui/CommandPalette';
import BrandLogo from '../ui/BrandLogo';
import AuthGateModal from '../auth/AuthGateModal';
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

    const handleSideNavClick = (e) => {
      if (!user && (to === '/revision' || to.startsWith('/profile'))) {
        e.preventDefault();
        window.dispatchEvent(
          new CustomEvent('open-auth-gate', {
            detail: {
              title: label === 'Revision' ? 'Spaced Repetition Queue' : 'Personal Profile & Analytics',
              description:
                label === 'Revision'
                  ? 'Create an account to track your personalized forgetting curve and revision schedules.'
                  : 'Create an account to track your consistency streak, activity heatmap, and target goals.',
              contextAction: label,
              targetUrl: to,
            },
          })
        );
      }
    };

    return (
      <NavLink
        to={to}
        onClick={handleSideNavClick}
        aria-current={isCustomActive ? 'page' : undefined}
        className={({ isActive }) => {
          const active = isCustomActive !== undefined ? isCustomActive : isActive;
          return `
            group relative flex items-center ${collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2'} rounded-xl text-xs select-none
            transition-all duration-150
            ${active
              ? 'bg-gradient-to-r from-accent/15 via-surface-2/80 to-surface-2/40 border border-accent/30 text-text font-semibold shadow-[0_0_14px_-3px_rgba(255,161,22,0.22)] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r-full before:bg-accent before:shadow-[0_0_8px_rgba(255,161,22,0.85)]'
              : 'text-text-secondary hover:text-text hover:bg-surface-hover/80 border border-transparent'
            }
          `;
        }}
      >
        {({ isActive }) => {
          const active = isCustomActive !== undefined ? isCustomActive : isActive;
          return (
            <>
              <NavIcon className={`w-4 h-4 shrink-0 transition-all duration-150 ${active ? 'text-accent drop-shadow-[0_0_8px_rgba(255,161,22,0.6)] scale-105' : 'text-muted group-hover:text-text-secondary group-hover:scale-105'}`} />
              {!collapsed ? (
                <>
                  <span className="truncate flex-1">{label}</span>
                  {badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent/20 text-accent border border-accent/35 shadow-[0_0_8px_rgba(255,161,22,0.25)] tabular-nums">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </>
              ) : (
                <>
                  {badge > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent shadow-[0_0_6px_rgba(255,161,22,0.9)] ring-2 ring-surface" />
                  )}
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-surface-2/95 backdrop-blur-md text-text text-xs font-medium whitespace-nowrap border border-line-subtle shadow-dropdown opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50"
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
        flex flex-col h-full bg-surface/90 backdrop-blur-xl border-r border-line-subtle/80 shadow-[1px_0_15px_-3px_rgba(0,0,0,0.5)]
        transition-all duration-200 ease-in-out select-none relative
        ${collapsed ? 'w-[68px] overflow-visible' : 'w-[240px] overflow-hidden'}
      `}
    >
      {/* ── Brand Header ──────────────────────────── */}
      <div className="flex items-center h-14 px-3.5 border-b border-line-subtle/80 shrink-0 relative">
        <NavLink to="/dashboard" className="flex items-center gap-2 min-w-0" title="DSA Tracker">
          <BrandLogo size="md" showText={!collapsed} />
        </NavLink>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto p-1.5 rounded-lg text-text-secondary hover:text-text hover:bg-surface-2 border border-transparent hover:border-line-subtle transition-all cursor-pointer"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent pointer-events-none" />
      </div>

      {/* ── Navigation Items ──────────────────────── */}
      <nav className={`flex-1 p-2.5 space-y-1 ${collapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
        {collapsed ? (
          <button
            onClick={onToggle}
            className="group relative w-10 h-10 mx-auto flex items-center justify-center mb-2 rounded-xl text-text-secondary hover:text-text hover:bg-surface-hover transition-colors cursor-pointer border border-transparent hover:border-line-subtle"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-surface-2/95 backdrop-blur-md text-text text-xs font-medium whitespace-nowrap border border-line-subtle shadow-dropdown opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50"
            >
              Expand sidebar
            </span>
          </button>
        ) : (
          <p className="px-3 pb-1 pt-2 text-[10px] font-mono font-bold uppercase tracking-wider text-muted select-none">
            Workspace
          </p>
        )}

        {WORKSPACE_LINKS.map(({ to, label, Icon: NavIcon }) => (
          <SideNavLink key={to} to={to} label={label} Icon={NavIcon} />
        ))}

        {!collapsed ? (
          <p className="px-3 pb-1 pt-4 text-[10px] font-mono font-bold uppercase tracking-wider text-muted select-none">
            Integrations
          </p>
        ) : (
          <div className="my-2 border-t border-line-subtle/50" />
        )}
        <SideNavLink to="/profile?tab=platforms" label="Platform Sync" Icon={Globe} />
      </nav>

      {/* ── Compact Sidebar Streak Telemetry Mini-Card ──────── */}
      {!collapsed ? (
        <NavLink
          to="/profile"
          className="mx-2.5 mb-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-surface-2/70 via-surface to-surface-2/40 border border-line-subtle/80 hover:border-accent/40 flex items-center justify-between text-xs transition-all duration-200 shadow-xs hover:shadow-[0_0_12px_-2px_rgba(255,161,22,0.15)] group cursor-pointer"
          title="Practice streak cadence"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-accent/10 border border-accent/25 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
              <Flame className="w-3.5 h-3.5 text-accent animate-pulse group-hover:scale-110 transition-transform" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold text-text truncate group-hover:text-accent transition-colors">
                Streak Cadence
              </span>
              <span className="block text-[9px] font-mono text-muted uppercase tracking-wider">
                Daily Velocity
              </span>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-accent tabular-nums bg-accent/10 px-2 py-0.5 rounded-md border border-accent/25 shadow-[0_0_8px_rgba(255,161,22,0.2)]">
            {streak != null && streak > 0 ? `${streak}d` : '0d'}
          </span>
        </NavLink>
      ) : (
        <NavLink
          to="/profile"
          className="group relative mx-auto mb-2.5 w-10 h-10 rounded-xl hover:bg-surface-2/80 flex items-center justify-center text-text-secondary hover:text-accent transition-all select-none border border-line-subtle/60 hover:border-accent/40 shadow-xs cursor-pointer"
          aria-label={`${streak || 0} day streak`}
        >
          <Flame className="w-4 h-4 text-accent animate-pulse group-hover:scale-110 transition-transform" />
          <span
            role="tooltip"
            className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-surface-2/95 backdrop-blur-md text-text text-xs font-medium whitespace-nowrap border border-line-subtle shadow-dropdown opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50"
          >
            {streak != null && streak > 0 ? `${streak} day streak` : '0 day streak'}
          </span>
        </NavLink>
      )}

      {/* ── User Footer ───────────────────────────── */}
      <div className={`shrink-0 border-t border-line-subtle/80 p-2.5 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!user ? (
          collapsed ? (
            <NavLink
              to="/login"
              className="w-10 h-10 rounded-xl text-accent hover:bg-surface-2/80 flex items-center justify-center transition-all cursor-pointer group relative border border-line-subtle/60 hover:border-accent/40 shadow-xs"
              aria-label="Sign in"
            >
              <div className="relative">
                <User className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent radar-beacon" />
              </div>
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-surface-2/95 backdrop-blur-md text-text text-xs font-medium whitespace-nowrap border border-line-subtle shadow-dropdown opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50"
              >
                Sign In to Save
              </span>
            </NavLink>
          ) : (
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-surface-2/80 via-surface-2/50 to-surface border border-line-subtle/90 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between gap-2.5 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-accent radar-beacon shrink-0" />
                    <p className="text-xs font-bold text-text truncate">Guest Explorer</p>
                  </div>
                  <p className="text-[10px] font-mono text-muted truncate mt-0.5">Public Demo Mode</p>
                </div>
              </div>
              <NavLink
                to="/login"
                className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-accent to-amber-500 hover:from-accent-hover hover:to-amber-400 text-bg text-xs py-1.5 px-3 rounded-lg font-extrabold shadow-[0_2px_12px_-2px_rgba(255,161,22,0.45)] hover:shadow-[0_4px_16px_-2px_rgba(255,161,22,0.6)] transition-all cursor-pointer"
              >
                <span>Sign In to Save</span>
                <span className="text-xs">→</span>
              </NavLink>
            </div>
          )
        ) : collapsed ? (
          <>
            <NavLink
              to="/profile"
              className="group relative cursor-pointer"
              aria-label="Profile"
            >
              <div className="relative">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-line group-hover:border-accent transition-colors shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-surface-2 border border-line flex items-center justify-center text-xs font-semibold text-text-secondary group-hover:text-text transition-colors">
                    {initials}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-easy border-2 border-surface" />
              </div>
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-surface-2/95 backdrop-blur-md text-text text-xs font-medium whitespace-nowrap border border-line-subtle shadow-dropdown opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50"
              >
                {user?.name || 'Profile'}
              </span>
            </NavLink>
            <button
              onClick={onLogout}
              className="group relative p-2 rounded-xl text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-surface-2/95 backdrop-blur-md text-text text-xs font-medium whitespace-nowrap border border-line-subtle shadow-dropdown opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50"
              >
                Sign out
              </span>
            </button>
          </>
        ) : (
          <div className="flex items-center justify-between gap-2.5 p-1.5 rounded-xl bg-surface-2/40 hover:bg-surface-2/80 border border-transparent hover:border-line-subtle transition-all">
            <NavLink to="/profile" className="flex items-center gap-2.5 min-w-0 flex-1 group">
              <div className="relative shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-line group-hover:border-accent transition-colors shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-surface-2 border border-line flex items-center justify-center shrink-0 text-xs font-semibold text-text-secondary group-hover:text-accent transition-colors">
                    {initials}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-easy border-2 border-surface" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-text truncate group-hover:text-accent transition-colors">
                  {user?.name || 'DSA Learner'}
                </p>
                <p className="text-[10px] font-mono text-muted truncate">{user?.email}</p>
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

  // Auth Gate modal state for guest interactions
  const [authGateConfig, setAuthGateConfig] = useState({
    isOpen: false,
    title: 'Save your progress',
    description: 'Create an account to track your DSA practice.',
    contextAction: null,
    targetUrl: null,
  });

  const openAuthGate = (config = {}) => {
    setAuthGateConfig({
      isOpen: true,
      title: config.title || 'Save your progress',
      description: config.description || 'Create an account to track your deliberate practice.',
      contextAction: config.contextAction || null,
      targetUrl: config.targetUrl || null,
    });
  };

  const closeAuthGate = () => {
    setAuthGateConfig((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const handleOpenAuthGate = (e) => {
      openAuthGate(e.detail || {});
    };
    window.addEventListener('open-auth-gate', handleOpenAuthGate);
    return () => window.removeEventListener('open-auth-gate', handleOpenAuthGate);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/dashboard');
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
    } else {
      setStreak(null);
      setRevisionCount(0);
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
    const handleOpenQuickAdd = () => {
      if (!isAuthenticated) {
        openAuthGate({
          title: 'Add a Problem',
          description: 'Create an account to catalog your custom problems, code solutions, and configure spaced repetition.',
          contextAction: 'Add Problem',
        });
      } else {
        setIsQuickAddOpen(true);
      }
    };
    window.addEventListener('open-quick-add', handleOpenQuickAdd);
    return () => window.removeEventListener('open-quick-add', handleOpenQuickAdd);
  }, [isAuthenticated]);

  // Derive initials for avatar
  const initials = useMemo(() => {
    if (user?.name) {
      return user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    }
    return (user?.email?.[0] ?? 'U').toUpperCase();
  }, [user]);

  const handleNewProblemClick = () => {
    if (!isAuthenticated) {
      openAuthGate({
        title: 'Add a Problem',
        description: 'Create an account to catalog your custom problems, code solutions, and configure spaced repetition.',
        contextAction: 'Add Problem',
      });
    } else {
      setIsQuickAddOpen(true);
    }
  };

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

  // Only public standalone auth pages (login / signup) skip the shell chrome
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  if (isAuthPage) {
    return (
      <div className="min-h-dvh flex flex-col text-text bg-bg relative">
        <AppBackground />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex text-text bg-bg relative">
      <AppBackground />

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
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-3 sm:px-5 lg:px-6 border-b border-line-subtle/80 bg-surface/85 backdrop-blur-xl shrink-0 relative">
          {/* Subtle Top Specular Beam */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent pointer-events-none" />

          {/* Left Zone: Mobile Brand Logo (< lg) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Mobile Brand Logo */}
            <NavLink
              to="/dashboard"
              className="flex items-center gap-2 lg:hidden shrink-0 select-none group"
              title="DSA Tracker"
            >
              <BrandLogo size="sm" showText={true} textClassName="text-sm font-bold tracking-tight inline group-hover:text-accent transition-colors" />
            </NavLink>
          </div>

          {/* Center Zone: Sleek Obsidian Glass Command Bar (sm and up) */}
          <div className="hidden sm:flex items-center justify-center flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-3 sm:mx-6">
            <button
              type="button"
              onClick={handleSearchPillClick}
              className="relative flex items-center justify-between w-full h-9 px-3.5 rounded-full bg-surface-2/40 hover:bg-surface-2/70 border border-line-subtle/90 hover:border-accent/40 text-text-secondary/80 hover:text-text transition-all duration-200 shadow-xs hover:shadow-[0_0_12px_-2px_rgba(255,161,22,0.15)] group cursor-pointer"
              title="Search problems, patterns, tags (⌘K or /)"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-colors shrink-0" />
                <span className="truncate text-xs font-normal text-text-secondary/80 group-hover:text-text transition-colors">
                  Search problems, patterns, tags...
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <kbd className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-surface/90 border border-line-subtle font-mono text-[10px] text-muted group-hover:text-text-secondary transition-colors select-none">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>

          {/* Right Zone: Quick Search (Phone only), + New Problem, and User/Auth Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Phone-only compact search icon button (< sm) */}
            <button
              type="button"
              onClick={handleSearchPillClick}
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-surface-2/60 hover:bg-surface-2 border border-line-subtle/80 hover:border-accent/40 text-text-secondary hover:text-accent transition-all active:scale-95 cursor-pointer shadow-xs"
              aria-label="Search problems"
              title="Search problems (⌘K or /)"
            >
              <Search className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
            </button>

            {/* + New Problem CTA (Harmonized h-9 height across all screen sizes) */}
            <button
              type="button"
              onClick={handleNewProblemClick}
              className="h-9 w-9 sm:w-auto sm:px-3.5 rounded-xl bg-gradient-to-r from-accent to-amber-500 hover:from-accent-hover hover:to-amber-400 text-bg font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_2px_10px_-2px_rgba(255,161,22,0.4)] hover:shadow-[0_4px_14px_-2px_rgba(255,161,22,0.55)] active:scale-95 transition-all cursor-pointer shrink-0"
              aria-label="Create new problem"
              title="Create new problem"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">New Problem</span>
            </button>

            {/* User Profile Avatar / Guest Controls */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium text-accent bg-accent/10 border border-accent/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Demo Mode
                </span>
                <NavLink
                  to="/login"
                  className="h-9 px-3 rounded-xl border border-line-subtle hover:border-line-hover bg-surface-2/80 hover:bg-surface-2 text-text font-semibold text-xs flex items-center justify-center transition-colors active:scale-95"
                >
                  Log In
                </NavLink>
                <NavLink
                  to="/signup"
                  className="hidden lg:inline-flex h-9 px-3.5 rounded-xl bg-accent/15 hover:bg-accent/25 text-accent border border-accent/30 font-semibold text-xs items-center justify-center transition-colors active:scale-95"
                >
                  Sign Up
                </NavLink>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsUserMenuOpen((prev) => !prev);
                  }}
                  className={`h-9 flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 rounded-xl transition-all cursor-pointer border ${
                    isUserMenuOpen
                      ? 'border-accent/40 bg-surface-2 shadow-[0_0_10px_-2px_rgba(255,161,22,0.2)]'
                      : 'border-line-subtle/80 hover:border-line bg-surface-2/50 hover:bg-surface-2'
                  }`}
                  aria-label="User menu"
                  title={user?.name || 'Account'}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover border border-line"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-surface border border-line flex items-center justify-center text-xs font-semibold text-accent">
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
            )}
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
          className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-surface/90 backdrop-blur-xl border-t border-line-subtle pb-safe select-none shadow-[0_-2px_15px_-3px_rgba(0,0,0,0.6)]"
        >
          <div className="grid grid-cols-4 items-center w-full max-w-md mx-auto px-2 py-1">
            {WORKSPACE_LINKS.map(({ to, label, Icon }) => {
              const isRevision = label === 'Revision';
              const badge = isRevision ? revisionCount : 0;

              const handleMobileNavClick = (e) => {
                if (!isAuthenticated && (to === '/revision' || to.startsWith('/profile'))) {
                  e.preventDefault();
                  openAuthGate({
                    title: label === 'Revision' ? 'Spaced Repetition Queue' : 'Personal Profile & Analytics',
                    description:
                      label === 'Revision'
                        ? 'Create an account to track your personalized forgetting curve and revision schedules.'
                        : 'Create an account to track your consistency streak, activity heatmap, and target goals.',
                    contextAction: label,
                    targetUrl: to,
                  });
                }
              };

              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={handleMobileNavClick}
                  className={({ isActive }) => `
                    relative flex flex-col items-center justify-center py-1 px-1 rounded-md transition-colors min-h-[48px] cursor-pointer select-none
                    ${isActive ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {/* Quiet Top Indicator Line */}
                      {isActive && (
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full bg-accent shadow-[0_0_8px_rgba(255,161,22,0.85)]" />
                      )}

                      {/* Icon Container */}
                      <div className="relative flex items-center justify-center w-8 h-6">
                        <Icon className={`w-4 h-4 transition-all duration-150 ${isActive ? 'text-accent drop-shadow-[0_0_6px_rgba(255,161,22,0.5)] scale-105' : 'text-text-secondary'}`} />
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
        onOpenQuickAdd={() => {
          if (!isAuthenticated) {
            openAuthGate({
              title: 'Add a Problem',
              description: 'Create an account to catalog your custom problems, code solutions, and configure spaced repetition.',
              contextAction: 'Add Problem',
            });
          } else {
            setIsQuickAddOpen(true);
          }
        }}
      />

      {/* Contextual Auth Gate Modal */}
      <AuthGateModal
        isOpen={authGateConfig.isOpen}
        onClose={closeAuthGate}
        title={authGateConfig.title}
        description={authGateConfig.description}
        contextAction={authGateConfig.contextAction}
        targetUrl={authGateConfig.targetUrl}
      />

      {/* PWA Install Prompt Banner */}
      <InstallAppBanner />
    </div>
  );
};

export default AppShell;
