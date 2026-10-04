import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

/**
 * AppLayout: Main shell for authenticated / application views.
 * Features a restrained, developer-focused top navbar, responsive mobile menu,
 * user identity badge, and logout trigger.
 */
export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Problems', path: '/problems' },
    { name: 'Revision', path: '/revision' },
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

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col selection:bg-accent/20 selection:text-accent">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-line bg-bg/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-7 h-7 rounded-md bg-surface-2 border border-line flex items-center justify-center text-accent text-sm font-mono font-semibold transition-colors group-hover:border-accent/40">
                  //
                </div>
                <span className="font-semibold text-sm tracking-tight text-text">
                  DSA Tracker
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-muted bg-surface-2 border border-line rounded">
                  v0.1.0
                </span>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${
                        isActive
                          ? 'bg-surface-2 text-text border border-line'
                          : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Right Side Status & User Profile */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {/* User Profile Badge */}
                  <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-surface-2 border border-line text-xs font-medium text-text">
                    <User className="w-3.5 h-3.5 text-accent" />
                    <span>{user.name}</span>
                  </div>

                  {/* Logout Button */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Sign out"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-hover border border-line rounded-md transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign out</span>
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

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-md text-text-secondary hover:text-text hover:bg-surface-hover border border-line focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                aria-label="Toggle Navigation Menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-line bg-surface px-4 pt-2 pb-3 space-y-1">
            {user && (
              <div className="px-3 py-2 text-xs border-b border-line-subtle mb-1 flex items-center justify-between">
                <span className="font-semibold text-text">{user.name}</span>
                <span className="text-[11px] font-mono text-muted truncate max-w-[150px]">
                  {user.email}
                </span>
              </div>
            )}
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 text-xs font-medium rounded-md ${
                    isActive
                      ? 'bg-surface-2 text-text border border-line'
                      : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-line-subtle">
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-danger hover:bg-surface-hover rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-hover rounded-md"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Outlet />
      </main>

      {/* Minimal Developer Footer */}
      <footer className="w-full border-t border-line bg-bg py-4 text-center text-xs text-muted font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DSA / Interview Prep Tracker · Portfolio Project</span>
          <span className="text-[11px] text-text-secondary">
            MERN Stack · Phase 4 Authenticated
          </span>
        </div>
      </footer>
    </div>
  );
}
