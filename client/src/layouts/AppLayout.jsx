import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  FolderCode,
  RotateCw,
  BarChart2,
  User as UserIcon,
  Settings,
  Search,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  LogOut,
} from 'lucide-react';

/**
 * 3D Isometric Blue Cube Logo matching reference image
 */
function LogoMark() {
  return (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ed8641] to-[#e0722a] flex items-center justify-center shadow-[0_0_18px_rgba(237,134,65,0.4)] shrink-0">
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
          fill="#ed8641"
          fillOpacity="0.4"
        />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="#ffffff" />
        <line x1="12" y1="22.08" x2="12" y2="12" stroke="#ffffff" />
      </svg>
    </div>
  );
}

/**
 * AppLayout: Desktop sidebar and mobile sticky navigation layout.
 */
export default function AppLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Global Ctrl+K / Cmd+K listener to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/problems?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/problems');
    }
  };

  const displayName = user?.name || 'Aditya';
  const displayInitial = displayName.charAt(0).toUpperCase();

  const sidebarLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Problems', path: '/problems', icon: FolderCode },
    { name: 'Revision', path: '/revision', icon: RotateCw },
    { name: 'Analytics', path: '/dashboard#analytics', icon: BarChart2 },
    { name: 'Profile', path: '/account', icon: UserIcon },
    { name: 'Settings', path: '/account', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-bg text-text flex font-sans antialiased selection:bg-accent/25 selection:text-white">
      {/* ==============================================================
          LEFT SIDEBAR (Desktop >= lg)
          ============================================================== */}
      <aside className="hidden lg:flex w-60 xl:w-64 bg-bg border-r border-line flex-col justify-between shrink-0 p-5 sticky top-0 h-screen select-none z-30">
        <div>
          {/* Logo & Brand Name */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-2 py-1 mb-8 group focus:outline-none"
          >
            <LogoMark />
            <span className="font-bold text-base tracking-tight text-text group-hover:text-accent transition-colors">
              DSA Tracker
            </span>
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              if (item.onClick) {
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-text-secondary hover:text-text hover:bg-surface transition-all text-left group"
                  >
                    <Icon className="w-4 h-4 text-muted group-hover:text-text transition-colors" />
                    <span>{item.name}</span>
                  </button>
                );
              }

              const isItemActive =
                item.path === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isItemActive
                      ? 'bg-accent text-white font-semibold shadow-[0_0_18px_rgba(237,134,65,0.35)]'
                      : 'text-text-secondary hover:text-text hover:bg-surface'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isItemActive ? 'text-white' : 'text-muted'
                    }`}
                  />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Sign Out button */}
        <div className="pt-4 border-t border-line">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ==============================================================
          MAIN CONTENT WORKSPACE (with Top Navbar)
          ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-line bg-surface/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
          {/* Mobile View: Logo on Left, Theme Toggle & User Profile Link on Right */}
          <div className="flex items-center justify-between w-full lg:hidden">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-bold text-base tracking-tight text-text">
                DSA Tracker
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-surface border border-line text-text-secondary hover:text-text hover:bg-surface-hover active:scale-95 transition-all shadow-xs"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-500" />
                )}
              </button>

              <Link
                to="/account"
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-surface border border-line hover:border-accent/40 hover:bg-surface-hover transition-all active:scale-95 group shadow-xs"
                title="Account & Profile"
                aria-label="Account & Profile"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ed8641] to-[#f97316] text-white font-bold flex items-center justify-center text-xs font-mono shadow-xs shrink-0">
                  {displayInitial}
                </div>
                <span className="text-xs font-semibold text-text tracking-tight max-w-[100px] truncate">
                  {displayName}
                </span>
              </Link>
            </div>
          </div>

          {/* Desktop Search Input Bar (Matching Reference) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center relative flex-1 max-w-md xl:max-w-lg"
          >
            <Search className="w-4 h-4 text-muted absolute left-3.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems, topics, or platforms..."
              className="w-full bg-surface border border-line rounded-xl pl-9 pr-14 py-2 text-xs text-text placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:shadow-[0_0_16px_rgba(237,134,65,0.18)] transition-all duration-200"
            />
            <div className="absolute right-2.5 flex items-center gap-1 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-muted bg-surface-2 border border-line rounded">
                Ctrl
              </kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-muted bg-surface-2 border border-line rounded">
                K
              </kbd>
            </div>
          </form>

          {/* Desktop Right Controls: Sun/Moon, Bell, User Profile Pill */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Sun / Moon Theme Toggle Icon */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-text-secondary hover:text-text hover:bg-surface transition-all active:scale-95 group"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Notification Bell with Red Badge Dot */}
            <button
              type="button"
              className="p-2 rounded-xl text-text-secondary hover:text-text hover:bg-surface relative transition-colors"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-bg" />
            </button>

            {/* User Profile Pill linking to /account */}
            <Link
              to="/account"
              className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-full bg-surface border border-line hover:border-accent/40 hover:bg-surface-hover transition-all active:scale-95 group shadow-xs"
              title="Account & Profile"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ed8641] to-[#f97316] text-white font-bold flex items-center justify-center text-xs font-mono shadow-xs shrink-0">
                {displayInitial}
              </div>
              <span className="text-xs font-semibold text-text tracking-tight">
                {displayName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted group-hover:text-text transition-colors" />
            </Link>
          </div>
        </header>

        {/* Main Viewport Container */}
        <main className="p-3 sm:p-5 lg:p-8 pb-24 lg:pb-8 flex-1 w-full max-w-[1560px]">
          <Outlet />
        </main>
      </div>

      {/* ==============================================================
          MOBILE STICKY BOTTOM NAVBAR (Dashboard, Problems, Revision, Account)
          ============================================================== */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-surface/90 backdrop-blur-xl border-t border-line shadow-elevated pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="grid grid-cols-4 h-16 max-w-md mx-auto px-2">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              location.pathname === '/dashboard' || location.pathname === '/'
                ? 'text-accent font-semibold'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                location.pathname === '/dashboard' || location.pathname === '/'
                  ? 'bg-accent/15'
                  : ''
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Dashboard</span>
          </Link>

          {/* Problems */}
          <Link
            to="/problems"
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              location.pathname.startsWith('/problems')
                ? 'text-accent font-semibold'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                location.pathname.startsWith('/problems') ? 'bg-accent/15' : ''
              }`}
            >
              <FolderCode className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Problems</span>
          </Link>

          {/* Revision */}
          <Link
            to="/revision"
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              location.pathname.startsWith('/revision')
                ? 'text-accent font-semibold'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                location.pathname.startsWith('/revision') ? 'bg-accent/15' : ''
              }`}
            >
              <RotateCw className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Revision</span>
          </Link>

          {/* Account */}
          <Link
            to="/account"
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              location.pathname === '/account' || location.pathname === '/profile'
                ? 'text-accent font-semibold'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                location.pathname === '/account' || location.pathname === '/profile'
                  ? 'bg-accent/15'
                  : ''
              }`}
            >
              <UserIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Account</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
