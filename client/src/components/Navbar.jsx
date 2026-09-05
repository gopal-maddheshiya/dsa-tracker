import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const navLinkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-slate-800 text-emerald-400 border border-slate-700'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-8">
            <NavLink to="/dashboard" className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span className="font-semibold tracking-tight text-white text-base">
                DSA <span className="text-slate-400 font-normal">Tracker</span>
              </span>
            </NavLink>

            <nav className="hidden md:flex space-x-2">
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/problems" className={navLinkClass}>
                Problems
              </NavLink>
              <NavLink to="/revision" className={navLinkClass}>
                Revision Queue
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <NavLink
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800/60 transition-colors"
            >
              Log in
            </NavLink>
            <NavLink
              to="/signup"
              className="text-sm font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-3 py-1.5 rounded-md transition-colors font-semibold"
            >
              Sign up
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
