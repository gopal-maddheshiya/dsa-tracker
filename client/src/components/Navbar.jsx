import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './ui/BrandLogo';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#262320] bg-[#121110]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <NavLink to="/dashboard" className="flex items-center">
              <BrandLogo size="md" />
            </NavLink>


            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1">
                {[
                  { to: '/dashboard', label: 'Dashboard' },
                  { to: '/problems', label: 'Problems' },
                  { to: '/revision', label: 'Revision Queue' },
                  { to: '/profile', label: 'Profile' },
                ].map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? 'nav-active' : ''}`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* User Status Badge (Online - #22C55E) */}
                <NavLink to="/profile" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1C1A18] border border-[#262320] hover:border-[#3E3834] transition-colors">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
                  </span>
                  <span className="text-xs text-[#A8A29E] max-w-[140px] truncate">
                    {user?.name || user?.email}
                  </span>
                </NavLink>
                <button type="button" onClick={handleLogout} className="btn-ghost">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn-ghost">Log in</NavLink>
                <NavLink
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F97316] hover:bg-[#FB923C] text-white transition-all duration-150"
                >
                  Get started
                </NavLink>
              </>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        {isAuthenticated && (
          <nav className="flex md:hidden border-t border-white/[0.08] py-1.5 gap-1 overflow-x-auto">
            {[
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/problems', label: 'Problems' },
              { to: '/revision', label: 'Revision' },
              { to: '/profile', label: 'Profile' },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex-shrink-0 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    isActive ? 'text-[#F97316] bg-[#F97316]/10' : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;