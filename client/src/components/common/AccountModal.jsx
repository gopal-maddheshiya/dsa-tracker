import React, { useEffect } from 'react';
import { X, Mail, Calendar, ShieldCheck, LogOut } from 'lucide-react';

/**
 * Format account creation date into clean readable string (e.g. "October 2026")
 */
function formatMemberDate(dateStr) {
  if (!dateStr) return 'Active Member';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Active Member';
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return 'Active Member';
  }
}

/**
 * AccountModal: Dedicated profile & account details dialog.
 * Replaces redundant navigation menus with true account identity, metadata, and sign out.
 * Adapts as a bottom sheet on mobile screens and a centered modal on desktop.
 */
export default function AccountModal({ isOpen, onClose, user, onLogout }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
    >
      <div className="w-full sm:max-w-md bg-surface border-t sm:border border-line rounded-t-2xl sm:rounded-xl shadow-elevated overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-surface shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <h2 id="account-modal-title" className="text-sm font-semibold text-text tracking-tight">
              Account Details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted hover:text-text rounded-md hover:bg-surface-hover transition-all duration-150 active:scale-95 focus-visible:ring-1 focus-visible:ring-accent"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Identity Card */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-lg bg-surface-2/70 border border-line">
            <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/35 text-accent font-semibold flex items-center justify-center text-base font-mono shrink-0 shadow-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-text truncate">
                  {user.name}
                </h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-xs font-mono text-muted truncate mt-0.5">
                {user.email}
              </p>
            </div>
          </div>

          {/* Account Metadata List */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider block px-1">
              Workspace Information
            </span>

            <div className="divide-y divide-line/60 rounded-lg bg-surface-2/40 border border-line overflow-hidden text-xs">
              {/* Email Row */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Mail className="w-3.5 h-3.5 text-muted shrink-0" />
                  <span>Email address</span>
                </div>
                <span className="font-mono text-text font-medium truncate max-w-[190px]">
                  {user.email}
                </span>
              </div>

              {/* Member Since Row */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Calendar className="w-3.5 h-3.5 text-muted shrink-0" />
                  <span>Member since</span>
                </div>
                <span className="font-mono text-text font-medium">
                  {formatMemberDate(user.createdAt)}
                </span>
              </div>

              {/* Session Security Row */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2 text-text-secondary">
                  <ShieldCheck className="w-3.5 h-3.5 text-muted shrink-0" />
                  <span>Session type</span>
                </div>
                <span className="font-mono text-text-secondary text-[11px]">
                  JWT · Local Storage
                </span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 border-t border-line">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full h-10 inline-flex items-center justify-center gap-2 text-xs font-medium text-danger bg-danger/10 hover:bg-danger/20 border border-danger/25 rounded-md transition-all duration-150 active:scale-95 shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
