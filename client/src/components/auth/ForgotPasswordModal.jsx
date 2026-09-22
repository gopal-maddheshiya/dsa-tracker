import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, KeyRound, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { forgotPassword, resetPassword } from '../../api/auth';
import { useToast } from '../../context/ToastContext';
import { useDialog } from '../../hooks/useDialog';

const ForgotPasswordModal = ({ isOpen, onClose, initialEmail = '' }) => {
  const toast = useToast();
  const dialogRef = useRef(null);
  const [step, setStep] = useState(1); // 1 = request code, 2 = enter code & reset
  const [email, setEmail] = useState(initialEmail);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeNotice, setCodeNotice] = useState('');

  const handleClose = () => {
    setStep(1);
    setError('');
    setCodeNotice('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  useDialog({
    isOpen,
    onClose: handleClose,
    dialogRef,
    closeOnEscape: !isLoading,
  });

  if (!isOpen) return null;

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const res = await forgotPassword(email.trim());
      if (res.resetCode) {
        setResetCode(res.resetCode);
        setCodeNotice(`Verification code: ${res.resetCode}`);
      }
      setStep(2);
      toast.success(res.resetCode ? 'Verification code generated!' : 'Verification code sent to your email!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetCode || resetCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({
        email: email.trim(),
        resetCode: resetCode.trim(),
        newPassword,
      });
      toast.success('Password reset successfully! You can now log in.');
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please check your code.');
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/70 animate-fade-in"
      onMouseDown={(e) => {
        if (!isLoading && e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-password-title"
        aria-describedby="forgot-password-desc"
        tabIndex={-1}
        data-lenis-prevent
        className="relative w-full max-w-md bg-surface border border-line rounded-xl p-4 sm:p-6 shadow-modal overflow-hidden my-auto max-h-[90dvh] overflow-y-auto outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-surface-2 border border-line flex items-center justify-center text-accent shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 id="forgot-password-title" className="text-base font-semibold text-text tracking-tight">
              {step === 1 ? 'Reset Password' : 'Set New Password'}
            </h2>
            <p id="forgot-password-desc" className="text-xs text-text-secondary">
              {step === 1
                ? 'Enter your account email to receive a verification code'
                : `Enter the code sent for ${email}`}
            </p>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/25 flex items-start gap-2.5 text-xs text-danger">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Request code */}
        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-xs font-medium text-text-secondary mb-1.5">
                Account Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-base"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary text-xs px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary text-xs flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Generating Code…</span>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Enter code & set password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {codeNotice && (
              <div className="p-3 rounded-lg bg-medium/12 border border-medium/25 flex items-center justify-between text-xs text-medium">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-medium" />
                  <span>{codeNotice}</span>
                </span>
                <span className="text-xs uppercase tracking-wider text-medium">
                  Auto-detected
                </span>
              </div>
            )}

            <div>
              <label htmlFor="reset-code" className="block text-xs font-medium text-text-secondary mb-1.5">
                6-Digit Verification Code
              </label>
              <input
                id="reset-code"
                type="text"
                required
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full h-10 px-3.5 rounded-lg bg-surface-2 border border-line text-center font-mono text-base tracking-[0.25em] text-accent placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="new-password" className="text-xs font-medium text-text-secondary">
                  New Password
                </label>
                <span className="text-xs text-muted">Min. 6 characters</span>
              </div>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-xs font-medium text-text-secondary mb-1.5">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-text-secondary hover:text-text transition-colors cursor-pointer"
              >
                ← Change email
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary text-xs px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary text-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <span>Updating…</span> : <span>Update Password</span>}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

export default ForgotPasswordModal;
