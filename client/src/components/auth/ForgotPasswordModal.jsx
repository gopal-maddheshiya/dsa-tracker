import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import FormAlert from '../common/FormAlert';
import { KeyRound, Mail, ArrowRight, CheckCircle2, Loader2, X } from 'lucide-react';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [recoveryData, setRecoveryData] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!email.trim()) {
      setFieldError('Please enter your email address.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setFieldError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    setServerError('');
    setFieldError('');

    try {
      const res = await authApi.forgotPassword({ email: email.trim() });
      setRecoveryData(res?.data || {});
    } catch (err) {
      console.error('Forgot password error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to process password reset request.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetDirect = (token) => {
    onClose();
    navigate(`/reset-password?token=${token}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-surface border border-line rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden text-text">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-muted hover:text-text rounded-lg hover:bg-surface-2 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text tracking-tight">
              Reset your password
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Recover access to your DSA Tracker workspace
            </p>
          </div>
        </div>

        {serverError && (
          <div className="mb-4">
            <FormAlert message={serverError} />
          </div>
        )}

        {recoveryData ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-text">
                  Reset link generated successfully
                </p>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  A secure recovery token has been initialized for{' '}
                  <span className="font-mono text-text">{email}</span>.
                </p>
              </div>
            </div>

            {recoveryData.resetToken ? (
              <div className="p-3.5 rounded-xl bg-surface-2 border border-line space-y-2.5">
                <p className="text-[11px] text-muted font-mono uppercase tracking-wider">
                  Instant Password Reset
                </p>
                <p className="text-xs text-text-secondary">
                  Click below to immediately set your new password.
                </p>
                <button
                  type="button"
                  onClick={() => handleResetDirect(recoveryData.resetToken)}
                  className="w-full h-9 px-4 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs group"
                >
                  <span>Set New Password Now</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-text-secondary">
                Please check your inbox for instructions to reset your password.
              </p>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full h-8 text-xs font-medium text-text-secondary hover:text-text rounded-lg border border-line hover:bg-surface-2 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-xs font-medium text-text-secondary mb-1.5"
              >
                Registered email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  id="forgot-email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldError) setFieldError('');
                    if (serverError) setServerError('');
                  }}
                  placeholder="developer@example.com"
                  disabled={submitting}
                  autoComplete="email"
                  autoFocus
                  className={`w-full h-9 pl-9 pr-3 text-xs bg-bg border rounded-lg text-text placeholder:text-muted focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 ${
                    fieldError
                      ? 'border-danger focus:border-danger focus:ring-danger'
                      : 'border-line focus:border-accent focus:ring-accent'
                  }`}
                />
              </div>
              {fieldError && (
                <p className="mt-1 text-[11px] text-danger font-medium">
                  {fieldError}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 h-9 px-3 text-xs font-medium text-text-secondary hover:text-text rounded-lg border border-line hover:bg-surface-2 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-9 px-4 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
