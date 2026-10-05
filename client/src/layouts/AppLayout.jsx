import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Code2,
  LayoutDashboard,
  ListChecks,
  RotateCw,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react';

/**
 * AppLayout: Main shell for authenticated / application views.
 * Features a refined developer top navbar with Code2 logo, responsive mobile drawer,
 * and a sticky mobile footer tab bar for fast one-thumb navigation.
 */
export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Problems', path: '/problems', icon: ListChecks },
    { name: 'Revision', path: '/revision', icon: RotateCw },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col selection:bg-accent/20 selection:text-accent">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-line bg-bg/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/25 via-accent/15 to-surface-2 border border-accent/35 flex items-center justify-center text-accent shadow-xs group-hover:border-accent/60 group-hover:shadow-[0_0_12px_rgba(99,102,241,0.25)] transition-all duration-150 group-active:scale-95 shrink-0">
                  <Code2 className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm tracking-tight text-text leading-tight group-hover:text-text">
                    DSA Tracker
                  </span>
                  <span className="text-[10px] font-mono text-muted leading-none hidden sm:block">
                    prep workspace
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-1.5 ml-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 active:scale-95 ${
                          isActive
                            ? 'bg-surface-2 text-accent border border-accent/25 font-semibold shadow-xs'
                            : 'text-text-secondary hover:text-text hover:bg-surface-hover/70'
                        }`
                      }
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Right Side Status & User Profile */}
            <div className="flex items-center gap-2.5">
              {user ? (
                <>
                  {/* User Profile Badge (Desktop) */}
                  <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface border border-line text-xs font-medium text-text shadow-xs">
                    <div className="relative flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 text-accent font-semibold flex items-center justify-center text-[10px] font-mono">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-surface" />
                    </div>
                    <span className="truncate max-w-[130px] font-medium">{user.name}</span>
                  </div>

                  {/* Logout Button (Desktop) */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Sign out"
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-danger hover:border-danger/30 hover:bg-danger/10 border border-line rounded-md transition-all duration-150 active:scale-95 focus-visible:ring-1 focus-visible:ring-accent"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-xs font-medium text-text-secondary hover:text-text px-2.5 py-1.5 rounded hover:bg-surface-hover transition-colors"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Drawer Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-text-secondary hover:text-text hover:bg-surface-hover border border-line focus:outline-none focus-visible:ring-1 focus-visible:ring-accent transition-colors"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-4 h-4 text-text" />
                ) : (
                  <Menu className="w-4 h-4 text-text" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer with Backdrop */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 top-14 bg-black/60 backdrop-blur-[2px] z-30 transition-opacity duration-200 md:hidden animate-in fade-in"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-40 md:hidden border-t border-line bg-surface px-4 pt-3 pb-4 space-y-1.5 shadow-elevated animate-in fade-in slide-in-from-top-2 duration-150">
              {user && (
                <div className="px-3.5 py-2 text-xs border-b border-line-subtle mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-text">{user.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-muted truncate max-w-[150px]">
                    {user.email}
                  </span>
                </div>
              )}
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium rounded-md transition-all ${
                        isActive
                          ? 'bg-surface-2 text-accent border border-accent/25 font-semibold shadow-xs'
                          : 'text-text-secondary hover:text-text hover:bg-surface-hover active:bg-surface-hover/80'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
              <div className="pt-2 border-t border-line-subtle">
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-3.5 py-2.5 text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-hover rounded-md"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:py-8 w-full flex-1">
        <Outlet />
      </main>

      {/* Mobile Footer Navbar (Sticky Bottom Tab Bar) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-surface/95 backdrop-blur-md border-t border-line shadow-elevated pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-1.5 px-3"
      >
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 px-2 rounded-lg transition-all duration-150 active:scale-90 relative ${
                    isActive
                      ? 'text-accent bg-accent/10 border border-accent/25 font-semibold'
                      : 'text-text-secondary hover:text-text'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] mt-1 leading-none tracking-tight font-medium">
                      {item.name}
                    </span>
                    {isActive && (
                      <span className="absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Account / Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg transition-all duration-150 active:scale-90 relative ${
              mobileMenuOpen
                ? 'text-accent bg-accent/10 border border-accent/25 font-semibold'
                : 'text-text-secondary hover:text-text'
            }`}
            aria-label="Toggle user account menu"
          >
            <div className="relative">
              <User className="w-4 h-4 shrink-0" />
              {user && (
                <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </div>
            <span className="text-[10px] mt-1 leading-none tracking-tight font-medium">
              Account
            </span>
          </button>
        </div>
      </nav>

      {/* Minimal Developer Footer (Desktop only) */}
      <footer className="hidden md:block w-full border-t border-line bg-bg py-4 text-center text-xs text-muted font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DSA / Interview Prep Tracker · Personal Engineering Practice</span>
          <span className="text-[11px] text-text-secondary">
            MERN Stack · Spaced Repetition & Analytics
          </span>
        </div>
      </footer>
    </div>
  );
}
