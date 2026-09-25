import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Sparkles, CheckCircle2, ShieldCheck, Flame, ArrowRight, Brain } from 'lucide-react';
import BrandLogo from '../ui/BrandLogo';

/**
 * AuthGateModal: Contextual Authentication Gate for Guest Users.
 *
 * Appears when a guest user attempts a protected/mutating action
 * (e.g. Log Attempt, Add Problem, Spaced Repetition, Personal Profile).
 * Communicates product value and routes to Signup/Login preserving context.
 */
const AuthGateModal = ({
  isOpen = false,
  open,
  onClose,
  title = 'Save your progress',
  description = 'Create a free account to track your deliberate practice and unlock cognitive spaced repetition.',
  contextAction = null,
  targetUrl = null,
}) => {
  const visible = open !== undefined ? open : isOpen;
  const navigate = useNavigate();
  const location = useLocation();
  const modalRef = useRef(null);

  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onClose]);

  if (!visible) return null;

  const returnTarget = targetUrl || location;

  const handleCreateAccount = () => {
    onClose?.();
    navigate('/signup', {
      state: {
        from: returnTarget,
        contextAction: contextAction || title,
      },
    });
  };

  const handleLogIn = () => {
    onClose?.();
    navigate('/login', {
      state: {
        from: returnTarget,
        contextAction: contextAction || title,
      },
    });
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-gate-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-fade-in cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-md rounded-2xl bg-surface border border-line card-classy p-6 sm:p-7 shadow-2xl animate-scale-in select-none text-text space-y-5"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header & Context Tag */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" showText={false} />
            <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold px-2 py-0.5 rounded-full bg-accent/12 border border-accent/25">
              {contextAction ? `Action: ${contextAction}` : 'Deliberate Practice'}
            </span>
          </div>

          <h2 id="auth-gate-title" className="text-xl font-bold tracking-tight text-text">
            {title}
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>

        {/* Value Proposition Feature Bullets */}
        <div className="p-3.5 rounded-xl bg-surface-2/60 border border-line-subtle space-y-2 text-xs">
          <div className="flex items-center gap-2.5 text-text-secondary">
            <CheckCircle2 className="w-3.5 h-3.5 text-easy shrink-0" />
            <span>Catalog custom problems & track solution code</span>
          </div>
          <div className="flex items-center gap-2.5 text-text-secondary">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>Automated forgetting-curve spaced repetition schedule</span>
          </div>
          <div className="flex items-center gap-2.5 text-text-secondary">
            <CheckCircle2 className="w-3.5 h-3.5 text-medium shrink-0" />
            <span>Consistency streak & 52-week activity heatmap</span>
          </div>
          <div className="flex items-center gap-2.5 text-text-secondary">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Personalized AI cognitive takeaways & hint coaching</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={handleCreateAccount}
            className="w-full btn-primary py-2.5 px-4 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="text-center pt-1">
            <span className="text-xs text-muted">Already have an account? </span>
            <button
              type="button"
              onClick={handleLogIn}
              className="text-xs text-accent hover:text-accent-hover font-semibold transition-colors cursor-pointer underline-offset-2 hover:underline"
            >
              Log in
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <p className="text-[10px] font-mono text-center text-muted/60">
          Takes under 30 seconds · No credit card required
        </p>
      </div>
    </div>,
    document.body
  );
};

export default AuthGateModal;
