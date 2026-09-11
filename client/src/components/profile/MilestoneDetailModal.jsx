import React from 'react';
import { Link } from 'react-router-dom';
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
  if (!isOpen || !milestone) return null;

  const isUnlocked = milestone.check ? milestone.check(profile || {}) : false;
  const currentMetric = milestone.metric ? milestone.metric(profile || {}) : 0;
  const targetMetric = milestone.target || 1;
  const pct = Math.min(100, Math.round((currentMetric / targetMetric) * 100));

  const Icon = milestone.iconComponent;
  const badgeColor = milestone.color || '#F97316';
  const badgeBg = milestone.bg || 'rgba(249,115,22,0.12)';
  const badgeBorder = milestone.border || 'rgba(249,115,22,0.3)';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#12151B] border border-white/[0.12] shadow-[0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none opacity-40 blur-3xl"
          style={{ background: badgeColor }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7 flex flex-col items-center text-center relative z-0">
          {/* Badge Icon with Glow Ring */}
          <div className="relative mb-5">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center border-2 transition-transform duration-300 shadow-xl"
              style={{
                backgroundColor: badgeBg,
                borderColor: badgeBorder,
                color: badgeColor,
                boxShadow: `0 8px 32px ${badgeColor}33`,
              }}
            >
              {Icon && <Icon className="w-12 h-12" />}
            </div>

            {/* Unlocked / Locked Mini Status Pill */}
            <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border shadow-md ${
              isUnlocked
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-zinc-800 border-white/[0.1] text-zinc-400'
            }`}>
              {isUnlocked ? (
                <>
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>UNLOCKED</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-zinc-400" />
                  <span>LOCKED</span>
                </>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="text-xl font-bold text-[#F3F4F6] tracking-tight mb-1">
            {milestone.label}
          </h3>
          <p className="text-xs text-[#9CA3AF] max-w-xs mb-5">
            {milestone.desc}
          </p>

          {/* Progress Card */}
          <div className="w-full p-4 rounded-xl bg-[#0D0F13] border border-white/[0.08] mb-5">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-[#9CA3AF]">Progress toward unlock:</span>
              <span className="font-bold text-[#F3F4F6]">
                {currentMetric} / {targetMetric} <span className="text-[#F97316]">({pct}%)</span>
              </span>
            </div>

            <div className="h-2 rounded-full overflow-hidden bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: isUnlocked
                    ? 'linear-gradient(90deg, #10B981, #34D399)'
                    : `linear-gradient(90deg, ${badgeColor}66, ${badgeColor})`,
                  boxShadow: `0 0 10px ${badgeColor}44`,
                }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-[#6B7280] font-mono">
              <span>Goal: {milestone.desc}</span>
              {isUnlocked ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </span>
              ) : (
                <span className="text-amber-400 font-semibold">
                  {targetMetric - currentMetric} remaining
                </span>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="w-full flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-[#F3F4F6] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer"
            >
              Dismiss
            </button>
            <Link
              to="/problems"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-[0_2px_14px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Practice Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneDetailModal;
