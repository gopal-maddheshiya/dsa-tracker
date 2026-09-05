import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsSubmitting(true);
    const result = await login(email.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setApiError(result.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-[#0d121f] border border-slate-800/80 rounded-lg p-6 sm:p-8 shadow-sm">
        <div className="border-b border-slate-800/80 pb-4 mb-5">
          <h1 className="text-lg font-semibold tracking-tight text-white font-mono">Sign in to DSA Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">Enter your credentials to access your preparation repository.</p>
        </div>

        {apiError && (
          <div className="mb-4 p-3 rounded bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 font-mono">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-[11px] font-mono text-slate-300 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              placeholder="demo@dsa-tracker.local"
              className={`w-full px-3 py-2 bg-slate-950 border rounded text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 transition-colors ${
                errors.email
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-800/80 focus:border-slate-600 focus:ring-slate-600'
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-rose-400 font-mono">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-[11px] font-mono text-slate-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              placeholder="••••••••"
              className={`w-full px-3 py-2 bg-slate-950 border rounded text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 transition-colors ${
                errors.password
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-800/80 focus:border-slate-600 focus:ring-slate-600'
              }`}
            />
            {errors.password && <p className="mt-1 text-xs text-rose-400 font-mono">{errors.password}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold text-xs rounded transition-colors shadow-sm inline-flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </div>
        </form>

        {/* Demo Credentials Helper */}
        <div className="mt-4 p-2.5 rounded bg-slate-950/70 border border-slate-800/60 text-[11px] font-mono text-slate-400">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium">Demo Account:</span>
            <button
              type="button"
              onClick={() => {
                setEmail('demo@dsa-tracker.local');
                setPassword('DemoPassword123!');
              }}
              className="text-emerald-400 hover:underline text-[10px]"
            >
              Fill Demo Login
            </button>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 truncate">demo@dsa-tracker.local</div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800/60 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
