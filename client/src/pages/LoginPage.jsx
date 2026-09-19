import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/ui/BrandLogo';
import Rotating3DCube from '../components/auth/Rotating3DCube';
import GoogleButton from '../components/auth/GoogleButton';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setApiError(result.message);
    }
  };

  const handleInstantDemoLogin = async () => {
    setApiError('');
    setIsSubmitting(true);
    const result = await login('demo@dsa-tracker.local', 'DemoPassword123!');
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setApiError(result.message);
    }
  };

  const handleGoogleSuccess = async ({ accessToken }) => {
    setApiError('');
    setIsSubmitting(true);
    const result = await googleAuth(accessToken);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setApiError(result.message);
    }
  };

  const handleGoogleError = (err) => {
    console.error('Google Sign-In failed:', err);
    setApiError('Google sign in was cancelled or failed. Please try again.');
  };

  return (
    <div className="min-h-dvh flex bg-bg relative overflow-hidden">
      {/* ── Left: Interactive 3D Stage Panel ── */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden flex-col justify-between p-8 xl:p-10 bg-surface border-r border-line z-10">
        
        {/* Top Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="lg" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/12 text-accent border border-accent/25 tracking-wide">
              PRO PREP
            </span>
          </div>
        </div>

        {/* Center 3D Stage */}
        <div className="relative z-10 flex items-center justify-center my-auto py-4 w-full">
          <Rotating3DCube />
        </div>

        {/* Bottom Platform Ribbon */}
        <div className="relative z-10 pt-4 border-t border-line flex items-center justify-between text-xs text-text-secondary">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {['LeetCode', 'GeeksforGeeks', 'Codeforces', 'HackerRank', 'CodeChef', 'InterviewBit'].map((brand) => (
              <span
                key={brand}
                className="px-2.5 py-1 rounded-full bg-surface-2 border border-line text-text-secondary transition-colors cursor-default whitespace-nowrap text-xs"
              >
                {brand}
              </span>
            ))}
          </div>
          <span className="hidden xl:inline text-muted text-xs">© 2026 DSA Tracker</span>
        </div>
      </div>

      {/* ── Right: Auth Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative z-10 bg-bg">
        <div className="w-full max-w-[408px] relative animate-fade-up">

          {/* Mobile brand (hidden on lg) */}
          <div className="lg:hidden flex items-center justify-center mb-6">
            <BrandLogo size="lg" />
          </div>

          {/* Flat Auth Card */}
          <div className="relative p-7 sm:p-8 rounded-xl bg-surface border border-line shadow-modal overflow-hidden">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-text tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                Sign in to your account to continue your preparation
              </p>
            </div>

            {apiError && (
              <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-danger/10 border border-danger/25">
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1 shrink-0" />
                <p className="text-xs text-danger leading-tight">{apiError}</p>
              </div>
            )}

            {/* Google Sign In Button */}
            <GoogleButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="Continue with Google"
              disabled={isSubmitting}
            />

            {/* Hairline Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line" />
              </div>
              <span className="relative px-3 text-xs uppercase tracking-wider text-text-secondary bg-surface">
                or continue with email
              </span>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-text-secondary mb-1.5">
                  Email address
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-accent transition-colors" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    disabled={isSubmitting}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`input-base pl-10 ${
                      errors.email ? 'border-danger/60 focus:border-danger' : ''
                    }`}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-danger">{errors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-xs font-medium text-text-secondary">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-accent hover:text-accent-hover transition-colors font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-accent transition-colors" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    disabled={isSubmitting}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`input-base pl-10 pr-11 ${
                      errors.password ? 'border-danger/60 focus:border-danger' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors p-1 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-danger">{errors.password}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full h-10 text-xs font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Instant 1-Click Demo Guest Access Card */}
            <div className="mt-5 p-4 rounded-xl bg-surface-2 border border-line">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-surface border border-line flex items-center justify-center text-accent shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-text">Demo Guest Access</span>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/12 text-accent border border-accent/25 tracking-wide shrink-0">
                  1-CLICK
                </span>
              </div>
              
              <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                Explore full dashboard with 35 preloaded DSA problems & streaks without signing up.
              </p>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleInstantDemoLogin}
                className="btn-secondary w-full h-9 text-xs font-medium"
              >
                <span>Launch Instant Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom Sign-Up Link */}
            <p className="mt-5 text-center text-xs text-text-secondary">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-accent hover:text-accent-hover transition-colors">
                Create an account
              </Link>
            </p>
          </div>

          {/* Session Security Micro-badge */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-text-secondary">
            <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
            <span>256-bit encrypted authentication</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialEmail={email}
      />
    </div>
  );
};

export default LoginPage;
