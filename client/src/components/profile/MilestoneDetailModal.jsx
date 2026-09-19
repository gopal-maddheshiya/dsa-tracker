import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';
import {
  X,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  ChevronRight,
  Target,
  ArrowRight
} from 'lucide-react';

const MilestoneDetailModal = ({ milestone, profile, isOpen, onClose }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !milestone) return null;

  const isUnlocked = milestone.check ? milestone.check(profile || {}) : false;
  const currentMetric = milestone.metric ? milestone.metric(profile || {}) : 0;
  const targetMetric = milestone.target || 1;
  const pct = Math.min(100, Math.round((currentMetric / targetMetric) * 100));

  const Icon = milestone.iconComponent;
  const badgeColor = milestone.color || colors.accent;
  const badgeBg = milestone.bg || `${colors.accent}1f`;
  const badgeBorder = milestone.border || `${colors.accent}40`;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fadeIn"
      onClick={onClose}
    >
      <div
        data-lenis-prevent
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-surface border border-line shadow-modal transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-surface-2/60 hover:bg-surface-2 text-muted hover:text-text transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7 flex flex-col items-center text-center relative z-0">
          {/* Badge Icon */}
          <div className="relative mb-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center border transition-transform duration-300"
              style={{
                backgroundColor: badgeBg,
                borderColor: badgeBorder,
                color: badgeColor,
              }}
            >
              {Icon && <Icon className="w-10 h-10" />}
            </div>

            {/* Unlocked / Locked Mini Status Pill */}
            <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 border ${
              isUnlocked
                ? 'bg-success/15 border-success/30 text-success'
                : 'bg-surface-2 border-line text-muted'
            }`}>
              {isUnlocked ? (
                <>
                  <Sparkles className="w-3 h-3 text-success" />
                  <span>UNLOCKED</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-muted" />
                  <span>LOCKED</span>
                </>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="text-lg font-semibold text-text tracking-tight mb-1">
            {milestone.label}
          </h3>
          <p className="text-xs text-text-secondary max-w-xs mb-5">
            {milestone.desc}
          </p>

          {/* Progress Card */}
          <div className="w-full p-4 rounded-lg bg-surface-2/50 border border-line mb-5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted">Progress toward unlock:</span>
              <span className="font-semibold text-text tabular-nums">
                {currentMetric} / {targetMetric} <span className="text-accent">({pct}%)</span>
              </span>
            </div>

            <div className="h-2 rounded-full overflow-hidden bg-line/60">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: isUnlocked ? 'var(--success)' : 'var(--accent)',
                }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-muted">
              <span>Goal: {milestone.desc}</span>
              {isUnlocked ? (
                <span className="text-success font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </span>
              ) : (
                <span className="text-accent font-semibold tabular-nums">
                  {targetMetric - currentMetric} remaining
                </span>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="w-full flex items-center gap-3">
            <button
              onClick={onClose}
              className="btn-secondary flex-1 py-2 px-4 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Dismiss
            </button>
            <Link
              to="/problems"
              onClick={onClose}
              className="btn-primary flex-1 py-2 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Practice Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MilestoneDetailModal;
