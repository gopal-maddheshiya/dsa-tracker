import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchProfileAnalytics } from '../../api/analytics';
import {
  LayoutDashboard,
  Code2,
  Repeat,
  User,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/problems',  label: 'Problems',  Icon: Code2 },
  { to: '/revision',  label: 'Revision',  Icon: Repeat },
  { to: '/profile',   label: 'Profile',   Icon: User },
];

/* ── Sidebar component ──────────────────────────────────────────────── */
const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose, streak }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onMobileClose?.();
  };

  // Derive initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : (user?.email?.[0] ?? 'U').toUpperCase();

  const SideNavLink = ({ to, label, Icon: NavIcon }) => (
    <NavLink
      to={to}
      onClick={onMobileClose}
      className={({ isActive }) => `
        group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm
        transition-all duration-150 relative overflow-hidden
        ${isActive
          ? 'bg-[#F97316]/12 text-[#F97316] border border-[#F97316]/25 font-semibold'
          : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.05] border border-transparent'
        }
      `}
    >
      {({ isActive }) => (
        <>
          {/* Active left accent bar */}
          {isActive && (
            <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[#F97316] shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
          )}
          <span className={`shrink-0 ${isActive ? 'text-[#F97316]' : 'text-[#6B7280] group-hover:text-[#9CA3AF]'} transition-colors`}>
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
        flex flex-col h-full bg-[#0E1013] border-r border-white/[0.08]
        transition-all duration-300 ease-in-out overflow-hidden select-none
        ${collapsed ? 'w-[64px]' : 'w-[224px]'}
      `}
    >
      {/* ── Logo ──────────────────────────────── */}
      <div className="flex items-center h-[60px] px-3.5 border-b border-white/[0.08] shrink-0">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 min-w-0" onClick={onMobileClose}>
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#F97316]/12 border border-[#F97316]/25 shrink-0 shadow-[0_0_12px_rgba(249,115,22,0.15)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] dot-pulse" />
          </div>
          {!collapsed && (
            <span className="font-bold text-sm tracking-tight text-[#F3F4F6] truncate">
              DSA<span className="text-[#F97316]">Tracker</span>
            </span>
          )}
        </NavLink>
        {/* Desktop collapse toggle */}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto p-1.5 rounded-lg text-[#6B7280] hover:text-[#F3F4F6] hover:bg-white/[0.06] transition-all"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Nav ───────────────────────────────── */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
        {collapsed ? (
          // Icon-only expand button at top when collapsed
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2.5 mb-2 rounded-xl text-[#6B7280] hover:text-[#F3F4F6] hover:bg-white/[0.06] transition-all"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] font-mono">
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
          onClick={onMobileClose}
          className="mx-2.5 mb-2 px-3 py-2.5 rounded-xl bg-[#14171C] border border-white/[0.08] hover:border-[#F97316]/40 transition-all block group shadow-sm hover:shadow-[0_0_16px_rgba(249,115,22,0.1)]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#F97316]/15 border border-[#F97316]/25 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono text-[#9CA3AF] uppercase tracking-wider">Practice Streak</p>
              <p className="text-xs font-bold font-mono text-[#F3F4F6] flex items-center gap-1.5">
                <span>{streak != null ? `${streak} day${streak !== 1 ? 's' : ''}` : 'Active'}</span>
              </p>
            </div>
          </div>
        </NavLink>
      )}

      {/* ── User footer ───────────────────────── */}
      <div className={`shrink-0 border-t border-white/[0.08] p-2.5 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {collapsed ? (
          <>
            {/* Avatar only */}
            <div className="w-8 h-8 rounded-xl bg-[#F97316]/15 border border-[#F97316]/25 flex items-center justify-center shadow-[0_0_10px_rgba(249,115,22,0.12)]">
              <span className="text-[11px] font-bold text-[#F97316] font-mono">{initials}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-[#6B7280] hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2.5 p-1">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl bg-[#F97316]/15 border border-[#F97316]/25 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.12)]">
              <span className="text-[11px] font-bold text-[#F97316] font-mono">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#F3F4F6] truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-[#9CA3AF] font-mono truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#6B7280] hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0"
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

  // Desktop collapse state (persisted)
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === 'true'; } catch { return false; }
  });

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [streak, setStreak] = useState(null);

  // Live streak fetch on mount and route change
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileAnalytics()
        .then((res) => {
          if (res?.data?.currentStreak !== undefined) {
            setStreak(res.data.currentStreak);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('sidebar_collapsed', String(next)); } catch {}
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Public pages — no sidebar
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0A0B0D] text-[#F3F4F6]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0A0B0D] text-[#F3F4F6]">

      {/* ── Mobile overlay backdrop ─────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ───────────────────────── */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:hidden
        transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar
          collapsed={false}
          onToggle={() => {}}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          streak={streak}
        />
      </div>

      {/* ── Desktop sidebar ─────────────────────── */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar
          collapsed={collapsed}
          onToggle={toggleCollapsed}
          onMobileClose={() => {}}
          streak={streak}
        />
      </div>

      {/* ── Main area ───────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar (mobile only) */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-[58px] px-4 border-b border-white/[0.08] bg-[#0A0B0D]/90 backdrop-blur-xl shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.06] transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#F97316]/12 border border-[#F97316]/25 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-[#F97316] dot-pulse" />
            </div>
            <span className="font-bold text-sm text-[#F3F4F6]">DSA<span className="text-[#F97316]">Tracker</span></span>
          </NavLink>
          <div className="flex items-center gap-2">
            {streak != null && streak > 0 && (
              <NavLink
                to="/profile"
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#14171C] border border-white/[0.08] text-[11px] font-mono font-bold text-[#F97316] active:scale-95 transition-transform"
                title="Practice streak"
              >
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>{streak}d</span>
              </NavLink>
            )}
            <NavLink
              to="/profile"
              className="w-8 h-8 rounded-xl bg-[#F97316]/15 border border-[#F97316]/25 flex items-center justify-center shadow-[0_0_10px_rgba(249,115,22,0.12)] text-[11px] font-bold text-[#F97316] font-mono active:scale-95 transition-transform"
              title="My Profile"
            >
              {user?.name
                ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                : (user?.email?.[0] ?? 'U').toUpperCase()}
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-9 animate-fade-up">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="shrink-0 border-t border-white/[0.06] py-3 text-center bg-[#0A0B0D]/50 pb-safe">
          <p className="text-[11px] text-[#6B7280] font-mono tracking-wide">
            DSA Tracker · Spaced Repetition Engine · v1.2
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AppShell;
