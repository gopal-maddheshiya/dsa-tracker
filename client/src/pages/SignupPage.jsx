import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/ui/BrandLogo';
import {
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  User,
  Mail,
  Lock,
  Zap,
  Repeat,
  BarChart3,
  BrainCircuit,
} from 'lucide-react';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Create Account · DSA Tracker';
  }, []);

  const from = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : (typeof location.state?.from === 'string' ? location.state.from : '/dashboard');

  // Real-time password strength evaluation
  const passwordEvaluation = useMemo(() => {
    if (!password) {
      return {
        score: 0,
        label: '',
        color: 'bg-surface-2',
        textColor: 'text-muted',
        checks: { length: false, number: false, special: false },
      };
    }
    const hasLength = password.length >= 6;
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasUpper = /[A-Z]/.test(password);

    let score = 0;
    if (hasLength) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;
    if (hasUpper && password.length >= 8) score += 1;

    let label = 'Weak';
    let color = 'bg-danger';
    let textColor = 'text-danger';

    if (score === 2) {
      label = 'Fair';
      color = 'bg-medium';
      textColor = 'text-medium';
    } else if (score === 3) {
      label = 'Good';
      color = 'bg-accent';
      textColor = 'text-accent';
    } else if (score >= 4) {
      label = 'Strong';
      color = 'bg-success';
      textColor = 'text-success';
    }

    return {
      score,
      label,
      color,
      textColor,
      checks: {
        length: hasLength,
        number: hasNumber,
        special: hasSpecial,
      },
    };
  }, [password]);

  const validate = () => {
    const newErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      newErrors.name = 'Full name is required';
    }

    if (!trimmedEmail) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Min. 6 characters required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await signup(name.trim(), email.trim().toLowerCase(), password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setApiError(result.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantDemo = async () => {
    setApiError('');
    setIsSubmitting(true);
    try {
      const result = await login('demo@dsa-tracker.local', 'DemoPassword123!');
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setApiError(result.message || 'Demo login failed.');
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

        {/* Center Content: Product Benefits */}
        <div className="relative z-10 my-auto py-8 max-w-xl space-y-8">
          <div>
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-text leading-tight">
              Build Permanent Problem-Solving{' '}
              <span className="text-accent underline decoration-accent/40 decoration-2 underline-offset-4">
                Muscle Memory
              </span>
            </h2>
            <p className="text-sm xl:text-base text-text-secondary mt-3 leading-relaxed">
              Create your account to start tracking attempts, automating spaced repetition review intervals, and reviewing tailored AI takeaways.
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
                  Spaced Repetition Priority Queue
                </h3>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                  Never forget a tricky trick. Struggled problems surface after 2 days; solved ones after 14 days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface-2/70 border border-line transition-colors hover:border-line-hover">
              <div className="w-9 h-9 rounded-lg bg-easy/15 border border-easy/25 flex items-center justify-center text-easy shrink-0 mt-0.5">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-text uppercase tracking-wide">
                  Pattern Gap Analysis
                </h3>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                  Clear visual telemetry pinpoints which patterns (Sliding Window, Monotonic Stack, DP) need more focus.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface-2/70 border border-line transition-colors hover:border-line-hover">
              <div className="w-9 h-9 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-text uppercase tracking-wide">
                  Grounded AI Intelligence
                </h3>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                  Ask for progressive hints or get instant post-attempt takeaways based purely on your actual solution notes.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Credibility Bar */}
          <div className="flex items-center gap-6 pt-2 text-xs text-text-secondary border-t border-line/60">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Takes under 30 seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Instant dashboard access</span>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
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

      {/* ── Right: Direct, Focused Signup Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10 bg-bg">
        <div className="w-full max-w-[420px] relative animate-fade-up">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center justify-center mb-6">
            <BrandLogo size="lg" />
          </div>

          {/* Clean Auth Card */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-surface border border-line shadow-modal">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text tracking-tight">
                Create account
              </h1>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                Join to track problems, master patterns, and ace tech interviews.
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

            {/* Direct Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-text-secondary mb-1.5">
                  Full name
                </label>
                <div className="relative group">
                  <User className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-accent transition-colors" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    disabled={isSubmitting}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                    }}
                    placeholder="Alex Rivera"
                    className={`input-base pl-10 h-10 text-xs ${
                      errors.name ? 'border-danger/60 focus:border-danger' : ''
                    }`}
                  />
                </div>
                {errors.name && <p className="mt-1.5 text-xs text-danger">{errors.name}</p>}
              </div>

              {/* Email Address */}
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

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-text-secondary mb-1.5">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-accent transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    disabled={isSubmitting}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                    }}
                    placeholder="Min. 6 characters"
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

                {/* Password strength indicators */}
                {password && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted">Strength:</span>
                      <span className={`font-semibold ${passwordEvaluation.textColor}`}>
                        {passwordEvaluation.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            step <= passwordEvaluation.score ? passwordEvaluation.color : 'bg-surface-2'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
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
                    <span>Creating account…</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Start Prepping</span>
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
                or try immediately
              </span>
            </div>

            {/* 1-Click Demo Guest Option */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleInstantDemo}
              className="btn-secondary w-full h-9 text-xs font-medium inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span>Launch Instant Demo Without Signing Up</span>
            </button>

            {/* Bottom Login Link */}
            <p className="mt-5 text-center text-xs text-text-secondary">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-accent hover:text-accent-hover transition-colors underline-offset-2 hover:underline"
              >
                Sign in
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
    </div>
  );
};

export default SignupPage;
