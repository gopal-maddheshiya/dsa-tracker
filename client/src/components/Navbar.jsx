import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `relative px-3 py-1.5 text-xs font-medium tracking-wide transition-all ${
      isActive
        ? 'text-white font-semibold'
        : 'text-slate-400 hover:text-slate-200'
    }`;

  return (
    <header className="border-b border-slate-800/80 bg-[#0d121f]/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13">
          {/* Brand + Primary Links */}
          <div className="flex items-center space-x-8">
            <NavLink to="/dashboard" className="flex items-center space-x-2.5 group">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 group-hover:scale-110 transition-transform"></span>
              <span className="font-semibold tracking-tight text-white text-sm">
                DSA <span className="text-slate-400 font-normal text-xs">/ Tracker</span>
              </span>
            </NavLink>

            {isAuthenticated && (
              <nav className="hidden md:flex items-center space-x-1 border-l border-slate-800/80 pl-6">
                <NavLink to="/dashboard" className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      <span>Dashboard</span>
                      {isActive && (
                        <span className="absolute bottom-[-13px] left-3 right-3 h-[2px] bg-emerald-500 rounded-full"></span>
                      )}
                    </>
                  )}
                </NavLink>
                <NavLink to="/problems" className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      <span>Problems</span>
                      {isActive && (
                        <span className="absolute bottom-[-13px] left-3 right-3 h-[2px] bg-emerald-500 rounded-full"></span>
                      )}
                    </>
                  )}
                </NavLink>
                <NavLink to="/revision" className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      <span>Revision Queue</span>
                      {isActive && (
                        <span className="absolute bottom-[-13px] left-3 right-3 h-[2px] bg-emerald-500 rounded-full"></span>
                      )}
                    </>
                  )}
                </NavLink>
              </nav>
            )}
          </div>

          {/* User Session / Auth CTA */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80"></span>
                  <span className="text-slate-300 font-mono max-w-[140px] truncate">{user?.name || user?.email}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded hover:bg-slate-900/80 transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <NavLink
                  to="/login"
                  className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded hover:bg-slate-900/80 transition-colors"
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/signup"
                  className="text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-3 py-1.5 rounded transition-colors"
                >
                  Sign up
                </NavLink>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        {isAuthenticated && (
          <nav className="flex md:hidden border-t border-slate-800/80 py-2 space-x-3 text-xs overflow-x-auto" aria-label="Mobile Navigation">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-2.5 py-1 rounded ${isActive ? 'text-emerald-400 font-semibold bg-slate-900' : 'text-slate-400'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/problems"
              className={({ isActive }) =>
                `px-2.5 py-1 rounded ${isActive ? 'text-emerald-400 font-semibold bg-slate-900' : 'text-slate-400'}`
              }
            >
              Problems
            </NavLink>
            <NavLink
              to="/revision"
              className={({ isActive }) =>
                `px-2.5 py-1 rounded ${isActive ? 'text-emerald-400 font-semibold bg-slate-900' : 'text-slate-400'}`
              }
            >
              Revision Queue
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;

