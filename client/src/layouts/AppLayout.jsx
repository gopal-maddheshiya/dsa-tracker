import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
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
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import LogoMark from '../components/common/LogoMark';
import { useNotifications } from '../context/NotificationContext';
import NotificationPopover from '../components/common/NotificationPopover';

/**
 * AppLayout: Desktop collapsible sidebar and mobile sticky navigation layout.
 */
export default function AppLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const mainRef = useRef(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, toggleOpen, isOpen } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  // GSAP smooth page transition on route change
  useEffect(() => {
    if (mainRef.current && typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        gsap.fromTo(
          mainRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out', clearProps: 'transform' }
        );
      }
    }
  }, [location.pathname]);

  // Collapsible sidebar state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('dsa_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('dsa_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

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

  const displayName = user?.name || 'Developer';
  const displayInitial = displayName.charAt(0).toUpperCase();

  const sidebarLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Problems', path: '/problems', icon: FolderCode },
    { name: 'Revision', path: '/revision', icon: RotateCw },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Profile', path: '/profile', icon: UserIcon },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-bg text-text flex font-sans antialiased selection:bg-accent/25 selection:text-white">
      {/* ==============================================================
          LEFT SIDEBAR (Desktop >= lg, Collapsible)
          ============================================================== */}
      <aside
        className={`hidden lg:flex flex-col justify-between shrink-0 sticky top-0 h-screen select-none z-30 bg-bg border-r border-line transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20 p-3' : 'w-60 xl:w-64 p-5'
        }`}
      >
        <div>
          {/* Logo, Brand & Collapse Toggle */}
          <div
            className={`flex items-center mb-8 ${
              isCollapsed ? 'flex-col gap-3 justify-center' : 'justify-between'
            }`}
          >
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 py-1 group focus:outline-none overflow-hidden ${
                isCollapsed ? 'justify-center w-full' : 'px-1'
              }`}
              title="DSA Tracker"
            >
              <LogoMark size={32} />
              {!isCollapsed && (
                <span className="font-bold text-base tracking-tight text-text group-hover:text-accent transition-colors truncate">
                  DSA Tracker
                </span>
              )}
            </Link>

            {/* Collapse/Expand Toggle Button */}
            <button
              type="button"
              onClick={toggleSidebar}
              className={`p-1.5 rounded-xl border border-transparent text-muted hover:text-text hover:bg-surface hover:border-line transition-all active:scale-95 ${
                isCollapsed ? 'w-full flex items-center justify-center py-2' : ''
              }`}
              title={isCollapsed ? 'Expand sidebar' : 'Minimize sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Minimize sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-text-secondary" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-text-secondary" />
              )}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              const isItemActive =
                item.path === '/dashboard'
                  ? location.pathname === '/dashboard' || location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  title={item.name}
                  className={`flex items-center gap-3.5 rounded-xl text-xs font-medium transition-all ${
                    isCollapsed ? 'justify-center px-0 py-3' : 'px-3.5 py-2.5'
                  } ${
                    isItemActive
                      ? 'bg-accent text-white font-semibold shadow-[0_0_18px_rgba(237,134,65,0.35)]'
                      : 'text-text-secondary hover:text-text hover:bg-surface'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isItemActive ? 'text-white' : 'text-muted'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
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
            title="Sign Out"
            className={`w-full flex items-center gap-3 text-xs font-medium text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors ${
              isCollapsed ? 'justify-center p-3' : 'px-3 py-2'
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ==============================================================
          MAIN CONTENT WORKSPACE (with Top Navbar)
          ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-line bg-surface/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-xs">
          {/* Mobile View: Logo on Left, Notifications & Theme Toggle on Right */}
          <div className="flex items-center justify-between w-full lg:hidden">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <LogoMark size={30} />
              <span className="font-bold text-base tracking-tight text-text">
                DSA Tracker
              </span>
            </Link>

            <div className="flex items-center gap-2">
              {/* Mobile Notification Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleOpen}
                  data-notification-trigger="true"
                  aria-expanded={isOpen}
                  aria-haspopup="dialog"
                  className={`p-2 rounded-xl bg-surface border transition-all active:scale-95 shadow-xs relative ${
                    isOpen
                      ? 'border-accent/40 bg-surface-2 text-accent'
                      : 'border-line text-text-secondary hover:text-text'
                  }`}
                  title={`Notifications (${unreadCount} unread)`}
                  aria-label={`Notifications (${unreadCount} unread)`}
                >
                  <Bell className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-12 text-accent' : ''}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 px-1 min-w-4 h-4 rounded-full bg-accent text-[9px] font-mono font-bold text-white flex items-center justify-center ring-2 ring-surface shadow-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationPopover align="right" />
              </div>

              {/* Mobile Theme Toggle */}
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
            </div>
          </div>

          {/* Desktop Search Input Bar */}
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

            {/* Desktop Notification Bell with interactive popover */}
            <div className="relative">
              <button
                type="button"
                onClick={toggleOpen}
                data-notification-trigger="true"
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                className={`p-2 rounded-xl transition-all active:scale-95 relative group ${
                  isOpen
                    ? 'bg-surface-2 text-text border border-line shadow-xs'
                    : 'text-text-secondary hover:text-text hover:bg-surface'
                }`}
                title={`Notifications (${unreadCount} unread)`}
                aria-label={`Notifications (${unreadCount} unread)`}
              >
                <Bell className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-12 text-accent' : 'group-hover:rotate-6'}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 min-w-4.5 h-4.5 rounded-full bg-accent text-[9px] font-mono font-bold text-white flex items-center justify-center ring-2 ring-surface shadow-xs animate-in zoom-in-75">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationPopover align="right" />
            </div>

            {/* User Profile Pill linking to /profile */}
            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-full bg-surface border border-line hover:border-accent/40 hover:bg-surface-hover transition-all active:scale-95 group shadow-xs"
              title="Developer Profile"
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
        <main ref={mainRef} className="p-3 sm:p-5 lg:p-8 pb-24 lg:pb-8 flex-1 w-full max-w-[1560px]">
          <Outlet />
        </main>
      </div>

      {/* ==============================================================
          MOBILE STICKY BOTTOM NAVBAR (Dashboard, Problems, Revision, Analytics, Profile)
          ============================================================== */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-surface/95 backdrop-blur-2xl border-t border-line shadow-[0_-8px_24px_rgba(0,0,0,0.12)] pb-[max(env(safe-area-inset-bottom,0px),4px)]"
      >
        <div className="grid grid-cols-5 h-[68px] max-w-lg mx-auto px-1.5 items-center">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className="group flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation"
          >
            <div
              className={`px-3 py-1 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                location.pathname === '/dashboard' || location.pathname === '/'
                  ? 'bg-accent/15 text-accent shadow-xs scale-105'
                  : 'text-text-secondary group-hover:text-text group-hover:bg-surface-2/60'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 transition-transform" />
            </div>
            <span
              className={`text-[11px] mt-1 tracking-tight truncate transition-colors ${
                location.pathname === '/dashboard' || location.pathname === '/'
                  ? 'text-accent font-semibold'
                  : 'text-text-secondary font-medium'
              }`}
            >
              Dashboard
            </span>
          </Link>

          {/* Problems */}
          <Link
            to="/problems"
            className="group flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation"
          >
            <div
              className={`px-3 py-1 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                location.pathname.startsWith('/problems')
                  ? 'bg-accent/15 text-accent shadow-xs scale-105'
                  : 'text-text-secondary group-hover:text-text group-hover:bg-surface-2/60'
              }`}
            >
              <FolderCode className="w-5 h-5 transition-transform" />
            </div>
            <span
              className={`text-[11px] mt-1 tracking-tight truncate transition-colors ${
                location.pathname.startsWith('/problems')
                  ? 'text-accent font-semibold'
                  : 'text-text-secondary font-medium'
              }`}
            >
              Problems
            </span>
          </Link>

          {/* Revision */}
          <Link
            to="/revision"
            className="group flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation"
          >
            <div
              className={`px-3 py-1 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                location.pathname.startsWith('/revision')
                  ? 'bg-accent/15 text-accent shadow-xs scale-105'
                  : 'text-text-secondary group-hover:text-text group-hover:bg-surface-2/60'
              }`}
            >
              <RotateCw className="w-5 h-5 transition-transform" />
            </div>
            <span
              className={`text-[11px] mt-1 tracking-tight truncate transition-colors ${
                location.pathname.startsWith('/revision')
                  ? 'text-accent font-semibold'
                  : 'text-text-secondary font-medium'
              }`}
            >
              Revision
            </span>
          </Link>

          {/* Analytics */}
          <Link
            to="/analytics"
            className="group flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation"
          >
            <div
              className={`px-3 py-1 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                location.pathname.startsWith('/analytics')
                  ? 'bg-accent/15 text-accent shadow-xs scale-105'
                  : 'text-text-secondary group-hover:text-text group-hover:bg-surface-2/60'
              }`}
            >
              <BarChart2 className="w-5 h-5 transition-transform" />
            </div>
            <span
              className={`text-[11px] mt-1 tracking-tight truncate transition-colors ${
                location.pathname.startsWith('/analytics')
                  ? 'text-accent font-semibold'
                  : 'text-text-secondary font-medium'
              }`}
            >
              Analytics
            </span>
          </Link>

          {/* Profile */}
          <Link
            to="/profile"
            className="group flex flex-col items-center justify-center py-1 transition-all active:scale-95 touch-manipulation"
          >
            <div
              className={`px-3 py-1 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                location.pathname === '/profile' ||
                location.pathname === '/settings' ||
                location.pathname === '/account'
                  ? 'bg-accent/15 text-accent shadow-xs scale-105'
                  : 'text-text-secondary group-hover:text-text group-hover:bg-surface-2/60'
              }`}
            >
              <UserIcon className="w-5 h-5 transition-transform" />
            </div>
            <span
              className={`text-[11px] mt-1 tracking-tight truncate transition-colors ${
                location.pathname === '/profile' ||
                location.pathname === '/settings' ||
                location.pathname === '/account'
                  ? 'text-accent font-semibold'
                  : 'text-text-secondary font-medium'
              }`}
            >
              Profile
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
