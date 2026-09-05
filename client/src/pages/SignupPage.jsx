import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsSubmitting(true);
    const result = await signup(name.trim(), email.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setApiError(result.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-[#0d121f] border border-slate-800/80 rounded-lg p-6 sm:p-8 shadow-sm">
        <div className="border-b border-slate-800/80 pb-4 mb-5">
          <h1 className="text-lg font-semibold tracking-tight text-white font-mono">Create Developer Account</h1>
          <p className="text-xs text-slate-400 mt-1">Initialize your tracking workspace and revision telemetry.</p>
        </div>

        {apiError && (
          <div className="mb-4 p-3 rounded bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 font-mono">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="block text-[11px] font-mono text-slate-300 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              placeholder="Ada Lovelace"
              className={`w-full px-3 py-2 bg-slate-950 border rounded text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 transition-colors ${
                errors.name
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-800/80 focus:border-slate-600 focus:ring-slate-600'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-400 font-mono">{errors.name}</p>}
          </div>

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
              placeholder="ada@example.com"
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
              placeholder="Minimum 6 characters"
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
                  <span>Registering...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-5 pt-3 border-t border-slate-800/60 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
