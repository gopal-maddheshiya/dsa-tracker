import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/ui/BrandLogo';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  Repeat,
  BrainCircuit,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    document.title = 'Sign In · DSA Tracker';
  }, []);

  const from = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : (typeof location.state?.from === 'string' ? location.state.from : '/dashboard');

  const validate = () => {
    const errs = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address';
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
    try {
      const result = await login(email.trim().toLowerCase(), password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setApiError(result.message || 'Login failed. Please verify your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantDemoLogin = async () => {
    setApiError('');
    setIsSubmitting(true);
    try {
      const result = await login('demo@dsa-tracker.local', 'DemoPassword123!');
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setApiError(result.message || 'Demo login failed. Please ensure demo user is seeded.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh flex bg-bg relative overflow-hidden text-text">
      {/* ── Left: High-Performance Product Value Showcase (Zero CPU overhead) ── */}
      <div className="hidden lg:flex lg:w-[54%] xl:w-[56%] relative overflow-hidden flex-col justify-between p-8 xl:p-12 bg-surface/50 border-r border-line z-10 backdrop-blur-sm">
        {/* Subtle decorative glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-easy/10 blur-3xl pointer-events-none" />

        {/* Top Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="lg" />
            <span className="text-[11px] font-mono uppercase font-semibold px-2.5 py-1 rounded-full bg-accent/15 text-accent border border-accent/30 tracking-wider">
              DELIBERATE PRACTICE
            </span>
          </div>
        </div>

        {/* Center Content: Product Benefits & Live Telemetry Preview */}
        <div className="relative z-10 my-auto py-8 max-w-xl space-y-8">
          <div>
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-text leading-tight">
              Master Data Structures & Algorithms{' '}
              <span className="text-accent underline decoration-accent/40 decoration-2 underline-offset-4">
                Without Guesswork
              </span>
            </h2>
            <p className="text-sm xl:text-base text-text-secondary mt-3 leading-relaxed">
              Replace disorganized spreadsheets with a systematic preparation system that schedules cognitive spaced repetition and measures real problem-solving telemetry.
            </p>
          </div>

          {/* 3 Value Proposition Features */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface-2/70 border border-line transition-colors hover:border-line-hover">
              <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center text-accent shrink-0 mt-0.5">
                <Repeat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-text uppercase tracking-wide">
                  Cognitive Spaced Repetition (14d / 5d / 2d)
                </h3>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                  Automatic revision curves based on the Ebbinghaus forgetting model prioritize problems you struggled with right before they fade from memory.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface-2/70 border border-line transition-colors hover:border-line-hover">
              <div className="w-9 h-9 rounded-lg bg-easy/15 border border-easy/25 flex items-center justify-center text-easy shrink-0 mt-0.5">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-text uppercase tracking-wide">
                  Topic Gap Telemetry & Heatmap
                </h3>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                  52-week consistency tracking, solve-time metrics, and instant identification of weak areas across DP, Graphs, Trees, and Sliding Window.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface-2/70 border border-line transition-colors hover:border-line-hover">
              <div className="w-9 h-9 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-text uppercase tracking-wide">
                  AI Cognitive Coach & Retrospective
                </h3>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                  Grounding hints and post-attempt synthesis highlight algorithmic invariants without spoiling complete solutions.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-6 pt-2 text-xs text-text-secondary border-t border-line/60">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Zero third-party cookies</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Fast JWT Bearer auth</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Instant guest sandbox</span>
            </div>
          </div>
        </div>

        {/* Bottom Companies Banner */}
        <div className="relative z-10 pt-4 border-t border-line flex items-center justify-between text-xs text-text-secondary">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-muted text-[11px] font-mono mr-1">TARGETS:</span>
            {['Google', 'Meta', 'Amazon', 'Microsoft', 'Uber', 'Apple', 'Netflix'].map((company) => (
              <span
                key={company}
                className="px-2.5 py-0.5 rounded-full bg-surface-2 border border-line text-text-secondary text-[11px] font-mono whitespace-nowrap"
              >
                {company}
              </span>
            ))}
          </div>
          <span className="hidden xl:inline text-muted text-xs">DSA Tracker Engine</span>
        </div>
      </div>

      {/* ── Right: Direct, Focused Auth Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10 bg-bg">
        <div className="w-full max-w-[420px] relative animate-fade-up">
          {/* Mobile brand header (visible only on mobile/tablet) */}
          <div className="lg:hidden flex items-center justify-center mb-6">
            <BrandLogo size="lg" />
          </div>

          {/* Clean Auth Card */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-surface border border-line shadow-modal">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                Sign in to your account to resume deliberate interview practice.
              </p>
            </div>

            {/* API Error Notification */}
            {apiError && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-danger/10 border border-danger/25 text-danger text-xs leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Direct Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-text-secondary mb-1.5">
                  Email address
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-accent transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    disabled={isSubmitting}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                    }}
                    placeholder="engineer@example.com"
                    className={`input-base pl-10 h-10 text-xs ${
                      errors.email ? 'border-danger/60 focus:border-danger' : ''
                    }`}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-danger">{errors.email}</p>}
              </div>

              {/* Password Field */}
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
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    disabled={isSubmitting}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                    }}
                    placeholder="••••••••"
                    className={`input-base pl-10 pr-11 h-10 text-xs ${
                      errors.password ? 'border-danger/60 focus:border-danger' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                className="btn-primary w-full h-10 text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
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

            {/* Hairline Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line" />
              </div>
              <span className="relative px-3 text-[11px] uppercase tracking-wider text-muted bg-surface font-mono">
                or instant evaluation
              </span>
            </div>

            {/* Instant 1-Click Demo Guest Access Box */}
            <div className="p-4 rounded-xl bg-surface-2 border border-line hover:border-line-hover transition-colors">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center text-accent shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-text">1-Click Recruiter / Guest Demo</span>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25 tracking-wide shrink-0">
                  INSTANT
                </span>
              </div>

              <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                Explore the dashboard pre-loaded with benchmark DSA problems, revision queues, and heatmaps without registering.
              </p>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleInstantDemoLogin}
                className="btn-secondary w-full h-9 text-xs font-medium inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Instant Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom Sign-Up Link */}
            <p className="mt-5 text-center text-xs text-text-secondary">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-accent hover:text-accent-hover transition-colors underline-offset-2 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>

          {/* Session Security Micro-badge */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
            <span>256-bit encrypted authentication · JWT Session</span>
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
