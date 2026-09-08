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
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Min. 6 characters';
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
    if (result.success) navigate('/dashboard', { replace: true });
    else setApiError(result.message);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 animate-fade-up">
      <div className="w-full max-w-[440px]">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20">
            <span className="w-3 h-3 rounded-full bg-[#F97316] dot-pulse" />
          </div>
          <div>
            <div className="font-bold text-[#F5F5F4] text-lg tracking-tight leading-none">
              DSA<span className="text-[#F97316]">Tracker</span>
            </div>
            <div className="text-xs text-[#78716C] mt-0.5">Spaced repetition for engineers</div>
          </div>
        </div>

        <div className="panel p-7">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#F5F5F4] tracking-tight">Create your account</h1>
            <p className="text-sm text-[#A8A29E] mt-1">
              Start cataloging problems and tracking your retention.
            </p>
          </div>

          {apiError && (
            <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
              <p className="text-xs text-rose-300">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="block section-label mb-1.5">Full name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting} placeholder="Your name"
                className={`input-base ${errors.name ? 'input-error' : ''}`} />
              {errors.name && <p className="mt-1.5 text-xs text-rose-400">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block section-label mb-1.5">Email address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting} placeholder="you@example.com"
                className={`input-base ${errors.email ? 'input-error' : ''}`} />
              {errors.email && <p className="mt-1.5 text-xs text-rose-400">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block section-label mb-1.5">
                Password <span className="text-[#78716C] font-normal normal-case tracking-normal">(min. 6 chars)</span>
              </label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting} placeholder="••••••••"
                className={`input-base ${errors.password ? 'input-error' : ''}`} />
              {errors.password && <p className="mt-1.5 text-xs text-rose-400">{errors.password}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : 'Create account'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#2E2A27] text-center text-xs text-[#78716C]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#F97316] hover:text-[#FB923C] font-semibold transition-colors">
              Sign in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
