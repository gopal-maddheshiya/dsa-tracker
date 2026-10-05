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
 * AppLayout: Exact match to the reference desktop application layout.
 * Features:
 * - Fixed left sidebar with 3D logo, vertical navigation, active blue pill
 * - Top header with full-width search input (Ctrl K), theme toggle, notification bell with unread dot, and user avatar pill
 * - Smooth mobile drawer for responsive viewports
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
          {/* Mobile Brand / Toggle */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface border border-line"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <LogoMark />
              <span className="font-bold text-sm tracking-tight text-white">
                DSA Tracker
              </span>
            </Link>
          </div>

          {/* Search Input Bar (Matching Reference) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden sm:flex items-center relative flex-1 max-w-md lg:max-w-lg"
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

          {/* Right Controls: Sun, Bell, User Profile Pill */}
          <div className="flex items-center gap-3">
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
        <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-[1560px]">
          <Outlet />
        </main>
      </div>

      {/* ==============================================================
          MOBILE SLIDE-OVER DRAWER
          ============================================================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-line p-5 flex flex-col justify-between z-50 shadow-elevated">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-line">
                <div className="flex items-center gap-3">
                  <LogoMark />
                  <span className="font-bold text-sm text-white">DSA Tracker</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-text-secondary hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-5 space-y-1.5">
                {sidebarLinks.map((item) => {
                  const Icon = item.icon;
                  if (item.onClick) {
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          item.onClick();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-surface-2 text-left"
                      >
                        <Icon className="w-4 h-4 text-muted" />
                        <span>{item.name}</span>
                      </button>
                    );
                  }

                  const isItemActive =
                    item.path === '/dashboard'
                      ? location.pathname === '/dashboard'
                      : location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isItemActive
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-text-secondary hover:text-white hover:bg-surface-2'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-line space-y-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl"
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
