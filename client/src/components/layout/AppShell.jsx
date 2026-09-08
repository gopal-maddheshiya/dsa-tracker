import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ── Icons (inline SVG keeps zero dependency) ─────────────────────── */
const Icon = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Problems: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  Revision: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Chevron: ({ collapsed }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Profile: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Flame: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c0 0-5 5.5-5 10a5 5 0 0010 0C17 7.5 12 2 12 2zM9.5 16c-.83 0-1.5-.67-1.5-1.5 0-1.66 1.5-3 1.5-3s1.5 1.34 1.5 3c0 .83-.67 1.5-1.5 1.5z" />
    </svg>
  ),
};

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', Icon: Icon.Dashboard },
  { to: '/problems',  label: 'Problems',  Icon: Icon.Problems  },
  { to: '/revision',  label: 'Revision',  Icon: Icon.Revision  },
  { to: '/profile',   label: 'Profile',   Icon: Icon.Profile   },
];

/* ── Sidebar component ──────────────────────────────────────────────── */
const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
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
          ? 'bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20'
          : 'text-[#6B6560] hover:text-[#A8A29E] hover:bg-[#211F1D] border border-transparent'
        }
      `}
    >
      {({ isActive }) => (
        <>
          {/* Active left accent bar */}
          {isActive && (
            <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[#F97316]" />
          )}
          <span className={`shrink-0 ${isActive ? 'text-[#F97316]' : 'text-[#3E3834] group-hover:text-[#6B6560]'} transition-colors`}>
            <NavIcon />
          </span>
          {!collapsed && <span className="truncate">{label}</span>}
        </>
      )}
    </NavLink>
  );

  return (
    <aside
      className={`
        flex flex-col h-full bg-[#111110] border-r border-[#262320]
        transition-all duration-300 ease-in-out overflow-hidden
        ${collapsed ? 'w-[64px]' : 'w-[220px]'}
      `}
    >
      {/* ── Logo ──────────────────────────────── */}
      <div className="flex items-center h-[58px] px-3 border-b border-[#262320] shrink-0">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 min-w-0" onClick={onMobileClose}>
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] dot-pulse" />
          </div>
          {!collapsed && (
            <span className="font-bold text-sm tracking-tight text-[#F5F5F4] truncate">
              DSA<span className="text-[#F97316]">Tracker</span>
            </span>
          )}
        </NavLink>
        {/* Desktop collapse toggle */}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto p-1.5 rounded-lg text-[#3E3834] hover:text-[#6B6560] hover:bg-[#1C1A18] transition-all"
            title="Collapse sidebar"
          >
            <Icon.Chevron collapsed={false} />
          </button>
        )}
      </div>

      {/* ── Nav ───────────────────────────────── */}
      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
        {collapsed ? (
          // Icon-only expand button at top when collapsed
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2.5 mb-2 rounded-xl text-[#3E3834] hover:text-[#6B6560] hover:bg-[#1C1A18] transition-all"
            title="Expand sidebar"
          >
            <Icon.Chevron collapsed={true} />
          </button>
        ) : (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[#3E3834] font-mono">
            Navigation
          </p>
        )}
        {NAV_LINKS.map(({ to, label, Icon: NavIcon }) => (
          <SideNavLink key={to} to={to} label={label} Icon={NavIcon} />
        ))}
      </nav>

      {/* ── Streak strip ──────────────────────── */}
      {!collapsed && (
        <div className="mx-2.5 mb-2 px-3 py-2.5 rounded-xl bg-[#1C1A18] border border-[#262320]">
          <div className="flex items-center gap-2">
            <span className="text-orange-400"><Icon.Flame /></span>
            <div className="min-w-0">
              <p className="text-[10px] font-mono text-[#3E3834] uppercase tracking-wider">Streak</p>
              <p className="text-xs font-bold font-mono text-[#F5F5F4]">Keep going! 🔥</p>
            </div>
          </div>
        </div>
      )}

      {/* ── User footer ───────────────────────── */}
      <div className={`shrink-0 border-t border-[#262320] p-2.5 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {collapsed ? (
          <>
            {/* Avatar only */}
            <div className="w-8 h-8 rounded-xl bg-[#F97316]/15 border border-[#F97316]/20 flex items-center justify-center">
              <span className="text-[11px] font-bold text-[#F97316] font-mono">{initials}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-[#3E3834] hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Sign out"
            >
              <Icon.Logout />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2.5 p-1">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl bg-[#F97316]/15 border border-[#F97316]/20 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-[#F97316] font-mono">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#F5F5F4] truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-[#3E3834] font-mono truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#3E3834] hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
              title="Sign out"
            >
              <Icon.Logout />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

/* ── AppShell — top-level layout wrapper ─────────────────────────── */
const AppShell = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Desktop collapse state (persisted)
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === 'true'; } catch { return false; }
  });

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <div className="min-h-screen flex flex-col bg-[#121110] text-[#F5F5F4]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#121110] text-[#F5F5F4]">

      {/* ── Mobile overlay backdrop ─────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
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
        />
      </div>

      {/* ── Desktop sidebar ─────────────────────── */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar
          collapsed={collapsed}
          onToggle={toggleCollapsed}
          onMobileClose={() => {}}
        />
      </div>

      {/* ── Main area ───────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar (mobile only) */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-[58px] px-4 border-b border-[#262320] bg-[#121110]/90 backdrop-blur-xl shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-[#6B6560] hover:text-[#A8A29E] hover:bg-[#1C1A18] transition-all"
          >
            <Icon.Menu />
          </button>
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-[#F97316] dot-pulse" />
            </div>
            <span className="font-bold text-sm text-[#F5F5F4]">DSA<span className="text-[#F97316]">Tracker</span></span>
          </NavLink>
          <div className="w-9" /> {/* spacer */}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-9 animate-fade-up">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="shrink-0 border-t border-[#262320] py-3 text-center">
          <p className="text-[10px] text-[#3E3834] font-mono tracking-wide">
            DSA Tracker · Spaced Repetition Engine · v1.1
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AppShell;
