import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FolderCode,
  RotateCw,
  BarChart2,
  User as UserIcon,
  Settings,
  Search,
  Sun,
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import AccountModal from '../components/common/AccountModal';

/**
 * 3D Isometric Blue Cube Logo matching reference image
 */
function LogoMark() {
  return (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_0_16px_rgba(37,99,235,0.45)] shrink-0">
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
          fill="#1d4ed8"
          fillOpacity="0.4"
        />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="#ffffff" />
        <line x1="12" y1="22.08" x2="12" y2="12" stroke="#ffffff" />
      </svg>
    </div>
  );
}

/**
 * AppLayout: Exact match to the reference desktop & mobile application layout.
 * Features:
 * - Desktop: Fixed left sidebar + top search header (Ctrl K) + profile pill
 * - Mobile (Screen 1 & 3): Clean top bar (Logo left, Hamburger right) + full mobile drawer with profile and sign out
 */
export default function AppLayout() {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const { user, logout } = useAuth();
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
    setIsAccountOpen(false);
    setIsMobileMenuOpen(false);
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
    { name: 'Profile', onClick: () => setIsAccountOpen(true), icon: UserIcon },
    { name: 'Settings', onClick: () => setIsAccountOpen(true), icon: Settings },
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
            <span className="font-bold text-base tracking-tight text-white group-hover:text-blue-400 transition-colors">
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
                    className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-surface transition-all text-left group"
                  >
                    <Icon className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
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
                      ? 'bg-blue-600 text-white font-semibold shadow-[0_0_16px_rgba(37,99,235,0.4)]'
                      : 'text-text-secondary hover:text-white hover:bg-surface'
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
        <header className="h-16 border-b border-line bg-bg/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
          {/* Mobile View: Logo on Left, User Profile on Right */}
          <div className="flex items-center justify-between w-full lg:hidden">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-bold text-base tracking-tight text-white">
                DSA Tracker
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsAccountOpen(true)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-surface border border-line hover:border-accent/40 hover:bg-surface-hover transition-all cursor-pointer active:scale-95 group shadow-xs"
              title="Account settings"
              aria-label="Account settings"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs font-mono shadow-xs shrink-0">
                {displayInitial}
              </div>
              <span className="text-xs font-semibold text-white tracking-tight max-w-[100px] truncate">
                {displayName}
              </span>
            </button>
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
              className="w-full bg-surface border border-line rounded-xl pl-9 pr-14 py-2 text-xs text-white placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
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

          {/* Desktop Right Controls: Sun, Bell, User Profile Pill */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Sun / Theme Icon */}
            <button
              type="button"
              className="p-2 rounded-xl text-text-secondary hover:text-white hover:bg-surface transition-colors"
              title="Toggle theme"
              aria-label="Theme toggle"
            >
              <Sun className="w-4 h-4" />
            </button>

            {/* Notification Bell with Red Badge Dot */}
            <button
              type="button"
              className="p-2 rounded-xl text-text-secondary hover:text-white hover:bg-surface relative transition-colors"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-bg" />
            </button>

            {/* User Profile Pill (Avatar + Name + Down Chevron) */}
            <button
              type="button"
              onClick={() => setIsAccountOpen(true)}
              className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-full bg-surface border border-line hover:border-accent/40 hover:bg-surface-hover transition-all cursor-pointer active:scale-95 group shadow-xs"
              title="Account settings"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs font-mono shadow-xs shrink-0">
                {displayInitial}
              </div>
              <span className="text-xs font-semibold text-white tracking-tight">
                {displayName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted group-hover:text-white transition-colors" />
            </button>
          </div>
        </header>

        {/* Main Viewport Container */}
        <main className="p-3 sm:p-5 lg:p-8 pb-24 lg:pb-8 flex-1 w-full max-w-[1560px]">
          <Outlet />
        </main>
      </div>

      {/* ==============================================================
          MOBILE STICKY BOTTOM NAVBAR (Screen Navigation + 3-line Menu)
          ============================================================== */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0b0f17]/95 backdrop-blur-md border-t border-[#1e293b] shadow-2xl pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="grid grid-cols-4 h-16 max-w-md mx-auto px-2">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              location.pathname === '/dashboard' || location.pathname === '/'
                ? 'text-blue-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                location.pathname === '/dashboard' || location.pathname === '/'
                  ? 'bg-blue-600/15'
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
                ? 'text-blue-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                location.pathname.startsWith('/problems') ? 'bg-blue-600/15' : ''
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
                ? 'text-blue-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                location.pathname.startsWith('/revision') ? 'bg-blue-600/15' : ''
              }`}
            >
              <RotateCw className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Revision</span>
          </Link>

          {/* 3 lines Menu Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              isMobileMenuOpen
                ? 'text-blue-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-label="Open menu"
          >
            <div
              className={`p-1 rounded-lg ${
                isMobileMenuOpen ? 'bg-blue-600/15' : ''
              }`}
            >
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
          </button>
        </div>
      </nav>

      {/* ==============================================================
          MOBILE SLIDE-OVER DRAWER (Exact Match to Screen 3)
          ============================================================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0b0f17] border-r border-[#1e293b] p-5 flex flex-col justify-between z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header (Logo + Brand + Close Button) */}
              <div className="flex items-center justify-between pb-5 border-b border-[#1e293b]">
                <div className="flex items-center gap-3">
                  <LogoMark />
                  <span className="font-bold text-base tracking-tight text-white">
                    DSA Tracker
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-xl bg-[#131b2e] border border-[#1e293b] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <nav className="mt-6 space-y-2">
                {[
                  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                  { name: 'Problems', path: '/problems', icon: FolderCode },
                  { name: 'Revision', path: '/revision', icon: RotateCw },
                ].map((item) => {
                  const Icon = item.icon;
                  const isItemActive =
                    item.path === '/dashboard'
                      ? location.pathname === '/dashboard'
                      : location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isItemActive
                          ? 'bg-blue-600 text-white font-semibold shadow-[0_0_16px_rgba(37,99,235,0.4)]'
                          : 'text-slate-300 hover:text-white hover:bg-[#131b2e]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      {!isItemActive && (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Bottom Section: User Profile Row + Sign Out */}
            <div className="pt-4 border-t border-[#1e293b] space-y-3">
              {/* User Profile Pill Row */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAccountOpen(true);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#131b2e] border border-[#1e293b] hover:border-blue-500/40 transition-colors group text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs font-mono shrink-0 shadow-xs">
                    {displayInitial}
                  </div>
                  <span className="text-sm font-semibold text-white tracking-tight truncate">
                    {displayName}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
              </button>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Details Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
    </div>
  );
}
